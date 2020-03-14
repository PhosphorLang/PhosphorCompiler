import 'mocha';
import ActionTokenCreator from '../utility/actionTokenCreator';
import ActionTreeBuilder from '../utility/actionTreeBuilder';
import { assert } from 'chai';
import Constructor from '../../src/constructor_/constructor';
import SyntaxTreeBuilder from '../utility/syntaxTreeBuilder';
import TokenCreator from '../utility/tokenCreator';

describe('Constructor',
    function ()
    {
        it('can construct a function call.',
            function ()
            {
                const input = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newIdentifier())
                    .getRoot();

                const expectedResult = ActionTreeBuilder
                    .new(ActionTokenCreator.newFile())
                    .add(ActionTokenCreator.newFunction())
                    .getRoot();

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

                const expectedResult = ActionTreeBuilder
                    .new(ActionTokenCreator.newFile())
                    .add(ActionTokenCreator.newFunction())
                    .addAfter(ActionTokenCreator.newIntegerLiteral('c_0'))
                    .toParent()
                    .add(ActionTokenCreator.newIntegerDefinition('c_0'))
                    .getRoot();

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

                const expectedResult = ActionTreeBuilder
                    .new(ActionTokenCreator.newFile())
                    .add(ActionTokenCreator.newFunction())
                    .addAfter(ActionTokenCreator.newStringLiteral('c_0'))
                    .toParent()
                    .add(ActionTokenCreator.newStringDefinition('c_0'))
                    .getRoot();

                const constructor = new Constructor();

                const result = constructor.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can construct an addition as parameter.',
            function ()
            {
                this.skip();

                const input = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newIdentifier())
                    .add(TokenCreator.newPlus())
                    .addAfter(TokenCreator.newNumber())
                    .addAfter(TokenCreator.newNumber('8'))
                    .getRoot();

                const expectedResult = ActionTreeBuilder
                    .new(ActionTokenCreator.newFile())
                    .add(ActionTokenCreator.newFunction())
                    .add(ActionTokenCreator.newAddition())
                    .addAfter(ActionTokenCreator.newIntegerLiteral('c_0'))
                    .addAfter(ActionTokenCreator.newIntegerLiteral('c_1', '8'))
                    .toParent()
                    .toParent()
                    .addAfter(ActionTokenCreator.newIntegerDefinition('c_0'))
                    .addAfter(ActionTokenCreator.newIntegerDefinition('c_1', '8'))
                    .getRoot();

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
