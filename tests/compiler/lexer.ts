import 'mocha';
import { assert } from 'chai';
import { Defaults } from '../utility/defaults';
import { Diagnostic } from '../../src/diagnostic/diagnostic';
import { DiagnosticCodes } from '../../src/diagnostic/diagnosticCodes';
import { Lexer } from '../../src/lexer/lexer';
import { TokenCreator } from '../utility/tokenCreator';
import { TokenKind } from '../../src/lexer/tokenKind';

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
        let diagnostic: Diagnostic;
        let lexer: Lexer;

        beforeEach(
            function ()
            {
                diagnostic = new Diagnostic();

                lexer = new Lexer(diagnostic);
            }
        );

        it('ignores whitespaces.',
            function ()
            {
                const input = '    ';

                const result = lexer.run(input, Defaults.fileName, false);

                assert.isEmpty(result);
            }
        );

        it('ignores new lines.',
            function ()
            {
                const input = '\n\n\n\r\n\r';

                const result = lexer.run(input, Defaults.fileName, false);

                assert.isEmpty(result);
            }
        );

        // A list of inputs to their resulting token kind to automatically create combination tests out of that.
        // This list only includes the tokens that do not need any delimiters to other tokens (e.g. spaces).
        const nonDelimitedInputToTokenKindList: InputToTokenKind[] = [
            new InputToTokenKind("'a'", TokenKind.StringToken, 'a single char string literal'),
            new InputToTokenKind('(', TokenKind.OpeningRoundBracketToken, 'an opening round brackets'),
            new InputToTokenKind(')', TokenKind.ClosingRoundBracketToken, 'a closing round brackets'),
            new InputToTokenKind('{', TokenKind.OpeningCurlyBracketToken, 'an opening curly brackets'),
            new InputToTokenKind('}', TokenKind.ClosingCurlyBracketToken, 'a closing curly brackets'),
            new InputToTokenKind('[', TokenKind.OpeningSquareBracketToken, 'an opening square bracket'),
            new InputToTokenKind(']', TokenKind.ClosingSquareBracketToken, 'a closing square bracket'),
            new InputToTokenKind('.', TokenKind.DotToken, 'a dot'),
            new InputToTokenKind(':', TokenKind.ColonToken, 'a colon'),
            new InputToTokenKind(';', TokenKind.SemicolonToken, 'a semicolon'),
            new InputToTokenKind(',', TokenKind.CommaToken, 'a comma'),
            new InputToTokenKind(':=', TokenKind.AssignmentOperator, 'an assignment operator'),
            new InputToTokenKind('+', TokenKind.PlusOperator, 'a plus operator'),
            new InputToTokenKind('-', TokenKind.MinusOperator, 'a minus operator'),
            new InputToTokenKind('*', TokenKind.StarOperator, 'a star operator'),
            new InputToTokenKind('%', TokenKind.PercentOperator, 'a percent operator'),
            new InputToTokenKind('<', TokenKind.LessOperator, 'a less operator'),
            new InputToTokenKind('>', TokenKind.GreaterOperator, 'a greater operator'),
            new InputToTokenKind('&', TokenKind.AndOperator, 'an and operator'),
            new InputToTokenKind('|', TokenKind.OrOperator, 'an or operator'),
        ];

        // A list of inputs to their resulting token kind to automatically create tests out of that:
        const inputToTokenKindList: InputToTokenKind[] = [
            ...nonDelimitedInputToTokenKindList,
            new InputToTokenKind('=', TokenKind.EqualOperator, 'an equal operator'),
            new InputToTokenKind('!=', TokenKind.NotEqualOperator, 'a not equal operator'),
            new InputToTokenKind('!', TokenKind.NotOperator, 'a not operator'),
            new InputToTokenKind('/', TokenKind.SlashOperator, 'a slash operator'),
            new InputToTokenKind('//', TokenKind.LineCommentToken, 'a line comment'),
            new InputToTokenKind('/**/', TokenKind.BlockCommentToken, 'a block comment'),
            new InputToTokenKind("'abc'", TokenKind.StringToken, 'a multi char string literal'),
            new InputToTokenKind("'my string'", TokenKind.StringToken, 'a string literal containing whitespace'),
            new InputToTokenKind('myIdentifier', TokenKind.IdentifierToken, 'an identifier'),
            new InputToTokenKind('8', TokenKind.IntegerToken, 'a single digit integer literal'),
            new InputToTokenKind('24', TokenKind.IntegerToken, 'a multi digit integer literal'),
            new InputToTokenKind('let', TokenKind.LetKeyword, 'the let keyword'),
            new InputToTokenKind('function', TokenKind.FunctionKeyword, 'the function keyword'),
            new InputToTokenKind('return', TokenKind.ReturnKeyword, 'the return keyword'),
            new InputToTokenKind('header', TokenKind.HeaderKeyword, 'the header keyword'),
            new InputToTokenKind('if', TokenKind.IfKeyword, 'the if keyword'),
            new InputToTokenKind('else', TokenKind.ElseKeyword, 'the else keyword'),
            new InputToTokenKind('while', TokenKind.WhileKeyword, 'the while keyword'),
            new InputToTokenKind('true', TokenKind.TrueKeyword, 'the true keyword'),
            new InputToTokenKind('false', TokenKind.FalseKeyword, 'the false keyword'),
            new InputToTokenKind('new', TokenKind.NewKeyword, 'the new keyword'),
            new InputToTokenKind('module', TokenKind.ModuleKeyword, 'the module keyword'),
            new InputToTokenKind('class', TokenKind.ClassKeyword, 'the class keyword'),
            new InputToTokenKind('import', TokenKind.ImportKeyword, 'the import keyword'),
            new InputToTokenKind('variable', TokenKind.VariableKeyword, 'the variable keyword'),
            new InputToTokenKind('constant', TokenKind.ConstantKeyword, 'the constant keyword'),
            new InputToTokenKind('field', TokenKind.FieldKeyword, 'the field keyword'),
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

                const result = lexer.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('throws an exception at an unterminated string before line ending.',
            function ()
            {
                const input = `'${Defaults.string}\n`;

                assert.throws(
                    (): void => { lexer.run(input, Defaults.fileName, false); },
                    DiagnosticCodes.UnterminatedStringError
                );
            }
        );

        it('throws an exception at an unterminated string before file ending.',
            function ()
            {
                const input = `'${Defaults.string}`;

                assert.throws(
                    (): void => { lexer.run(input, Defaults.fileName, false); },
                    DiagnosticCodes.UnterminatedStringError
                );
            }
        );

        it('throws an exception at unknown tokens.',
            function ()
            {
                const input = Defaults.unknown;

                assert.throws(
                    (): void => { lexer.run(input, Defaults.fileName, false); },
                    DiagnosticCodes.UnknownTokenError
                );
            }
        );
    }
);
