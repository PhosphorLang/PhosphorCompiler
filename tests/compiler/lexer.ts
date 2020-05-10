import 'mocha';
import { assert } from 'chai';
import Defaults from '../utility/defaults';
import Lexer from '../../src/lexer/lexer';
import TokenCreator from '../utility/tokenCreator';
import TokenKind from '../../src/lexer/tokenKind';
import UnknownSymbolError from '../../src/errors/unknownSymbolError';
import UnterminatedStringError from '../../src/errors/unterminatedStringError';

class InputToTokenKind
{
    public readonly input: string;
    public readonly tokenKind: TokenKind;
    public readonly text: string;

    constructor (input: string, tokenKind: TokenKind, text: string)
    {
        this.input = input;
        this.tokenKind = tokenKind;
        this.text = text;
    }
}

describe('Lexer',
    function ()
    {
        it('ignores whitespaces.',
            function ()
            {
                const input = '    ';

                const lexer = new Lexer();

                const result = lexer.run(input, 'testFile', false);

                assert.isEmpty(result);
            }
        );

        it('ignores new lines.',
            function ()
            {
                const input = '\n\n\n\n';

                const lexer = new Lexer();

                const result = lexer.run(input, 'testFile', false);

                assert.isEmpty(result);
            }
        );


        // A list of inputs to their resulting token kind to automatically create combination tests out of that.
        // This lists only include the tokens that do not need any delimiters to other tokens (e.g. spaces).
        const nonDelimitedInputToTokenKindList: InputToTokenKind[] = [
            new InputToTokenKind("'a'", TokenKind.StringToken, 'a single char string literal'),
            new InputToTokenKind('(', TokenKind.OpeningParenthesisToken, 'an opening parenthesis'),
            new InputToTokenKind(')', TokenKind.ClosingParenthesisToken, 'a closing parenthesis'),
            new InputToTokenKind('{', TokenKind.OpeningBraceToken, 'an opening brace'),
            new InputToTokenKind('}', TokenKind.ClosingBraceToken, 'a closing brace'),
            new InputToTokenKind(':', TokenKind.ColonToken, 'a colon'),
            new InputToTokenKind(';', TokenKind.SemicolonToken, 'a semicolon'),
            new InputToTokenKind(',', TokenKind.CommaToken, 'a comma'),
            new InputToTokenKind(':=', TokenKind.AssignmentOperator, 'an assignment operator'),
            new InputToTokenKind('+', TokenKind.PlusOperator, 'a plus operator'),
            new InputToTokenKind('-', TokenKind.MinusOperator, 'a minus operator'),
            new InputToTokenKind('*', TokenKind.StarOperator, 'a star operator'),
            new InputToTokenKind('/', TokenKind.SlashOperator, 'a slash operator'),
        ];

        // A list of inputs to their resulting token kind to automatically create tests out of that:
        const inputToTokenKindList: InputToTokenKind[] = [
            ...nonDelimitedInputToTokenKindList,
            new InputToTokenKind("'abc'", TokenKind.StringToken, 'a multi char string literal'),
            new InputToTokenKind("'my string'", TokenKind.StringToken, 'a string literal containing whitespace'),
            new InputToTokenKind('myIdentifier', TokenKind.IdentifierToken, 'an identifier'),
            new InputToTokenKind('8', TokenKind.IntegerToken, 'a single digit integer literal'),
            new InputToTokenKind('24', TokenKind.IntegerToken, 'a multi digit integer literal'),
            new InputToTokenKind('var', TokenKind.VarKeyword, 'the var keyword'),
            new InputToTokenKind('function', TokenKind.FunctionKeyword, 'the function keyword'),
            new InputToTokenKind('return', TokenKind.ReturnKeyword, 'the return keyword'),
        ];

        describe('can tokenise',
            function ()
            {
                // Create a test case for every possible token:
                for (const inputToTokenKind of inputToTokenKindList)
                {
                    it(`${inputToTokenKind.text}.`,
                        function ()
                        {
                            const lexer = new Lexer();

                            const result = lexer.run(inputToTokenKind.input, 'testFile', false);

                            assert.strictEqual(result.length, 1);
                            assert.strictEqual(result[0].kind, inputToTokenKind.tokenKind);
                        }
                    );
                }

            }
        );

        describe('can handle non-delimited combinations',
            function ()
            {
                // Create a test case for every possible non-delimited token combination:
                for (const leftInputToTokenKind of nonDelimitedInputToTokenKindList)
                {
                    for (const rightInputToTokenKind of nonDelimitedInputToTokenKindList)
                    {
                        it(`of ${leftInputToTokenKind.text} and ${rightInputToTokenKind.text}.`,
                            function ()
                            {
                                const input = leftInputToTokenKind.input + rightInputToTokenKind.input;

                                const lexer = new Lexer();

                                const result = lexer.run(input, 'testFile', false);

                                assert.strictEqual(result.length, 2);
                                assert.strictEqual(result[0].kind, leftInputToTokenKind.tokenKind);
                                assert.strictEqual(result[1].kind, rightInputToTokenKind.tokenKind);
                            }
                        );
                    }
                }
            }
        );

        it('sets correct line information.',
            function ()
            {
                const input = "a\nb c\nd";

                const expectedResult = [
                    TokenCreator.newIdentifier('a', 1, 1),
                    TokenCreator.newIdentifier('b', 2, 1),
                    TokenCreator.newIdentifier('c', 2, 3),
                    TokenCreator.newIdentifier('d', 3, 1),
                ];

                const lexer = new Lexer();

                const result = lexer.run(input, 'testFile');

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('throws an exception at an unterminated string before line ending.',
            function ()
            {
                const input = `'${Defaults.string}\n`;

                const lexer = new Lexer();

                assert.throws(
                    (): void => { lexer.run(input, 'testFile', false); },
                    UnterminatedStringError
                );
            }
        );

        it('throws an exception at an unterminated string before file ending.',
            function ()
            {
                const input = `'${Defaults.string}`;

                const lexer = new Lexer();

                assert.throws(
                    (): void => { lexer.run(input, 'testFile', false); },
                    UnterminatedStringError
                );
            }
        );

        it('throws an exception at unknown tokens.',
            function ()
            {
                const input = Defaults.unknown;

                const lexer = new Lexer();

                assert.throws(
                    (): void => { lexer.run(input, 'testFile', false); },
                    UnknownSymbolError
                );
            }
        );
    }
);
