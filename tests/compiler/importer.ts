import 'mocha';
import { assert } from 'chai';
import { Diagnostic } from '../../src/diagnostic/diagnostic';
import { Importer } from '../../src/importer/importer';
import { Lexer } from '../../src/lexer/lexer';
import { Parser } from '../../src/parser/parser';
import path from 'path';
import Sinon from 'sinon';
import { SyntaxCreator } from '../utility/syntaxCreator';
import { TokenCreator } from '../utility/tokenCreator';

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
                const filePathStub = __filename;

                const importSyntaxNode = SyntaxCreator.newImport(
                    TokenCreator.newString('/' + path.basename(filePathStub))
                );

                const input = SyntaxCreator.newFile(
                    undefined,
                    [importSyntaxNode]
                );

                const importedFile = SyntaxCreator.newFile();

                parserStub.run.returns(importedFile);

                const result = importer.run(input, filePathStub);

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
