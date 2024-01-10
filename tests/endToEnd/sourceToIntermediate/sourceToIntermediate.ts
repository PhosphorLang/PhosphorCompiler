import 'mocha';
import * as Diagnostic from '../../../src/diagnostic';
import { assert } from 'chai';
import { Connector } from '../../../src/connector/connector';
import FileSystem from 'fs';
import { IntermediateLowerer } from '../../../src/intermediateLowerer/intermediateLowerer';
import { Lexer } from '../../../src/lexer/lexer';
import { Parser } from '../../../src/parser/parser';
import Path from 'path';
import SemanticLowerer from '../../../src/semanticLowerer/semanticLowerer';
import { TranspilerIntermediate } from '../../../src/transpiler/intermediate/transpilerIntermediate';

describe('The compiler returns the correct intermediate for',
    function ()
    {
        let diagnostic: Diagnostic.Diagnostic;
        let lexer: Lexer;
        let parser: Parser;
        let connector: Connector;
        let semanticLowerer: SemanticLowerer;
        let intermediateLowerer: IntermediateLowerer;
        let transpiler: TranspilerIntermediate;
        // TODO: Replace the manual compilation here with the new PhosphorCompiler class.

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
            const loweredTree = semanticLowerer.run(semanticTree);
            const intermediateTree = intermediateLowerer.run(loweredTree, new Set());
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
                semanticLowerer = new SemanticLowerer();
                intermediateLowerer = new IntermediateLowerer();
                transpiler = new TranspilerIntermediate();
            }
        );

        it('an empty module.',
            function ()
            {
                expectCompiledEquality('emptyModule');
            }
        );

        it('an empty main function.',
            function ()
            {
                expectCompiledEquality('emptyMain');
            }
        );

        it('function definition and call.',
            function ()
            {
                expectCompiledEquality('functions');
            }
        );

        it('if and else.',
            function ()
            {
                expectCompiledEquality('ifElse');
            }
        );

        it('a while loop.',
            function ()
            {
                expectCompiledEquality('whileLoop');
            }
        );

        it('math expressions.',
            function ()
            {
                expectCompiledEquality('math');
            }
        );

        it('bitwise expressions.',
            function ()
            {
                expectCompiledEquality('bitwise');
            }
        );

        it('logical expressions.',
            function ()
            {
                expectCompiledEquality('logic');
            }
        );

        it('string constants and operations.',
            function ()
            {
                expectCompiledEquality('strings');
            }
        );
    }
);
