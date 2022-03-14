import 'mocha';
import { assert } from 'chai';
import { Connector } from '../../src/connector/connector';
import { Diagnostic } from '../../src/diagnostic/diagnostic';
import FileSystem from 'fs';
import { ImportNodeToFileNode } from '../../src/importer/importNodeToFileNode';
import { Lexer } from '../../src/lexer/lexer';
import { Lowerer } from '../../src/lowerer/lowerer';
import { Parser } from '../../src/parser/parser';
import Path from 'path';
import { Transpiler } from '../../src/transpiler/transpiler';
import { TranspilerIntermediate } from '../../src/transpiler/intermediate/transpilerIntermediate';

describe('End-to-end, the compiler',
    function ()
    {
        let diagnostic: Diagnostic;
        let lexer: Lexer;
        let parser: Parser;
        let connector: Connector;
        let lowerer: Lowerer;
        let transpiler: Transpiler;

        function readInputFile (fileName: string): string
        {
            return FileSystem.readFileSync(Path.join(__dirname, 'inputs', fileName), {encoding: 'utf8'});
        }

        function readOutputFile (fileName: string): string
        {
            return FileSystem.readFileSync(Path.join(__dirname, 'outputs', fileName), {encoding: 'utf8'});
        }

        function compile (input: string): string
        {
            const tokens = lexer.run(input, '');
            const syntaxTree = parser.run(tokens, '');
            const semanticTree = connector.run(syntaxTree, new ImportNodeToFileNode());
            const intermediateTree = lowerer.run(semanticTree);
            const intermediateCode = transpiler.run(intermediateTree);

            return intermediateCode;
        }

        beforeEach(
            function ()
            {
                diagnostic = new Diagnostic();

                lexer = new Lexer(diagnostic);
                parser = new Parser(diagnostic);
                connector = new Connector(diagnostic);
                lowerer = new Lowerer();
                transpiler = new TranspilerIntermediate();
            }
        );

        it('can compile an empty file.',
            function ()
            {
                const input = readInputFile('emptyFile.ph');

                const expectedResult = readOutputFile('emptyFile.phi');

                const result = compile(input);

                diagnostic.end();

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can compile an empty main function.',
            function ()
            {
                const input = readInputFile('emptyMain.ph');

                const expectedResult = readOutputFile('emptyMain.phi');

                const result = compile(input);

                diagnostic.end();

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can compile function definition and call.',
            function ()
            {
                const input = readInputFile('functions.ph');

                const expectedResult = readOutputFile('functions.phi');

                const result = compile(input);

                diagnostic.end();

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can compile if and else.',
            function ()
            {
                const input = readInputFile('ifElse.ph');

                const expectedResult = readOutputFile('ifElse.phi');

                const result = compile(input);

                diagnostic.end();

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can compile a while loop.',
            function ()
            {
                const input = readInputFile('whileLoop.ph');

                const expectedResult = readOutputFile('whileLoop.phi');

                const result = compile(input);

                diagnostic.end();

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can compile math expressions.',
            function ()
            {
                const input = readInputFile('math.ph');

                const expectedResult = readOutputFile('math.phi');

                const result = compile(input);

                diagnostic.end();

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can compile string constants and operations.',
            function ()
            {
                const input = readInputFile('strings.ph');

                const expectedResult = readOutputFile('strings.phi');

                const result = compile(input);

                diagnostic.end();

                assert.deepStrictEqual(result, expectedResult);
            }
        );
    }
);
