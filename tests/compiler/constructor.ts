import 'mocha';
import ActionToken from '../../src/constructor_/actionToken';
import ActionTreeNode from '../../src/constructor_/actionTreeNode';
import { assert } from 'chai';
import Constructor from '../../src/constructor_/constructor';
import SemanticalType from '../../src/constructor_/semanticalType';
import SyntaxTreeBuilder from '../utility/syntaxTreeBuilder';
import TokenCreator from '../utility/tokenCreator';

describe('Constructor',
    function ()
    {
        const fileName = 'testFile';

        it('can construct a function call.',
            function ()
            {
                const input = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newIdentifier())
                    .getRoot();

                const expectedResult = new ActionTreeNode(null, new ActionToken(SemanticalType.File, fileName));
                new ActionTreeNode(expectedResult, new ActionToken(SemanticalType.Function, 'print'));

                const constructor = new Constructor();

                const result = constructor.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can construct an integer parameter.',
            function ()
            {
                const input = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newIdentifier())
                    .add(TokenCreator.newNumber())
                    .getRoot();

                const expectedResult = new ActionTreeNode(null, new ActionToken(SemanticalType.File, fileName));
                new ActionTreeNode(expectedResult, new ActionToken(SemanticalType.Function, 'print'));
                new ActionTreeNode(expectedResult.children[0], new ActionToken(SemanticalType.IntegerLiteral, 'c_0', '24'));
                new ActionTreeNode(expectedResult, new ActionToken(SemanticalType.IntegerDefinition, 'c_0', '24'));

                const constructor = new Constructor();

                const result = constructor.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can construct a string parameter.',
            function ()
            {
                const input = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newIdentifier())
                    .add(TokenCreator.newString())
                    .getRoot();

                const expectedResult = new ActionTreeNode(null, new ActionToken(SemanticalType.File, fileName));
                new ActionTreeNode(expectedResult, new ActionToken(SemanticalType.Function, 'print'));
                new ActionTreeNode(expectedResult.children[0], new ActionToken(SemanticalType.StringLiteral, 'c_0', 'Test string'));
                new ActionTreeNode(expectedResult, new ActionToken(SemanticalType.StringDefinition, 'c_0', 'Test string'));

                const constructor = new Constructor();

                const result = constructor.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can construct an addition as parameter.',
            function ()
            {
                const input = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newIdentifier())
                    .add(TokenCreator.newPlus())
                    .addAfter(TokenCreator.newNumber('24'))
                    .addAfter(TokenCreator.newNumber('8'))
                    .getRoot();

                const expectedResult = new ActionTreeNode(null, new ActionToken(SemanticalType.File, fileName));
                new ActionTreeNode(expectedResult, new ActionToken(SemanticalType.Function, 'print'));
                new ActionTreeNode(expectedResult.children[0], new ActionToken(SemanticalType.Addition));
                new ActionTreeNode(expectedResult.children[0].children[0], new ActionToken(SemanticalType.IntegerLiteral, 'c_0', '24'));
                new ActionTreeNode(expectedResult.children[0].children[0], new ActionToken(SemanticalType.IntegerLiteral, 'c_1', '8'));
                new ActionTreeNode(expectedResult, new ActionToken(SemanticalType.IntegerDefinition, 'c_0', '24'));
                new ActionTreeNode(expectedResult, new ActionToken(SemanticalType.IntegerDefinition, 'c_1', '8'));

                const constructor = new Constructor();

                const result = constructor.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('throws an exception when there is an unknown operator.',
            function ()
            {
                const input = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newIdentifier())
                    .add(TokenCreator.newUnknownOperator())
                    .addAfter(TokenCreator.newNumber('24'))
                    .addAfter(TokenCreator.newNumber('8'))
                    .getRoot();

                const constructor = new Constructor();

                assert.throws(
                    (): void => { constructor.run(input); } // TODO: Add specific error as soon as there are ones.
                );
            }
        );

        it('throws an exception when there is an unknown function.',
            function ()
            {
                const input = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newIdentifier('thisFunctionDoesNotExist'))
                    .getRoot();

                const constructor = new Constructor();

                assert.throws(
                    (): void => { constructor.run(input); } // TODO: Add specific error as soon as there are ones.
                );
            }
        );
    }
);
