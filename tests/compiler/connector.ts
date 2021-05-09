import 'mocha';
import { assert } from 'chai';
import BuildInTypes from '../../src/definitions/buildInTypes';
import Connector from '../../src/connector/connector';
import Diagnostic from '../../src/diagnostic/diagnostic';
import DiagnosticCodes from '../../src/diagnostic/diagnosticCodes';
import ImportNodeToFileNode from '../../src/importer/importNodeToFileNode';
import SemanticCreator from '../utility/semanticCreator';
import SyntaxCreator from '../utility/syntaxCreator';
import TokenCreator from '../utility/tokenCreator';

describe('Connector',
    function ()
    {
        let diagnostic: Diagnostic;
        let connector: Connector;

        beforeEach(
            function ()
            {
                diagnostic = new Diagnostic();

                connector = new Connector(diagnostic);
            }
        );

        it('can connect an empty file.',
            function ()
            {
                const input = SyntaxCreator.newFile();

                const expectedResult = SemanticCreator.newFile();

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
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

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
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

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
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

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
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

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
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
                                    SyntaxCreator.newVariableDeclaration(
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
                                    SemanticCreator.newVariableDeclaration()
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
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
                                    SyntaxCreator.newVariableDeclaration(
                                        undefined,
                                        SyntaxCreator.newTypeClause()
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
                                    SemanticCreator.newVariableDeclaration(),
                                    SemanticCreator.newAssignment(
                                        SemanticCreator.newIntegerLiteral()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
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
                                    SyntaxCreator.newVariableDeclaration(
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
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newIntegerLiteral()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
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
                                    SyntaxCreator.newVariableDeclaration(
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
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newIntegerAddition()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can connect a parenthesized expression.',
            function ()
            {
                const input = SyntaxCreator.newFile(
                    [
                        SyntaxCreator.newFunctionDeclaration(
                            SyntaxCreator.newSection(
                                [
                                    SyntaxCreator.newVariableDeclaration(
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

                const expectedResult = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newIntegerAddition(
                                            SemanticCreator.newIntegerLiteral(),
                                            SemanticCreator.newIntegerAddition()
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
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

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
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

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
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
                                    SyntaxCreator.newVariableDeclaration(
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
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newIntegerNegation()
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
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
                                    SyntaxCreator.newVariableDeclaration(
                                        SyntaxCreator.newIntegerLiteral()
                                    ),
                                    SyntaxCreator.newVariableDeclaration(
                                        SyntaxCreator.newVariableExpression(),
                                        undefined,
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
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newIntegerLiteral()
                                    ),
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newVariableExpression(),
                                        SemanticCreator.newVariableSymbol(
                                            undefined,
                                            'variableB'
                                        )
                                    )
                                ]
                            )
                        )
                    ]
                );

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
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

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
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

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
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

                const result = connector.run(input, new ImportNodeToFileNode());

                assert.deepStrictEqual(result, expectedResult);
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
                    (): void => { connector.run(input, new ImportNodeToFileNode()); },
                    DiagnosticCodes.UnknownTypeError
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
                    (): void => { connector.run(input, new ImportNodeToFileNode()); },
                    DiagnosticCodes.DuplicateParameterNameError
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
                                    SyntaxCreator.newVariableDeclaration(null, null)
                                ]
                            )
                        )
                    ]
                );

                assert.throws(
                    (): void => { connector.run(input, new ImportNodeToFileNode()); },
                    DiagnosticCodes.VariableWithoutTypeClauseAndInitialiserError
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
                                    SyntaxCreator.newVariableDeclaration(
                                        SyntaxCreator.newIntegerLiteral()
                                    ),
                                    SyntaxCreator.newVariableDeclaration(
                                        SyntaxCreator.newIntegerLiteral()
                                    )
                                ]
                            )
                        )
                    ]
                );

                assert.throws(
                    (): void => { connector.run(input, new ImportNodeToFileNode()); },
                    DiagnosticCodes.DuplicateVariableDeclarationError
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
                    (): void => { connector.run(input, new ImportNodeToFileNode()); },
                    DiagnosticCodes.NotEmptyReturnInFunctionWithoutReturnTypeError
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
                    (): void => { connector.run(input, new ImportNodeToFileNode()); },
                    DiagnosticCodes.EmptyReturnInFunctionWithReturnTypeError
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
                    (): void => { connector.run(input, new ImportNodeToFileNode()); },
                    DiagnosticCodes.ReturnTypeDoesNotMatchFunctionReturnTypeError
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
                    (): void => { connector.run(input, new ImportNodeToFileNode()); },
                    DiagnosticCodes.UnexpectedNonBooleanExpressionInIfStatementError
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
                    (): void => { connector.run(input, new ImportNodeToFileNode()); },
                    DiagnosticCodes.UnknownVariableError
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
                    (): void => { connector.run(input, new ImportNodeToFileNode()); },
                    DiagnosticCodes.ReadonlyAssignmentError
                );
            }
        );
    }
);
