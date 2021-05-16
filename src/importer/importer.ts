import * as SyntaxNodes from "../parser/syntaxNodes";
import Diagnostic from "../diagnostic/diagnostic";
import DiagnosticCodes from "../diagnostic/diagnosticCodes";
import DiagnosticError from "../diagnostic/diagnosticError";
import FileSystem from 'fs';
import ImportNodeToFileNode from "./importNodeToFileNode";
import Lexer from "../lexer/lexer";
import Parser from "../parser/parser";
import Path from "path";

class PathToFileNode extends Map<string, SyntaxNodes.File> {}

/**
 * The importer collects and parses (via the given lexer and parser) every file that shall be imported in the given syntax tree (including
 * all files that are imported, thus it is working recursively) and returns a map that links all resulting syntax trees for the imported
 * files to the import statements that reference them. Every file is parsed only once but can be connected to multiple import statements
 * if they all reference the same file.
 */
export default class Importer
{
    private readonly diagnostic: Diagnostic;

    private lexer: Lexer;
    private parser: Parser;

    private rootPath: string;
    private standardLibraryPath: string | null;

    constructor (diagnostic: Diagnostic, lexer: Lexer, parser: Parser, standardLibrayPath?: string)
    {
        this.diagnostic = diagnostic;
        this.lexer = lexer;
        this.parser = parser;
        this.standardLibraryPath = standardLibrayPath === undefined ? null : standardLibrayPath;
        this.rootPath = '/';
    }

    /**
     * Run the importer.
     * @param syntaxTree The syntax tree for that all imports shall be processed, probably the parsed main file.
     * @param importingFilePath The path to the file the syntax tree comes from. NOTE: This path will considered the root path which all
     *                          other paths can be relative to.
     * @returns A map that links import syntax nodes to their file syntax nodes.
     */
    public run (syntaxTree: SyntaxNodes.File, importingFilePath: string): ImportNodeToFileNode
    {
        this.rootPath = Path.dirname(importingFilePath);

        const importNodeToFileNode = new ImportNodeToFileNode();
        const pathToFileNode = new PathToFileNode();

        this.importRecursively(syntaxTree.imports, importingFilePath, importNodeToFileNode, pathToFileNode);

        return importNodeToFileNode;
    }

    /**
     * Import all needed files by calling lexer and parser for every input statement's file and then doing the same for the import
     * statements in these files.
     * @param importNodes The import nodes to process, probably coming from a file syntax node.
     * @param importingFilePath The path to the file, needed to process relative file imports.
     * @param importNodeToFileNode Every imported file syntax node will added to this map, linking the import statement to the syntax tree.
     * @param pathToFileNode Links paths to file syntax nodes; used to prevent parsing the same file twice.
     */
    private importRecursively (
        importNodes: SyntaxNodes.Import[],
        importingFilePath: string,
        importNodeToFileNode: ImportNodeToFileNode,
        pathToFileNode: PathToFileNode
    ): void
    {
        for (const importNode of importNodes)
        {
            const filePath = this.getFilePathFromImport(importNode, importingFilePath);

            const existingFileNode = pathToFileNode.get(filePath);

            if (existingFileNode === undefined)
            {
                let fileContent: string;

                try
                {
                    fileContent = FileSystem.readFileSync(filePath, {encoding: 'utf8'});
                }
                catch
                {
                    this.diagnostic.throw(
                        new DiagnosticError(
                            `Could not find file "${filePath}" for import.`,
                            DiagnosticCodes.CannotFindImportFileError,
                            importNode.path
                        )
                    );
                }

                const tokens = this.lexer.run(fileContent, filePath);
                const fileNode = this.parser.run(tokens, filePath);

                pathToFileNode.set(filePath, fileNode);
                importNodeToFileNode.set(importNode, fileNode);

                this.importRecursively(fileNode.imports, filePath, importNodeToFileNode, pathToFileNode);
            }
            else
            {
                importNodeToFileNode.set(importNode, existingFileNode);
            }
        }
    }

    /**
     * Calculate the real path of a file to import.
     * @param importNode The import syntax node.
     * @param importingFilePath The path to the file that contains the import statement.
     * @returns The path to the file that shall be imported, resolvable from the root path (i.e. the location of the main file and the
     *          working path of the compiler), thus is either relative to the root path or absolute.
     */
    private getFilePathFromImport (importNode: SyntaxNodes.Import, importingFilePath: string): string
    {
        const importPath = importNode.path.content;

        if ((importPath.startsWith('./')) || (importPath.startsWith('../')))
        {
            // Relative import
            return Path.join(Path.dirname(importingFilePath), importPath);
        }
        else if (importPath.startsWith('/'))
        {
            // Absolute import
            return Path.join(this.rootPath, importPath);
        }
        else
        {
            // Standard library import
            if (this.standardLibraryPath === null)
            {
                this.diagnostic.throw(
                    new DiagnosticError(
                        `Tried to import from the standard library without providing the --standardLibrary command line parameter.`,
                        DiagnosticCodes.MissingStandardLibraryCommandLineParameterError,
                        importNode.path
                    )
                );
            }
            else
            {
                return Path.join(this.standardLibraryPath, 'headers', importPath + '.ph');
            }
        }
    }
}
