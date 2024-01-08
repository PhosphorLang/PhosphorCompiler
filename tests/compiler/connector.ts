import 'mocha';
import * as Diagnostic from '../../src/diagnostic';
import { assert } from 'chai';
import { BuildInTypes } from '../../src/definitions/buildInTypes';
import { Connector } from '../../src/connector/connector';
import { SemanticCreator } from '../utility/semanticCreator';
import { SyntaxCreator } from '../utility/syntaxCreator';
import { TokenCreator } from '../utility/tokenCreator';

describe('Connector',
    function ()
    {
        let diagnostic: Diagnostic.Diagnostic;
        let connector: Connector;

        beforeEach(
            function ()
            {
                diagnostic = new Diagnostic.Diagnostic();

                connector = new Connector(diagnostic);
            }
        );

        it('can connect an empty module.',
            function ()
            {
                const input = SyntaxCreator.newFile();

                const expectedResult = SemanticCreator.newFile();

                const result = connector.run(input, new Map());

                assert.deepEqual(result, expectedResult);
            }
        );

        it('can connect a function declaration.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration()
                    ]
                );

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration()
                    ]
                );

                const result = connector.run(input, new Map());

                // HACK: We need to stringify the test objects because otherwise deepEqual falsely fails:
                assert.deepEqual(JSON.stringify(result), JSON.stringify(expectedResult));
            }
        );

        it('can connect a function declaration with a parameter.',
            function ()
            {
                const input = SyntaxCreator.newFile(
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

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            undefined,
                            SemanticCreator.newFunctionSymbol(
                                [
                                    SemanticCreator.newFunctionParameter()
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new Map());

                // HACK: We need to stringify the test objects because otherwise deepEqual falsely fails:
                assert.deepEqual(JSON.stringify(result), JSON.stringify(expectedResult));
            }
        );

        it('can connect a call statement.',
            function ()
            {
                const input = SyntaxCreator.newFile(
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

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newFunctionCall()
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new Map());

                // HACK: We need to stringify the test objects because otherwise deepEqual falsely fails:
                assert.deepEqual(JSON.stringify(result), JSON.stringify(expectedResult));
            }
        );

        it('can parse a call statement with an argument.',
            function ()
            {
                const input = SyntaxCreator.newFile(
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
                            ),
                            SyntaxCreator.newFunctionParametersList(
                                [
                                    SyntaxCreator.newFunctionParameter()
                                ]
                            )
                        )
                    ]
                );

                const functionSymbol = SemanticCreator.newFunctionSymbol(
                    [
                        SemanticCreator.newFunctionParameter()
                    ]
                );

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newFunctionCall(
                                        [
                                            SemanticCreator.newIntegerLiteral()
                                        ],
                                        functionSymbol
                                    )
                                ]
                            ),
                            functionSymbol
                        )
                    ]
                );

                const result = connector.run(input, new Map());

                // HACK: We need to stringify the test objects because otherwise deepEqual falsely fails:
                assert.deepEqual(JSON.stringify(result), JSON.stringify(expectedResult));
            }
        );

        it('can connect a variable declaration.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newLocalVariableDeclaration(
                                        undefined,
                                        SyntaxCreator.newTypeClause()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newLocalVariableDeclaration()
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new Map());

                // HACK: We need to stringify the test objects because otherwise deepEqual falsely fails:
                assert.deepEqual(JSON.stringify(result), JSON.stringify(expectedResult));
            }
        );

        it('can connect a variable assignment.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newLocalVariableDeclaration(
                                        undefined,
                                        SyntaxCreator.newTypeClause(),
                                        false
                                    ),
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newIntegerLiteral()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newLocalVariableDeclaration(
                                        undefined,
                                        SemanticCreator.newVariableSymbol(undefined, undefined, false)
                                    ),
                                    SemanticCreator.newAssignment(
                                        SemanticCreator.newIntegerLiteral(),
                                        SemanticCreator.newVariableSymbol(undefined, undefined, false)
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new Map());

                // HACK: We need to stringify the test objects because otherwise deepEqual falsely fails:
                assert.deepEqual(JSON.stringify(result), JSON.stringify(expectedResult));
            }
        );

        it('can connect a variable initialisation.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newLocalVariableDeclaration(
                                        SyntaxCreator.newIntegerLiteral()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newLocalVariableDeclaration(
                                        SemanticCreator.newIntegerLiteral(),
                                        SemanticCreator.newVariableSymbol(undefined, undefined, true)
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new Map());

                // HACK: We need to stringify the test objects because otherwise deepEqual falsely fails:
                assert.deepEqual(JSON.stringify(result), JSON.stringify(expectedResult));
            }
        );

        it('can connect an integer addition.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newLocalVariableDeclaration(
                                        SyntaxCreator.newIntegerAddition()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newLocalVariableDeclaration(
                                        SemanticCreator.newIntegerAddition(),
                                        SemanticCreator.newVariableSymbol(undefined, undefined, true)
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new Map());

                // HACK: We need to stringify the test objects because otherwise deepEqual falsely fails:
                assert.deepEqual(JSON.stringify(result), JSON.stringify(expectedResult));
            }
        );

        it('can connect a bracketed expression.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newLocalVariableDeclaration(
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

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newLocalVariableDeclaration(
                                        SemanticCreator.newIntegerAddition(
                                            SemanticCreator.newIntegerLiteral(),
                                            SemanticCreator.newIntegerAddition()
                                        ),
                                        SemanticCreator.newVariableSymbol(undefined, undefined, true)
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new Map());

                // HACK: We need to stringify the test objects because otherwise deepEqual falsely fails:
                assert.deepEqual(JSON.stringify(result), JSON.stringify(expectedResult));
            }
        );

        it('can connect an empty return statement.',
            function ()
            {
                const input = SyntaxCreator.newFile(
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

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newReturn()
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new Map());

                // HACK: We need to stringify the test objects because otherwise deepEqual falsely fails:
                assert.deepEqual(JSON.stringify(result), JSON.stringify(expectedResult));
            }
        );

        it('can connect a function returning a value.',
            function ()
            {
                const input = SyntaxCreator.newFile(
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

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newReturn(
                                        SemanticCreator.newIntegerLiteral()
                                    )
                                ]
                            ),
                            SemanticCreator.newFunctionSymbol(
                                undefined,
                                BuildInTypes.int
                            )
                        )
                    ]
                );

                const result = connector.run(input, new Map());

                // HACK: We need to stringify the test objects because otherwise deepEqual falsely fails:
                assert.deepEqual(JSON.stringify(result), JSON.stringify(expectedResult));
            }
        );

        it('can connect an algebraic sign.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newLocalVariableDeclaration(
                                        SyntaxCreator.newIntegerNegation()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newLocalVariableDeclaration(
                                        SemanticCreator.newIntegerNegation(),
                                        SemanticCreator.newVariableSymbol(undefined, undefined, true)
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new Map());

                // HACK: We need to stringify the test objects because otherwise deepEqual falsely fails:
                assert.deepEqual(JSON.stringify(result), JSON.stringify(expectedResult));
            }
        );

        it('can connect a variable expression.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newLocalVariableDeclaration(
                                        SyntaxCreator.newIntegerLiteral()
                                    ),
                                    SyntaxCreator.newLocalVariableDeclaration(
                                        SyntaxCreator.newVariableExpression(),
                                        undefined,
                                        true,
                                        TokenCreator.newVariableIdentifier('variableB')
                                    )
                                ]
                            )
                        )
                    ]
                );

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newLocalVariableDeclaration(
                                        SemanticCreator.newIntegerLiteral(),
                                        SemanticCreator.newVariableSymbol(undefined, undefined, true)
                                    ),
                                    SemanticCreator.newLocalVariableDeclaration(
                                        SemanticCreator.newVariableExpression(),
                                        SemanticCreator.newVariableSymbol(
                                            undefined,
                                            'variableB',
                                            true
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new Map());

                // HACK: We need to stringify the test objects because otherwise deepEqual falsely fails:
                assert.deepEqual(JSON.stringify(result), JSON.stringify(expectedResult));
            }
        );

        it('can connect an if statement.',
            function ()
            {
                const input = SyntaxCreator.newFile(
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

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newIfStatement()
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new Map());

                // HACK: We need to stringify the test objects because otherwise deepEqual falsely fails:
                assert.deepEqual(JSON.stringify(result), JSON.stringify(expectedResult));
            }
        );

        it('can connect an else statement.',
            function ()
            {
                const input = SyntaxCreator.newFile(
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

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newIfStatement(
                                        SemanticCreator.newFalseBooleanLiteral(),
                                        undefined,
                                        SemanticCreator.newElseClause()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new Map());

                // HACK: We need to stringify the test objects because otherwise deepEqual falsely fails:
                assert.deepEqual(JSON.stringify(result), JSON.stringify(expectedResult));
            }
        );

        it('can connect a while statement.',
            function ()
            {
                const input = SyntaxCreator.newFile(
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

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newWhileStatement()
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new Map());

                // HACK: We need to stringify the test objects because otherwise deepEqual falsely fails:
                assert.deepEqual(JSON.stringify(result), JSON.stringify(expectedResult));
            }
        );

        it('throws an exception if there is an unknown type.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            undefined,
                            undefined,
                            SyntaxCreator.newTypeClause(
                                TokenCreator.newTypeIdentifier('an unknown type')
                            )
                        )
                    ]
                );

                assert.throws(
                    (): void => { connector.run(input, new Map()); },
                    Diagnostic.Codes.UnknownTypeError
                );
            }
        );

        it('throws an exception if there is a duplicate parameter.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            undefined,
                            SyntaxCreator.newFunctionParametersList(
                                [
                                    SyntaxCreator.newFunctionParameter(),
                                    SyntaxCreator.newFunctionParameter()
                                ]
                            )
                        )
                    ]
                );

                assert.throws(
                    (): void => { connector.run(input, new Map()); },
                    Diagnostic.Codes.DuplicateParameterNameError
                );
            }
        );

        it('throws an exception if there is a variable declaration without type clause and initialisor.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newLocalVariableDeclaration(null, null)
                                ]
                            )
                        )
                    ]
                );

                assert.throws(
                    (): void => { connector.run(input, new Map()); },
                    Diagnostic.Codes.VariableWithoutTypeClauseAndInitialiserError
                );
            }
        );

        it('throws an exception if there is a duplicate variable declaration.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newLocalVariableDeclaration(
                                        SyntaxCreator.newIntegerLiteral()
                                    ),
                                    SyntaxCreator.newLocalVariableDeclaration(
                                        SyntaxCreator.newIntegerLiteral()
                                    )
                                ]
                            )
                        )
                    ]
                );

                assert.throws(
                    (): void => { connector.run(input, new Map()); },
                    Diagnostic.Codes.DuplicateVariableDeclarationError
                );
            }
        );

        it('throws an exception if a function without a return type returns something.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newReturn(
                                        SyntaxCreator.newIntegerLiteral()
                                    )
                                ]
                            )
                        )
                    ]
                );

                assert.throws(
                    (): void => { connector.run(input, new Map()); },
                    Diagnostic.Codes.NotEmptyReturnInFunctionWithoutReturnTypeError
                );
            }
        );

        it('throws an exception if a function with a return type returns nothing.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newReturn()
                                ]
                            ),
                            undefined,
                            SyntaxCreator.newTypeClause()
                        )
                    ]
                );

                assert.throws(
                    (): void => { connector.run(input, new Map()); },
                    Diagnostic.Codes.EmptyReturnInFunctionWithReturnTypeError
                );
            }
        );

        it('throws an exception if the return value type does not match the function return type.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newReturn(
                                        SyntaxCreator.newStringLiteral()
                                    )
                                ]
                            ),
                            undefined,
                            SyntaxCreator.newTypeClause()
                        )
                    ]
                );

                assert.throws(
                    (): void => { connector.run(input, new Map()); },
                    Diagnostic.Codes.ReturnTypeDoesNotMatchFunctionReturnTypeError
                );
            }
        );

        it('throws an exception if the condition of an if statement is not of type Bool.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newIfStatement(
                                        SyntaxCreator.newStringLiteral()
                                    )
                                ]
                            )
                        )
                    ]
                );

                assert.throws(
                    (): void => { connector.run(input, new Map()); },
                    Diagnostic.Codes.UnexpectedNonBooleanExpressionInIfStatementError
                );
            }
        );

        it('throws an exception if there is an assignment of an unknown variable.',
            function ()
            {
                const input = SyntaxCreator.newFile(
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

                assert.throws(
                    (): void => { connector.run(input, new Map()); },
                    Diagnostic.Codes.UnknownVariableError
                );
            }
        );

        it('throws an exception if there is an assignment of a readonly variable.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newAssignment(
                                        SyntaxCreator.newIntegerLiteral()
                                    )
                                ]
                            ),
                            SyntaxCreator.newFunctionParametersList(
                                [
                                    SyntaxCreator.newFunctionParameter()
                                ]
                            )
                        )
                    ]
                );

                assert.throws(
                    (): void => { connector.run(input, new Map()); },
                    Diagnostic.Codes.ReadonlyAssignmentError
                );
            }
        );
    }
);
