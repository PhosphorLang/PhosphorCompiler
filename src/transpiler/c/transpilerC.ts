import * as Intermediates from '../../intermediateLowerer/intermediates';
import * as IntermediateSymbols from '../../intermediateLowerer/intermediateSymbols';
import { IntermediateSize } from '../../intermediateLowerer/intermediateSize';

export class TranspilerC
{
    private static readonly integerTypeName = 'Integer';
    private static readonly integer8TypeName = 'Integer8';
    private static readonly integer16TypeName = 'Integer16';
    private static readonly integer32TypeName = 'Integer32';
    private static readonly integer64TypeName = 'Integer64';
    private static readonly stringTypeName = 'String';
    private static readonly stringValueTypeName = 'StringValue';

    private code: string[];

    constructor ()
    {
        this.code = [
            '#include "Phosphor.Types.h"',
        ];
    }

    public run (fileIntermediate: Intermediates.File): string
    {
        this.transpileFile(fileIntermediate);

        if (fileIntermediate.isEntryPoint)
        {
            this.code.push(
                '', // Empty line
                'extern void exit () asm ("\\"Standard.System.exit\\"");',
                '', // Empty line
                'void _start ()',
                '{',
                // TODO: Handle the initialisation code here.
                '    main();',
                '    exit();',
                '}',
            );
        }

        const codeText = this.getLinesAsFormattedText(this.code);

        return codeText;
    }

    private getLinesAsFormattedText (lines: string[]): string
    {
        let text = '';
        let indentation = '';

        for (const line of lines)
        {
            if (line == '}')
            {
                indentation = indentation.slice(4);
            }

            text += line + '\n';

            if (line == '{')
            {
                indentation += '    ';
            }
        }

        return text;
    }

    private getIdentifierName (symbol: IntermediateSymbols.IntermediateSymbol): string
    {
        const originalName = symbol.name;
        let escapedName = '';

        for (const characterCodePoint of originalName)
        {
            if ((characterCodePoint >= 'a' && characterCodePoint <= 'z') ||
                (characterCodePoint >= 'A' && characterCodePoint <= 'Z') ||
                (characterCodePoint >= '0' && characterCodePoint <= '9') ||
                (characterCodePoint === '_'))
            {
                escapedName += characterCodePoint;
            }
            else
            {
                const characterCode = characterCodePoint.charCodeAt(0);
                const escapedCharacterHex = characterCode.toString(16);

                escapedName += '$' + escapedCharacterHex + '$';
            }
        }

        return escapedName;
    }

    private getSizeString (intermediateSize: IntermediateSize): string
    {
        switch (intermediateSize)
        {
            case IntermediateSize.Int8:
                return TranspilerC.integer8TypeName;
            case IntermediateSize.Int16:
                return TranspilerC.integer16TypeName;
            case IntermediateSize.Int32:
                return TranspilerC.integer32TypeName;
            case IntermediateSize.Int64:
                return TranspilerC.integer64TypeName;
            case IntermediateSize.Native:
                return TranspilerC.integerTypeName;
            case IntermediateSize.Pointer:
                return 'void*';
            case IntermediateSize.Void:
                return 'void';
        }
    }

    private transpileFile (fileIntermediate: Intermediates.File): void
    {
        for (const constant of fileIntermediate.constants)
        {
            this.transpileConstant(constant);
        }

        if (fileIntermediate.constants.length > 0)
        {
            this.code.push(''); // Empty line
        }

        for (const external of fileIntermediate.externals)
        {
            this.transpileExternal(external);
        }

        if (fileIntermediate.externals.length > 0)
        {
            this.code.push(''); // Empty line
        }

        for (const global of fileIntermediate.globals)
        {
            this.transpileGlobal(global);
        }

        if (fileIntermediate.globals.length > 0)
        {
            this.code.push(''); // Empty line
        }

        if (fileIntermediate.structure !== null)
        {
            this.transpileStructure(fileIntermediate.structure);

            this.code.push(''); // Empty line
        }

        for (const functionNode of fileIntermediate.functions)
        {
            this.transpileFunction(functionNode);

            if (functionNode !== fileIntermediate.functions.at(-1))
            {
                this.code.push(''); // Empty line
            }
        }
    }

    private transpileConstant (constantIntermediate: Intermediates.Constant): void
    {
        // TODO: This assumes that constants are always strings. Must be adjusted as soon as constants get a type (other than string only).

        // We need an encoded string to get the real byte count:
        const encoder = new TextEncoder();
        const encodedString = encoder.encode(constantIntermediate.symbol.value);

        const stringByteCount = encodedString.length;

        const identifierName = this.getIdentifierName(constantIntermediate.symbol);

        const line = `static const ${TranspilerC.stringTypeName} ${identifierName} = &((${TranspilerC.stringValueTypeName})`
            + `{ .size = ${stringByteCount}, .data = "${constantIntermediate.symbol.value}" });`;

        this.code.push(line);
    }

    private transpileExternal (externalIntermediate: Intermediates.External): void
    {
        const parameters: string[] = [];

        for (const parameterSize of externalIntermediate.symbol.parameters)
        {
            const parameter = this.getSizeString(parameterSize);
            parameters.push(parameter);
        }

        const parameterString = parameters.join(', ');

        const line = `extern ${this.getSizeString(externalIntermediate.symbol.returnSize)} `
            + `${this.getIdentifierName(externalIntermediate.symbol)} (${parameterString}) `
            + `asm ("\\"${externalIntermediate.symbol.name}\\"");`;

        this.code.push(line);
    }

    private transpileGlobal (constantIntermediate: Intermediates.Global): void
    {
        const identifierName = this.getIdentifierName(constantIntermediate.symbol);
        const identifierSize = this.getSizeString(constantIntermediate.symbol.size);

        const line = `static ${identifierSize} ${identifierName};`;

        this.code.push(line);
    }

    private transpileStructure (structureIntermediate: Intermediates.Structure): void
    {
        structureIntermediate;
        // TODO: Implement.
    }

    private transpileFunction (functionIntermediate: Intermediates.Function): void
    {
        const returnSizeString = this.getSizeString(functionIntermediate.symbol.returnSize);

        const parameters: string[] = [];

        for (const parameterSize of functionIntermediate.symbol.parameters)
        {
            const parameter = this.getSizeString(parameterSize);
            parameters.push(parameter);
            // TODO: Parameter names!
        }

        const parameterString = parameters.join(', ');

        const functionHeader = `${returnSizeString} ${this.getIdentifierName(functionIntermediate.symbol)} (${parameterString})`;

        this.code.push(
            `${functionHeader} asm ("\\"${functionIntermediate.symbol.name}\\"");`,
            `${functionHeader}`,
        );

        this.code.push(
            '{',
            // TODO: Implement function body transpilation.
            '}',
        );
    }
}
