import 'mocha';
import { assert } from 'chai';

import Parser from '../../src/parser/parser';
import SyntaxTreeBuilder from '../utility/syntaxTreeBuilder';
import TokenCreator from '../utility/tokenCreator';

describe('Parser',
    function ()
    {
        it('can parse a function call.',
            function ()
            {
                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newIdentificator(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newIdentificator())
                    .getRoot();

                const parser = new Parser();

                const result = parser.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse multiple function calls.',
            function ()
            {
                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newIdentificator(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newIdentificator(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .addAfter(TokenCreator.newIdentificator())
                    .addAfter(TokenCreator.newIdentificator())
                    .getRoot();

                const parser = new Parser();

                const result = parser.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an integer parameter.',
            function ()
            {
                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newIdentificator(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newNumber(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newIdentificator())
                    .add(TokenCreator.newNumber())
                    .getRoot();

                const parser = new Parser();

                const result = parser.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a string parameter.',
            function ()
            {
                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newIdentificator(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newString(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newIdentificator())
                    .add(TokenCreator.newString())
                    .getRoot();

                const parser = new Parser();

                const result = parser.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse an addition as parameter.',
            function ()
            {
                this.skip();

                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newIdentificator(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newNumber(),
                    TokenCreator.newPlus(),
                    TokenCreator.newNumber(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newIdentificator())
                    .add(TokenCreator.newPlus())
                    .addAfter(TokenCreator.newNumber())
                    .addAfter(TokenCreator.newNumber())
                    .getRoot();

                const parser = new Parser();

                const result = parser.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can tokenise a variable declaration.',
            function ()
            {
                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newVar(),
                    TokenCreator.newIdentificator(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newVar())
                    .add(TokenCreator.newIdentificator())
                    .getRoot();

                const parser = new Parser();

                const result = parser.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('throws an exception at unknown tokens.',
            function ()
            {
                // FIXME: This needs an overhaul.
                this.skip();

                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newIdentificator(),
                    TokenCreator.newUnknownOperator(),
                ];

                const parser = new Parser();

                assert.throws(
                    (): void => { parser.run(input); } // TODO: Add specific error as soon as there are ones.
                );
            }
        );

        it('throws an exception when there is a statement on file level.',
            function ()
            {
                // FIXME: This test is obsolete.
                this.skip();

                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newNumber(),
                    TokenCreator.newSemicolon(),
                ];

                const parser = new Parser();

                assert.throws(
                    (): void => { parser.run(input); } // TODO: Add specific error as soon as there are ones.
                );
            }
        );
    }
);
