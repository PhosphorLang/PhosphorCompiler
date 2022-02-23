import 'mocha';
import { assert } from 'chai';
import Diagnostic from '../../src/diagnostic/diagnostic';
import Importer from '../../src/importer/importer';
import Lexer from '../../src/lexer/lexer';
import Parser from '../../src/parser/parser';
import Sinon from 'sinon';
import SyntaxCreator from '../utility/syntaxCreator';
import TokenCreator from '../utility/tokenCreator';

describe('Importer',
    function ()
    {
        let diagnostic: Diagnostic;
        let importer: Importer;
        let parserStub: Sinon.SinonStubbedInstance<Parser>;

        beforeEach(
            function ()
            {
                diagnostic = new Diagnostic();

                const lexerStub = Sinon.createStubInstance(Lexer);
                lexerStub.run.returns([]);

                parserStub = Sinon.createStubInstance(Parser);

                parserStub.run.throws(new Error('ParserStub.run has not been given a return value in the test.'));

                importer = new Importer(diagnostic, lexerStub, parserStub);
            }
        );

        it('can import a single empty file.',
            function ()
            {
                const importSyntaxNode = SyntaxCreator.newImport(
                    TokenCreator.newString('/null')
                );

                const input = SyntaxCreator.newFile(
                    undefined,
                    [importSyntaxNode]
                );

                const importedFile = SyntaxCreator.newFile();

                parserStub.run.returns(importedFile);

                // NOTE: Using "/dev/null" is two hacks in one:
                // 1. It doesn't matter what the file path is, as long as it is a valid file. Thus /dev/null is enough.
                //    The reason for this is that the importer will read the file but the lexer and parser stub will return fixed values
                //    no matter the given file contents.
                // 2. The function expects a FILE path, not a directory, thus the double "null", once here and another one in the import.
                const result = importer.run(input, '/dev/null');

                assert.hasAllDeepKeys(
                    result,
                    [importSyntaxNode]
                );

                const outputFile = result.get(importSyntaxNode);

                assert.deepStrictEqual(outputFile, importedFile);
            }
        );
    }
);
