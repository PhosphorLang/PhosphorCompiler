import 'mocha';
import { assert } from 'chai';
import Connector from '../../src/connector/connector';
import Diagnostic from '../../src/diagnostic/diagnostic';
import SemanticCreator from '../utility/semanticCreator';
import SyntaxCreator from '../utility/syntaxCreator';

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

                const result = connector.run(input);

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

                const result = connector.run(input);

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

                const result = connector.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can connect variable declaration.',
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

                const result = connector.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can connect variable assignment.',
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

                const result = connector.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can connect variable initialisation.',
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

                const result = connector.run(input);

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

                const result = connector.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );
    }
);
