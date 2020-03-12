import 'mocha';
import { assert } from 'chai';

import Lexer from '../../src/lexer/lexer';
import TokenCreator from '../utility/tokenCreator';

describe('Lexer',
    function ()
    {
        const fileName = 'testFile';

        it('can tokenise an integer literal.',
            function ()
            {
                const input = '24';

                const expectedResult = [
                    TokenCreator.newFile(),
                    TokenCreator.newNumber('24'),
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
                    TokenCreator.newFile(),
                    TokenCreator.newString('My string'),
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
                    TokenCreator.newFile(),
                    TokenCreator.newFunctionCall('print'),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
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
                    TokenCreator.newFile(),
                    TokenCreator.newFunctionCall('print'),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newNumber('8'),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
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
                    TokenCreator.newFile(),
                    TokenCreator.newFunctionCall('print'),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newString('My test parameter string'),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
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
