import 'mocha';
import * as Diagnostic from '../../../src/diagnostic';
import { assert } from 'chai';
import ChildProcess from 'child_process';
import FileSystem from 'fs';
import { OptimisationLevel } from '../../../src/compilerInterface/optimisationLevel';
import Path from 'path';
import { PhosphorCompiler } from '../../../src/compilerInterface/phoshorCompiler';
import { ProcessArguments } from '../../../src/compilerInterface/processArguments';
import { TargetPlatform } from '../../../src/compilerInterface/targetPlatform';

describe('The compiled programme gives the correct output for',
    function ()
    {
        let diagnostic: Diagnostic.Diagnostic;
        let phosphorCompiler: PhosphorCompiler;

        const defaultProcessArguments: ProcessArguments = {
            filePath: '',
            outputPath: 'tests/tmp/out/',
            standardLibraryPath: '../StandardLibrary/bin',
            includeStandardLibrary: true,
            temporaryPath: 'tests/tmp/tmp',
            optimisationLevel: OptimisationLevel.None,
            targetPlatform: TargetPlatform.LinuxAmd64,
            intermediate: false,
        };

        beforeEach(
            function ()
            {
                diagnostic = new Diagnostic.Diagnostic();

                phosphorCompiler = new PhosphorCompiler(diagnostic);
            }
        );

        const inputFolderPath = Path.join(__dirname, 'inputs');
        const inputFolders = FileSystem.readdirSync(inputFolderPath, {encoding: 'utf8', withFileTypes: true});

        for (const inputFolder of inputFolders)
        {
            const inputFilePath = Path.join(inputFolder.path, inputFolder.name, 'main.ph');
            const outputFilePath = Path.join(__dirname, 'outputs', inputFolder.name + '.txt');

            it(`"${inputFolder.name}".`,
                function ()
                {
                    if (process.platform != 'linux')
                    {
                        // NOTE: The backend of the compiler currently only supports Linux.
                        // NOTE: Linux on x64 is the only compiler target, thus these tests only work on Linux.
                        this.skip();
                    }

                    const executablePath = Path.join(defaultProcessArguments.outputPath, inputFolder.name);
                    const processArguments = {
                        ...defaultProcessArguments,
                        filePath: inputFilePath,
                        outputPath: executablePath,
                    };

                    phosphorCompiler.run(processArguments);

                    const fileExists = FileSystem.existsSync(processArguments.outputPath);
                    assert.isTrue(fileExists);

                    const expected = FileSystem.readFileSync(outputFilePath, {encoding: 'utf8'});

                    const result = ChildProcess.execFileSync(executablePath);

                    assert.equal(result.toString(), expected);

                    // TODO: Should we clean up after ourselves and delete the temporary directory? Only the created files?
                }
            );
        }
    }
);
