import 'mocha';
import { assert } from 'chai';

import Lexer from '../../src/lexer/lexer';
import TokenCreator from '../utility/tokenCreator';
import UnknownSymbolError from '../../src/errors/unknownSymbolError';

describe('Lexer',
    function ()
    {
        it('ignores whitespaces.',
            function ()
            {
                const input = '24                   8';

                const expectedResult = [
                    TokenCreator.newFile('testFile'),
                    TokenCreator.newNumber('24'),
                    TokenCreator.newNumber('8'),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, 'testFile', false);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can tokenise an integer literal.',
            function ()
            {
                const input = '24';

                const expectedResult = [
                    TokenCreator.newFile('testFile'),
                    TokenCreator.newNumber('24'),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, 'testFile', false);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can tokenise a string literal.',
            function ()
            {
                const input = "'My string'";

                const expectedResult = [
                    TokenCreator.newFile('testFile'),
                    TokenCreator.newString('My string'),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, 'testFile', false);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can tokenise a function call.',
            function ()
            {
                const input = 'print();';

                const expectedResult = [
                    TokenCreator.newFile('testFile'),
                    TokenCreator.newIdentificator('print'),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, 'testFile', false);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can tokenise an integer parameter.',
            function ()
            {
                const input = 'print(8);';

                const expectedResult = [
                    TokenCreator.newFile('testFile'),
                    TokenCreator.newIdentificator('print'),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newNumber('8'),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, 'testFile', false);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can tokenise a string parameter.',
            function ()
            {
                const input = "print('My test parameter string');";

                const expectedResult = [
                    TokenCreator.newFile('testFile'),
                    TokenCreator.newIdentificator('print'),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newString('My test parameter string'),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, 'testFile', false);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can tokenise an addition as parameter.',
            function ()
            {
                const input = "print(24 + 8);";

                const expectedResult = [
                    TokenCreator.newFile('testFile'),
                    TokenCreator.newIdentificator('print'),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newNumber('24'),
                    TokenCreator.newPlus(),
                    TokenCreator.newNumber('8'),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, 'testFile', false);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can tokenise a variable declaration.',
            function ()
            {
                const input = "var testVariable;";

                const expectedResult = [
                    TokenCreator.newFile('testFile'),
                    TokenCreator.newVar(),
                    TokenCreator.newIdentificator('testVariable'),
                    TokenCreator.newSemicolon(),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, 'testFile', false);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can tokenise a variable assignment.',
            function ()
            {
                const input = "testVariable := 8;";

                const expectedResult = [
                    TokenCreator.newFile('testFile'),
                    TokenCreator.newIdentificator('testVariable'),
                    TokenCreator.newAssignment(),
                    TokenCreator.newNumber('8'),
                    TokenCreator.newSemicolon(),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, 'testFile', false);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can tokenise a variable as parameter.',
            function ()
            {
                const input = "print(testVariable);";

                const expectedResult = [
                    TokenCreator.newFile('testFile'),
                    TokenCreator.newIdentificator('print'),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newIdentificator('testVariable'),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, 'testFile', false);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('sets correct line information.',
            function ()
            {
                const input = "a\nb c\nd";

                const expectedResult = [
                    TokenCreator.newFile('testFile'),
                    TokenCreator.newIdentificator('a', 1, 1),
                    TokenCreator.newIdentificator('b', 2, 1),
                    TokenCreator.newIdentificator('c', 2, 3),
                    TokenCreator.newIdentificator('d', 3, 1),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, 'testFile');

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('throws an exception at unknown tokens.',
            function ()
            {
                const input = '§';

                const lexer = new Lexer();

                assert.throws(
                    (): void => { lexer.run(input, 'testFile', false); },
                    UnknownSymbolError
                );
            }
        );
    }
);
