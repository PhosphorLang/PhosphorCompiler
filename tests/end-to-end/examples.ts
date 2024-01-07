import 'mocha';
import * as Diagnostic from '../../src/diagnostic';
import { assert } from 'chai';
import FileSystem from 'fs';
import { OptimisationLevel } from '../../src/compilerInterface/optimisationLevel';
import Path from 'path';
import { PhosphorCompiler } from '../../src/compilerInterface/phoshorCompiler';
import { ProcessArguments } from '../../src/compilerInterface/processArguments';
import { TargetPlatform } from '../../src/compilerInterface/targetPlatform';

describe('Examples, the compiler can compile',
    function ()
    {
        let diagnostic: Diagnostic.Diagnostic;
        let phosphorCompiler: PhosphorCompiler;

        const defaultProcessArguments: ProcessArguments = {
            filePath: '',
            outputPath: 'tests/tmp/out/',
            standardLibraryPath: '../StandardLibrary/bin',
            temporaryPath: 'tests/tmp/tmp',
            optimisationLevel: OptimisationLevel.None,
            targetPlatform: TargetPlatform.LinuxAmd64,
            run: false,
            intermediate: false,
        };

        beforeEach(
            function ()
            {
                diagnostic = new Diagnostic.Diagnostic();

                phosphorCompiler = new PhosphorCompiler(diagnostic);
            }
        );

        const exampleFolders = FileSystem.readdirSync('examples', {encoding: 'utf8', withFileTypes: true});

        for (const folder of exampleFolders)
        {
            if (!folder.isDirectory())
            {
                continue;
            }

            const folderPath = Path.join(folder.path, folder.name);
            const foundFiles = FileSystem.readdirSync(folderPath, {encoding: 'utf8'});

            const files: string[] = [];
            for (const file of foundFiles)
            {
                if (file.endsWith('.ph'))
                {
                    files.push(file);
                }
            }

            let fileName: string;
            if (files.length == 1)
            {
                fileName = files[0];
            }
            else if ((files.length > 1) && files.includes('main.ph'))
            {
                fileName = 'main.ph';
            }
            else
            {
                continue;
            }

            it(`example "${folder.name}".`,
                function ()
                {
                    const filePath = Path.join(folderPath, fileName);

                    const processArguments = {
                        ...defaultProcessArguments,
                        filePath: filePath,
                        outputPath: Path.join(defaultProcessArguments.outputPath, folder.name),
                    };

                    phosphorCompiler.run(processArguments);

                    const fileExists = FileSystem.existsSync(processArguments.outputPath);
                    assert.isTrue(fileExists);
                }
            );
        }
    }
);
