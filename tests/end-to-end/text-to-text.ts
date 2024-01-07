import 'mocha';
import * as Diagnostic from '../../src/diagnostic';
import { assert } from 'chai';
import { Connector } from '../../src/connector/connector';
import FileSystem from 'fs';
import { Lexer } from '../../src/lexer/lexer';
import { Lowerer } from '../../src/lowerer/lowerer';
import { Parser } from '../../src/parser/parser';
import Path from 'path';
import { TranspilerIntermediate } from '../../src/transpiler/intermediate/transpilerIntermediate';

describe('Text-to-text, the compiler',
    function ()
    {
        let diagnostic: Diagnostic.Diagnostic;
        let lexer: Lexer;
        let parser: Parser;
        let connector: Connector;
        let lowerer: Lowerer;
        let transpiler: TranspilerIntermediate;

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
            const semanticTree = connector.run(syntaxTree, new Map());
            const intermediateTree = lowerer.run(semanticTree, new Set());
            const intermediateCode = transpiler.run(intermediateTree);

            return intermediateCode;
        }

        function expectCompiledEquality (fileName: string): void
        {
            const input = readInputFile(fileName + '.ph');

            const expectedResult = readOutputFile(fileName + '.phi');

            const result = compile(input);

            diagnostic.end();

            assert.deepStrictEqual(result, expectedResult);
        }

        beforeEach(
            function ()
            {
                diagnostic = new Diagnostic.Diagnostic();

                lexer = new Lexer(diagnostic);
                parser = new Parser(diagnostic);
                connector = new Connector(diagnostic);
                lowerer = new Lowerer();
                transpiler = new TranspilerIntermediate();
            }
        );

        it('can compile an empty module.',
            function ()
            {
                expectCompiledEquality('emptyModule');
            }
        );

        it('can compile an empty main function.',
            function ()
            {
                expectCompiledEquality('emptyMain');
            }
        );

        it('can compile function definition and call.',
            function ()
            {
                expectCompiledEquality('functions');
            }
        );

        it('can compile if and else.',
            function ()
            {
                expectCompiledEquality('ifElse');
            }
        );

        it('can compile a while loop.',
            function ()
            {
                expectCompiledEquality('whileLoop');
            }
        );

        it('can compile math expressions.',
            function ()
            {
                expectCompiledEquality('math');
            }
        );

        it('can compile bitwise expressions.',
            function ()
            {
                expectCompiledEquality('bitwise');
            }
        );

        it('can compile logical expressions.',
            function ()
            {
                expectCompiledEquality('logic');
            }
        );

        it('can compile string constants and operations.',
            function ()
            {
                expectCompiledEquality('strings');
            }
        );
    }
);
