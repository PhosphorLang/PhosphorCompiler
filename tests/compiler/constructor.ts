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
                    .add(TokenCreator.newFunctionCall())
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
                    .add(TokenCreator.newFunctionCall())
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
                    .add(TokenCreator.newFunctionCall())
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
    }
);
