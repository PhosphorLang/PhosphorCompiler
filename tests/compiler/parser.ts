import 'mocha';
import { assert } from 'chai';
import Defaults from '../utility/defaults';
import InvalidTokenError from '../../src/errors/invalidTokenError';
import Parser from '../../src/parser/parser';
import SyntaxCreator from '../utility/syntaxCreator';
import TokenCreator from '../utility/tokenCreator';
import UnexpectedTokenError from '../../src/errors/unexpectedTokenError';

describe('Parser',
    function ()
    {
        it('can parse an empty file.',
            function ()
            {
                const expectedResult = SyntaxCreator.newFile();

                const parser = new Parser();

                const result = parser.run([], Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a function declaration.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration()
                    ]
                );

                const parser = new Parser();

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a function declaration with a parameter.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newColon(),
                    TokenCreator.newTypeIdentifier(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            undefined,
                            SyntaxCreator.newFunctionParametersList(
                                [
                                    SyntaxCreator.newFunctionParameter()
                                ]
                            )
                        )
                    ]
                );

                const parser = new Parser();

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a call statement.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newFunctionCall()
                                ]
                            )
                        )
                    ]
                );

                const parser = new Parser();

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a call statement with an argument.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newInteger(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newFunctionCall(
                                        SyntaxCreator.newCallArgumentsList(
                                            [
                                                SyntaxCreator.newIntegerLiteral()
                                            ]
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const parser = new Parser();

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a variable declaration.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVarKeyword(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newColon(),
                    TokenCreator.newTypeIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newVariableDeclaration(
                                        undefined,
                                        SyntaxCreator.newTypeClause()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const parser = new Parser();

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a variable assignment.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newIntegerLiteral()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const parser = new Parser();

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an integer addition.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newInteger(),
                    TokenCreator.newPlus(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newIntegerAddition()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const parser = new Parser();

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a parenthesized expression.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newInteger(),
                    TokenCreator.newPlus(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newInteger(),
                    TokenCreator.newPlus(),
                    TokenCreator.newInteger(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newAddition(
                                            SyntaxCreator.newIntegerLiteral(),
                                            SyntaxCreator.newParenthesizedExpression(
                                                SyntaxCreator.newIntegerAddition()
                                            )
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const parser = new Parser();

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an empty return statement.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newReturnKeyword(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newReturn()
                                ]
                            )
                        )
                    ]
                );

                const parser = new Parser();

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a function returning a value.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newColon(),
                    TokenCreator.newTypeIdentifier(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newReturnKeyword(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newReturn(
                                        SyntaxCreator.newIntegerLiteral()
                                    )
                                ]
                            ),
                            undefined,
                            SyntaxCreator.newTypeClause()
                        )
                    ]
                );

                const parser = new Parser();

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an algebraic sign.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newMinus(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newIntegerNegation()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const parser = new Parser();

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a variable expression.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newFunctionCall(
                                        SyntaxCreator.newCallArgumentsList(
                                            [
                                                SyntaxCreator.newVariableExpression()
                                            ]
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const parser = new Parser();

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('throws an exception if there is no semicolon after a statement.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newClosingBrace(),
                ];

                const parser = new Parser();

                assert.throws(
                    (): void => { parser.run(input, Defaults.fileName); },
                    InvalidTokenError
                );
            }
        );

        it('throws an exception if there is something else than an identifier in a variable declaration.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVarKeyword(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const parser = new Parser();

                assert.throws(
                    (): void => { parser.run(input, Defaults.fileName); },
                    UnexpectedTokenError
                );
            }
        );

        it('throws an exception if a variable declaration has no type clause.',
            function ()
            {
                const input = [
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningParenthesis(),
                    TokenCreator.newClosingParenthesis(),
                    TokenCreator.newOpeningBrace(),
                    TokenCreator.newVarKeyword(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingBrace(),
                ];

                const parser = new Parser();

                assert.throws(
                    (): void => { parser.run(input, Defaults.fileName); },
                    UnexpectedTokenError
                );
            }
        );
    }
);
