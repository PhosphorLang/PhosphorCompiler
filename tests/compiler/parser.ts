import 'mocha';
import * as Diagnostic from '../../src/diagnostic';
import { assert } from 'chai';
import { Defaults } from '../utility/defaults';
import { Parser } from '../../src/parser/parser';
import { SyntaxCreator } from '../utility/syntaxCreator';
import { TokenCreator } from '../utility/tokenCreator';

describe('Parser',
    function ()
    {
        let diagnostic: Diagnostic.Diagnostic;
        let parser: Parser;

        beforeEach(
            function ()
            {
                diagnostic = new Diagnostic.Diagnostic();

                parser = new Parser(diagnostic);
            }
        );

        it('can parse an empty module.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = SyntaxCreator.newFile();

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a function declaration.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newClosingCurlyBrackets(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration()
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a function declaration with a parameter.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newColon(),
                    TokenCreator.newTypeIdentifier(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newClosingCurlyBrackets(),
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

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a call statement.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
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

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a call statement with an argument.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newInteger(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
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

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a variable declaration.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newVarKeyword(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newColon(),
                    TokenCreator.newTypeIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
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

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a variable assignment.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
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

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an integer addition.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newInteger(),
                    TokenCreator.newPlus(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
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

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an equal operator.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newInteger(),
                    TokenCreator.newEqual(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newBinaryExpression(
                                            SyntaxCreator.newIntegerLiteral(),
                                            TokenCreator.newEqual(),
                                            SyntaxCreator.newIntegerLiteral()
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a non equal operator.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newInteger(),
                    TokenCreator.newNotEqual(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newBinaryExpression(
                                            SyntaxCreator.newIntegerLiteral(),
                                            TokenCreator.newNotEqual(),
                                            SyntaxCreator.newIntegerLiteral()
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a less operator.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newInteger(),
                    TokenCreator.newLess(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newBinaryExpression(
                                            SyntaxCreator.newIntegerLiteral(),
                                            TokenCreator.newLess(),
                                            SyntaxCreator.newIntegerLiteral()
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a greater operator.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newInteger(),
                    TokenCreator.newGreater(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newBinaryExpression(
                                            SyntaxCreator.newIntegerLiteral(),
                                            TokenCreator.newGreater(),
                                            SyntaxCreator.newIntegerLiteral()
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a not operator.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newNot(),
                    TokenCreator.newFalseKeyword(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newUnaryExpression(
                                            SyntaxCreator.newFalseBooleanLiteral(),
                                            TokenCreator.newNot()
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an and operator.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newTrueKeyword(),
                    TokenCreator.newAnd(),
                    TokenCreator.newTrueKeyword(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newBinaryExpression(
                                            SyntaxCreator.newTrueBooleanLiteral(),
                                            TokenCreator.newAnd(),
                                            SyntaxCreator.newTrueBooleanLiteral()
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an or operator.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newTrueKeyword(),
                    TokenCreator.newOr(),
                    TokenCreator.newFalseKeyword(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newBinaryExpression(
                                            SyntaxCreator.newTrueBooleanLiteral(),
                                            TokenCreator.newOr(),
                                            SyntaxCreator.newFalseBooleanLiteral()
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a parenthesized expression.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newInteger(),
                    TokenCreator.newPlus(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newInteger(),
                    TokenCreator.newPlus(),
                    TokenCreator.newInteger(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newAddition(
                                            SyntaxCreator.newIntegerLiteral(),
                                            SyntaxCreator.newBracketedExpression(
                                                SyntaxCreator.newIntegerAddition()
                                            )
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an empty return statement.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newReturnKeyword(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
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

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a function returning a value.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newColon(),
                    TokenCreator.newTypeIdentifier(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newReturnKeyword(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
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

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an algebraic sign.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newMinus(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
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

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a variable expression.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
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

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an if statement.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newIfKeyword(),
                    TokenCreator.newTrueKeyword(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newClosingCurlyBrackets(),
                    TokenCreator.newClosingCurlyBrackets(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newIfStatement()
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an if else statement.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newIfKeyword(),
                    TokenCreator.newFalseKeyword(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newClosingCurlyBrackets(),
                    TokenCreator.newElseKeyword(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newClosingCurlyBrackets(),
                    TokenCreator.newClosingCurlyBrackets(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newIfStatement(
                                        SyntaxCreator.newFalseBooleanLiteral(),
                                        undefined,
                                        SyntaxCreator.newElseClause()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an if else if statement.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newIfKeyword(),
                    TokenCreator.newFalseKeyword(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newClosingCurlyBrackets(),
                    TokenCreator.newElseKeyword(),
                    TokenCreator.newIfKeyword(),
                    TokenCreator.newTrueKeyword(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newClosingCurlyBrackets(),
                    TokenCreator.newClosingCurlyBrackets(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newIfStatement(
                                        SyntaxCreator.newFalseBooleanLiteral(),
                                        undefined,
                                        SyntaxCreator.newElseClause(
                                            SyntaxCreator.newIfStatement()
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a while statement.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newWhileKeyword(),
                    TokenCreator.newTrueKeyword(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newClosingCurlyBrackets(),
                    TokenCreator.newClosingCurlyBrackets(),
                ];

                const expectedResult = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newWhileStatement()
                                ]
                            )
                        )
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a import statement.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newImportKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newReturnKeyword(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
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
                    ],
                    [
                        SyntaxCreator.newImport()
                    ]
                );

                const result = parser.run(input, Defaults.fileName);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('throws an exception if there is no semicolon after a statement.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newClosingCurlyBrackets(),
                ];

                assert.throws(
                    (): void => { parser.run(input, Defaults.fileName); },
                    Diagnostic.Codes.MissingSemicolonAfterStatementError
                );
            }
        );

        it('throws an exception if there is something else than an identifier in a variable declaration.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newVarKeyword(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
                ];

                assert.throws(
                    (): void => { parser.run(input, Defaults.fileName); },
                    Diagnostic.Codes.UnexpectedTokenAfterVariableDeclarationIdentifierError
                );
            }
        );

        it('throws an exception if a variable declaration has no type clause.',
            function ()
            {
                const input = [
                    TokenCreator.newModuleKeyword(),
                    TokenCreator.newModuleIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newFunctionKeyword(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningRoundBrackets(),
                    TokenCreator.newClosingRoundBrackets(),
                    TokenCreator.newOpeningCurlyBrackets(),
                    TokenCreator.newVarKeyword(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newClosingCurlyBrackets(),
                ];

                assert.throws(
                    (): void => { parser.run(input, Defaults.fileName); },
                    Diagnostic.Codes.UnexpectedTokenAfterVariableDeclarationIdentifierError
                );
            }
        );
    }
);
