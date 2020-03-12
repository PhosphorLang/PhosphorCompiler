import 'mocha';
import { assert } from 'chai';

import Parser from '../../src/parser/parser';
import TokenCreator from '../utility/tokenCreator';

describe('Parser',
    function ()
    {
        const fileName = 'testFile';

        it('can parse a function call.',
            function ()
            {
                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newFunctionCall(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = new SyntaxTreeNode(null, input[0]);
                new SyntaxTreeNode(expectedResult, input[1]);

                const parser = new Parser();

                const result = parser.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an integer parameter.',
            function ()
            {
                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newFunctionCall(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newNumber(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = new SyntaxTreeNode(null, new Token(LexicalType.File, fileName));
                new SyntaxTreeNode(expectedResult, new Token(LexicalType.Id, 'print'));
                new SyntaxTreeNode(expectedResult.children[0], new Token(LexicalType.Number, '24'));

                const parser = new Parser();

                const result = parser.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a string parameter.',
            function ()
            {
                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newFunctionCall(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newString(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = new SyntaxTreeNode(null, new Token(LexicalType.File, fileName));
                new SyntaxTreeNode(expectedResult, new Token(LexicalType.Id, 'print'));
                new SyntaxTreeNode(expectedResult.children[0], new Token(LexicalType.String, 'Test string'));

                const parser = new Parser();

                const result = parser.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('throws an exception at unknown tokens.',
            function ()
            {
                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newFunctionCall(),
                    TokenCreator.newUnknownOperator(),
                ];

                const parser = new Parser();

                assert.throws(
                    (): void => { parser.run(input); } // TODO: Add specific error as soon as there are ones.
                );
            }
        );
    }
);
