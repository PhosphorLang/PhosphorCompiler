import 'mocha';
import { assert } from 'chai';
import BuildInFunctions from '../../src/definitions/buildInFunctions';
import BuildInOperators from '../../src/definitions/buildInOperators';
import BuildInTypes from '../../src/definitions/buildInTypes';
import { IntermediateCreator } from '../utility/intermediateCreator';
import { IntermediateSize } from '../../src/lowerer/intermediateSize';
import Lowerer from '../../src/lowerer/lowerer';
import SemanticCreator from '../utility/semanticCreator';

describe('Lowerer',
    function ()
    {
        it('can lower an empty file.',
            function ()
            {
                const input = SemanticCreator.newFile();

                const expectedResult = IntermediateCreator.newFile();

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower a function declaration.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration()
                    ]
                );

                const expectedResult = IntermediateCreator.newFile(
                    [
                        IntermediateCreator.newFunction()
                    ]
                );

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower a section.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection()
                        )
                    ]
                );

                const expectedResult = IntermediateCreator.newFile(
                    [
                        IntermediateCreator.newFunction()
                    ]
                );

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower a call statement.',
            function ()
            {
                const functionSymbol = SemanticCreator.newFunctionSymbol();

                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newFunctionCall(undefined, functionSymbol)
                                ]
                            ),
                            functionSymbol
                        )
                    ]
                );

                const expectedResult = IntermediateCreator.newFile(
                    [
                        IntermediateCreator.newFunction(
                            [
                                IntermediateCreator.newCall(),
                                IntermediateCreator.newReturn(),
                            ]
                        )
                    ]
                );

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower a variable declaration.',
            function ()
            {
                const input = SemanticCreator.newFile(
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

                const expectedResult = IntermediateCreator.newFile(
                    [
                        IntermediateCreator.newFunction()
                    ]
                );

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower a variable assignment.',
            function ()
            {
                const semanticVariableSymbol = SemanticCreator.newVariableSymbol();

                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(undefined, semanticVariableSymbol),
                                    SemanticCreator.newAssignment(
                                        SemanticCreator.newIntegerLiteral(),
                                        semanticVariableSymbol
                                    )
                                ]
                            )
                        )
                    ]
                );

                const intermediateVariableSymbol = IntermediateCreator.newVariableSymbol('v#0');

                const expectedResult = IntermediateCreator.newFile(
                    [
                        IntermediateCreator.newFunction(
                            [
                                IntermediateCreator.newIntroduce(intermediateVariableSymbol),
                                IntermediateCreator.newMove(intermediateVariableSymbol),
                                IntermediateCreator.newDismiss(intermediateVariableSymbol),
                                IntermediateCreator.newReturn(),
                            ]
                        )
                    ]
                );

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower a variable initialisation.',
            function ()
            {
                const input = SemanticCreator.newFile(
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

                const intermediateVariableSymbol = IntermediateCreator.newVariableSymbol('v#0');

                const expectedResult = IntermediateCreator.newFile(
                    [
                        IntermediateCreator.newFunction(
                            [
                                IntermediateCreator.newIntroduce(intermediateVariableSymbol),
                                IntermediateCreator.newMove(intermediateVariableSymbol),
                                IntermediateCreator.newDismiss(intermediateVariableSymbol),
                                IntermediateCreator.newReturn(),
                            ]
                        )
                    ]
                );

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower an integer addition.',
            function ()
            {
                const input = SemanticCreator.newFile(
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

                const variableSymbol0 = IntermediateCreator.newVariableSymbol('v#0');
                const variableSymbol1 = IntermediateCreator.newVariableSymbol('v#1');

                const expectedResult = IntermediateCreator.newFile(
                    [
                        IntermediateCreator.newFunction(
                            [
                                IntermediateCreator.newIntroduce(variableSymbol0),
                                IntermediateCreator.newMove(variableSymbol0),
                                IntermediateCreator.newIntroduce(variableSymbol1),
                                IntermediateCreator.newMove(variableSymbol1),
                                IntermediateCreator.newAdd(variableSymbol0, variableSymbol1),
                                IntermediateCreator.newDismiss(variableSymbol1),
                                IntermediateCreator.newDismiss(variableSymbol0),
                                IntermediateCreator.newReturn(),
                            ]
                        )
                    ]
                );

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower a string comparison.',
            function ()
            {
                const input = SemanticCreator.newFile(
                    [
                        SemanticCreator.newFunctionDeclaration(
                            SemanticCreator.newSection(
                                [
                                    SemanticCreator.newVariableDeclaration(
                                        SemanticCreator.newBinaryExpression(
                                            SemanticCreator.newStringLiteral('string0'),
                                            BuildInOperators.binaryStringEqual,
                                            SemanticCreator.newStringLiteral('string1'),
                                        ),
                                        SemanticCreator.newVariableSymbol(BuildInTypes.bool)
                                    )
                                ]
                            )
                        )
                    ]
                );

                const constantSymbol0 = IntermediateCreator.newConstantSymbol('c#0', 'string0');
                const constantSymbol1 = IntermediateCreator.newConstantSymbol('c#1', 'string1');

                const returnVariable0 = IntermediateCreator.newVariableSymbol('v#0', IntermediateSize.Int8);
                const variableSymbol1 = IntermediateCreator.newVariableSymbol('v#1', IntermediateSize.Pointer);
                const variableSymbol2 = IntermediateCreator.newVariableSymbol('v#2', IntermediateSize.Pointer);

                // TODO: The following shouldn't be necessary to be defined here. It should be defined somewhere more general.
                const stringsAreEqualBuildInFunctionSymbol = IntermediateCreator.newFunctionSymbol(
                    [
                        IntermediateSize.Pointer,
                        IntermediateSize.Pointer,
                    ],
                    IntermediateSize.Int8,
                    BuildInFunctions.stringsAreEqual.name
                );

                const expectedResult = IntermediateCreator.newFile(
                    [
                        IntermediateCreator.newFunction(
                            [
                                IntermediateCreator.newIntroduce(variableSymbol1),
                                IntermediateCreator.newMove(variableSymbol1, constantSymbol0),
                                IntermediateCreator.newGive(
                                    IntermediateCreator.newParameterSymbol('p#0', IntermediateSize.Pointer),
                                    variableSymbol1
                                ),
                                IntermediateCreator.newDismiss(variableSymbol1),
                                IntermediateCreator.newIntroduce(variableSymbol2),
                                IntermediateCreator.newMove(variableSymbol2, constantSymbol1),
                                IntermediateCreator.newGive(
                                    IntermediateCreator.newParameterSymbol('p#1', IntermediateSize.Pointer),
                                    variableSymbol2
                                ),
                                IntermediateCreator.newDismiss(variableSymbol2),
                                IntermediateCreator.newCall(stringsAreEqualBuildInFunctionSymbol),
                                IntermediateCreator.newIntroduce(returnVariable0),
                                IntermediateCreator.newTake(
                                    returnVariable0,
                                    IntermediateCreator.newReturnSymbol(IntermediateSize.Int8)
                                ),
                                IntermediateCreator.newDismiss(returnVariable0),
                                IntermediateCreator.newReturn(),
                            ]
                        )
                    ],
                    [
                        IntermediateCreator.newExternal(stringsAreEqualBuildInFunctionSymbol),
                    ],
                    [
                        IntermediateCreator.newConstant(constantSymbol0),
                        IntermediateCreator.newConstant(constantSymbol1),
                    ]
                );

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower an empty return statement.',
            function ()
            {
                const input = SemanticCreator.newFile(
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

                const expectedResult = IntermediateCreator.newFile(
                    [
                        IntermediateCreator.newFunction(
                            [
                                IntermediateCreator.newReturn(),
                            ]
                        )
                    ]
                );

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult); // An empty return statement stays unchanged.
            }
        );

        it('can lower an if statement with an empty section.',
            function ()
            {
                const input = SemanticCreator.newFile(
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

                const compareVariableSymbol = IntermediateCreator.newVariableSymbol('v#0', IntermediateSize.Int8);
                const endLabelSymbol = IntermediateCreator.newLabelSymbol('l#0');

                const expectedResult = IntermediateCreator.newFile(
                    [
                        IntermediateCreator.newFunction(
                            [
                                IntermediateCreator.newIntroduce(compareVariableSymbol),
                                IntermediateCreator.newMove(
                                    compareVariableSymbol,
                                    IntermediateCreator.newLiteralSymbol('1', IntermediateSize.Int8)
                                ),
                                IntermediateCreator.newCompare(
                                    compareVariableSymbol,
                                    IntermediateCreator.newLiteralSymbol('0', IntermediateSize.Int8)
                                ),
                                IntermediateCreator.newDismiss(compareVariableSymbol),
                                IntermediateCreator.newJumpIfEqual(endLabelSymbol),
                                IntermediateCreator.newLabel(endLabelSymbol),
                                IntermediateCreator.newReturn(),
                            ]
                        )
                    ]
                );

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower an if else statement with empty sections.',
            function ()
            {
                const input = SemanticCreator.newFile(
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

                const compareVariableSymbol = IntermediateCreator.newVariableSymbol('v#0', IntermediateSize.Int8);
                const endLabelSymbol = IntermediateCreator.newLabelSymbol('l#0');
                const elseLabelSymbol = IntermediateCreator.newLabelSymbol('l#1');

                const expectedResult = IntermediateCreator.newFile(
                    [
                        IntermediateCreator.newFunction(
                            [
                                IntermediateCreator.newIntroduce(compareVariableSymbol),
                                IntermediateCreator.newMove(
                                    compareVariableSymbol,
                                    IntermediateCreator.newLiteralSymbol('0', IntermediateSize.Int8)
                                ),
                                IntermediateCreator.newCompare(
                                    compareVariableSymbol,
                                    IntermediateCreator.newLiteralSymbol('0', IntermediateSize.Int8)
                                ),
                                IntermediateCreator.newDismiss(compareVariableSymbol),
                                IntermediateCreator.newJumpIfEqual(elseLabelSymbol),
                                IntermediateCreator.newGoto(endLabelSymbol),
                                IntermediateCreator.newLabel(elseLabelSymbol),
                                IntermediateCreator.newLabel(endLabelSymbol),
                                IntermediateCreator.newReturn(),
                            ]
                        )
                    ]
                );

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can lower a while statement.',
            function ()
            {
                const input = SemanticCreator.newFile(
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

                const conditionVariableSymbol = IntermediateCreator.newVariableSymbol('v#0', IntermediateSize.Int8);
                const startLabelSymbol = IntermediateCreator.newLabelSymbol('l#0');
                const endLabelSymbol = IntermediateCreator.newLabelSymbol('l#1');

                const expectedResult = IntermediateCreator.newFile(
                    [
                        IntermediateCreator.newFunction(
                            [
                                IntermediateCreator.newIntroduce(conditionVariableSymbol),
                                IntermediateCreator.newMove(
                                    conditionVariableSymbol,
                                    IntermediateCreator.newLiteralSymbol('1', IntermediateSize.Int8)
                                ),
                                IntermediateCreator.newLabel(startLabelSymbol),
                                IntermediateCreator.newCompare(
                                    conditionVariableSymbol,
                                    IntermediateCreator.newLiteralSymbol('0', IntermediateSize.Int8)
                                ),
                                IntermediateCreator.newJumpIfEqual(endLabelSymbol),
                                IntermediateCreator.newGoto(startLabelSymbol),
                                IntermediateCreator.newLabel(endLabelSymbol),
                                IntermediateCreator.newDismiss(conditionVariableSymbol),
                                IntermediateCreator.newReturn(),
                            ]
                        )
                    ]
                );

                const lowerer = new Lowerer();

                const result = lowerer.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );
    }
);
