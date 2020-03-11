import 'mocha';
import { assert } from 'chai';

import Lexer from '../../src/lexer/lexer';
import LexicalType from '../../src/lexer/lexicalType';
import Operator from '../../src/definitions/operator';
import Token from '../../src/lexer/token';

describe('Lexer',
    function ()
    {
        const fileName = 'testFile';

        it('can tokenise an integer literal.',
            function ()
            {
                const input = '24';

                const expectedResult = [
                    new Token(LexicalType.File, fileName),
                    new Token(LexicalType.Number, '24'),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can tokenise a string literal.',
            function ()
            {
                const input = "'My string'";

                const expectedResult = [
                    new Token(LexicalType.File, fileName),
                    new Token(LexicalType.String, 'My string'),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can tokenise a function call.',
            function ()
            {
                const input = 'print();';

                const expectedResult = [
                    new Token(LexicalType.File, fileName),
                    new Token(LexicalType.Id, 'print'),
                    new Token(LexicalType.Operator, Operator.openingBracket),
                    new Token(LexicalType.Operator, Operator.closingBracket),
                    new Token(LexicalType.Operator, Operator.semicolon),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can tokenise an integer parameter.',
            function ()
            {
                const input = 'print(8);';

                const expectedResult = [
                    new Token(LexicalType.File, fileName),
                    new Token(LexicalType.Id, 'print'),
                    new Token(LexicalType.Operator, Operator.openingBracket),
                    new Token(LexicalType.Number, '8'),
                    new Token(LexicalType.Operator, Operator.closingBracket),
                    new Token(LexicalType.Operator, Operator.semicolon),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can tokenise a string parameter.',
            function ()
            {
                const input = "print('My test parameter string');";

                const expectedResult = [
                    new Token(LexicalType.File, fileName),
                    new Token(LexicalType.Id, 'print'),
                    new Token(LexicalType.Operator, Operator.openingBracket),
                    new Token(LexicalType.String, 'My test parameter string'),
                    new Token(LexicalType.Operator, Operator.closingBracket),
                    new Token(LexicalType.Operator, Operator.semicolon),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('throws an exception at unknown tokens.',
            function ()
            {
                const input = '§';

                const lexer = new Lexer();

                assert.throws(
                    (): void => { lexer.run(input, fileName); }
                );
            }
        );
    }
);
