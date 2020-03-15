import 'mocha';
import { assert } from 'chai';

import InvalidTokenError from '../../src/errors/invalidTokenError';
import Parser from '../../src/parser/parser';
import SyntaxTreeBuilder from '../utility/syntaxTreeBuilder';
import TokenCreator from '../utility/tokenCreator';
import UnexpectedTokenError from '../../src/errors/unexpectedTokenError';
import UnknownTokenError from '../../src/errors/unknownTokenError';

describe('Parser',
    function ()
    {
        it('can parse a function call.',
            function ()
            {
                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newIdentifier())
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
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .addAfter(TokenCreator.newIdentifier())
                    .addAfter(TokenCreator.newIdentifier())
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
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newInteger(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newIdentifier())
                    .add(TokenCreator.newInteger())
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
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newString(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newIdentifier())
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
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newInteger(),
                    TokenCreator.newPlus(),
                    TokenCreator.newInteger(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newIdentifier())
                    .add(TokenCreator.newPlus())
                    .addAfter(TokenCreator.newInteger())
                    .addAfter(TokenCreator.newInteger())
                    .getRoot();

                const parser = new Parser();

                const result = parser.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a variable declaration.',
            function ()
            {
                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newVar(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newVar())
                    .add(TokenCreator.newVariableIdentifier())
                    .getRoot();

                const parser = new Parser();

                const result = parser.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('can parse a variable assignment.',
            function ()
            {
                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newVariableIdentifier(),
                    TokenCreator.newAssignment(),
                    TokenCreator.newInteger(),
                    TokenCreator.newSemicolon(),
                ];

                const expectedResult = SyntaxTreeBuilder
                    .new(TokenCreator.newFile())
                    .add(TokenCreator.newAssignment())
                    .addAfter(TokenCreator.newVariableIdentifier())
                    .addAfter(TokenCreator.newInteger())
                    .getRoot();

                const parser = new Parser();

                const result = parser.run(input);

                assert.deepStrictEqual(result, expectedResult);
            }
        );

        it('throws an exception at unknown statement type.',
            function ()
            {
                this.skip();

                const input = [
                    TokenCreator.newFile(),
                ];

                const parser = new Parser();

                assert.throws(
                    (): void => { parser.run(input); },
                    UnknownTokenError
                );
            }
        );

        it('throws an exception at a missing semicolon after a statement.',
            function ()
            {
                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newClosingBracket(),
                    TokenCreator.newIdentifier(),
                ];

                const parser = new Parser();

                assert.throws(
                    (): void => { parser.run(input); },
                    InvalidTokenError
                );
            }
        );

        it('throws an exception if there is an invalid token after an identifier.',
            function ()
            {
                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newIdentifier(),
                ];

                const parser = new Parser();

                assert.throws(
                    (): void => { parser.run(input); },
                    UnexpectedTokenError
                );
            }
        );

        it('throws an exception if a function parameter list does not end with a closing bracket.',
            function ()
            {
                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningBracket(),
                    TokenCreator.newInteger(),
                    TokenCreator.newIdentifier(),
                ];

                const parser = new Parser();

                assert.throws(
                    (): void => { parser.run(input); },
                    InvalidTokenError
                );
            }
        );

        it('throws an exception at an invalid function parameter.',
            function ()
            {
                this.skip();

                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newIdentifier(),
                    TokenCreator.newOpeningBracket(),
                ];

                const parser = new Parser();

                assert.throws(
                    (): void => { parser.run(input); },
                    InvalidTokenError
                );
            }
        );

        it('throws an exception if there is something else than an identifier in a variable declaration.',
            function ()
            {
                this.skip();

                const input = [
                    TokenCreator.newFile(),
                    TokenCreator.newVar(),
                ];

                const parser = new Parser();

                assert.throws(
                    (): void => { parser.run(input); },
                    InvalidTokenError
                );
            }
        );
    }
);
