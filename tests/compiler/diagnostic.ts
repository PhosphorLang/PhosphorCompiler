import 'mocha';
import * as Diagnostic from '../../src/diagnostic';
import { assert } from 'chai';
import chalk from 'chalk';
import { LineInformation } from '../../src/definitions/lineInformation';

describe('Diagnostic',
    function ()
    {
        const testText = 'testText';
        const testCode = Diagnostic.Codes.UnknownTokenError;
        const testFileName = 'testFileName';
        const testLineNumber = -1;
        const testColumnNumber = -2;
        const testLineInformation: LineInformation = {
            fileName: testFileName,
            lineNumber: testLineNumber,
            columnNumber: testColumnNumber,
        };

        this.beforeAll(
            function ()
            {
                chalk.level = 0;
            }
        );

        it('can add an error.',
            function ()
            {
                const expected = `${testFileName}:${testLineNumber}:${testColumnNumber} - Error ${testCode}: ${testText}`;

                const diagnostic = new Diagnostic.Diagnostic();

                const error = new Diagnostic.Error(testText, testCode, testLineInformation);

                diagnostic.add(error);

                assert.equal(diagnostic.errors.length, 1);
                assert.equal(diagnostic.errors[0], expected);
            }
        );

        it('can add a warning.',
            function ()
            {
                const expected = `${testFileName}:${testLineNumber}:${testColumnNumber} - Warning ${testCode}: ${testText}`;

                const diagnostic = new Diagnostic.Diagnostic();

                const warning = new Diagnostic.Warning(testText, testCode, testLineInformation);

                diagnostic.add(warning);

                assert.equal(diagnostic.warnings.length, 1);
                assert.equal(diagnostic.warnings[0], expected);
            }
        );

        it('can add an info.',
            function ()
            {
                const expected = `${testFileName}:${testLineNumber}:${testColumnNumber} - Info ${testCode}: ${testText}`;

                const diagnostic = new Diagnostic.Diagnostic();

                const info = new Diagnostic.Info(testText, testCode, testLineInformation);

                diagnostic.add(info);

                assert.equal(diagnostic.info.length, 1);
                assert.equal(diagnostic.info[0], expected);
            }
        );

        it('can throw an error.',
            function ()
            {
                const diagnostic = new Diagnostic.Diagnostic();

                const error = new Diagnostic.Error(testText, testCode, testLineInformation);

                assert.throws(
                    (): void => diagnostic.throw(error),
                    testCode
                );
            }
        );

        it('throws when ended with an error added.',
            function ()
            {
                const diagnostic = new Diagnostic.Diagnostic();

                const error = new Diagnostic.Error(testText, testCode, testLineInformation);

                diagnostic.add(error);

                assert.throws(
                    (): void => diagnostic.end(),
                    testCode
                );
            }
        );

        it('dows not throw when ended without an error added.',
            function ()
            {
                const diagnostic = new Diagnostic.Diagnostic();

                const warning = new Diagnostic.Warning(testText, testCode, testLineInformation);
                const info = new Diagnostic.Info(testText, testCode, testLineInformation);

                diagnostic.add(warning);
                diagnostic.add(info);

                diagnostic.end();
            }
        );
    }
);
