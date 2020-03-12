import 'mocha';
import { assert } from 'chai';

import LexicalType from '../../src/lexer/lexicalType';
import Operator from '../../src/definitions/operator';
import Parser from '../../src/parser/parser';
import SyntaxTreeNode from '../../src/parser/syntaxTreeNode';
import Token from '../../src/lexer/token';

describe('Parser',
    function ()
    {
        const fileName = 'testFile';

        it('can parse a function call.',
            function ()
            {
                const input = [
                    new Token(LexicalType.File, fileName),
                    new Token(LexicalType.Id, 'print'),
                    new Token(LexicalType.Operator, Operator.openingBracket),
                    new Token(LexicalType.Operator, Operator.closingBracket),
                    new Token(LexicalType.Operator, Operator.semicolon),
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
                    new Token(LexicalType.File, fileName),
                    new Token(LexicalType.Id, 'print'),
                    new Token(LexicalType.Operator, Operator.openingBracket),
                    new Token(LexicalType.Number, '24'),
                    new Token(LexicalType.Operator, Operator.closingBracket),
                    new Token(LexicalType.Operator, Operator.semicolon),
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
                    new Token(LexicalType.File, fileName),
                    new Token(LexicalType.Id, 'print'),
                    new Token(LexicalType.Operator, Operator.openingBracket),
                    new Token(LexicalType.String, 'Test string'),
                    new Token(LexicalType.Operator, Operator.closingBracket),
                    new Token(LexicalType.Operator, Operator.semicolon),
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
                    new Token(LexicalType.File, fileName),
                    new Token(LexicalType.Id, 'print'),
                    new Token(LexicalType.Operator, '§'),
                ];

                const parser = new Parser();

                assert.throws(
                    (): void => { parser.run(input); } // TODO: Add specific error as soon as there are ones.
                );
            }
        );
    }
);
