import * as Instructions from "../common/instructions";
import * as SemanticNodes from "../../connector/semanticNodes";
import LocationManagerAvr from "./locationManagerAvr";
import Transpiler from "../transpiler";

export default class TranspilerAvr implements Transpiler
{
    private instructions: Instructions.Instruction[];
    private constants: Instructions.Instruction[];

    private locationManager: LocationManagerAvr;

    /**
     * A counter for generating unqiue constant IDs.
     */
    private constantCounter: number;

    private localLabelCounter: number;

    // FIXME: This must be private instead of protected:
    protected get nextConstantName (): string
    {
        const newConstantName = `c_${this.constantCounter}`;

        this.constantCounter++;

        return newConstantName;
    }

    // FIXME: This must be private instead of protected:
    protected get nextLocalLabel (): string
    {
        const newLocalLabel = `l_${this.localLabelCounter}`;

        this.localLabelCounter++;

        return newLocalLabel;
    }

    constructor ()
    {
        this.instructions = [];
        this.constants = [];
        this.constantCounter = 0;
        this.localLabelCounter = 0;
        this.locationManager = new LocationManagerAvr(this.instructions);
    }

    public run (semanticTree: SemanticNodes.File): string
    {
        this.instructions = [];
        this.constants = [];
        this.constantCounter = 0;
        this.localLabelCounter = 0;
        this.locationManager.instructions = this.instructions;

        /* TODO: It is a bit confusing that transpileFile() returns the instructions while there is this.instructions which is used inside
                 transpileFile() and the functions it calls but reset by run(). It seems that you could run transpileFile() twice at this
                 point and get the same result but that is not the case as this.instructions is not reset. */
        const fileInstructions = this.transpileFile(semanticTree);

        const fileAssembly = this.convertInstructionsToAssembly(fileInstructions);

        return fileAssembly;
    }

    private convertInstructionsToAssembly (instructions: Instructions.Instruction[]): string
    {
        let assembly = '';

        for (const instruction of instructions)
        {
            assembly += instruction.text + "\n";
        }

        return assembly;
    }

    private transpileFile (fileNode: SemanticNodes.File): Instructions.Instruction[]
    {
        const fileInstructions: Instructions.Instruction[] = [];

        for (const functionNode of fileNode.functions)
        {
            this.transpileFunction(functionNode);
        }

        fileInstructions.push(
            // Start the programme with calling the main function:
            new Instructions.SingleOperand('call', 'main'),
            // Then exit it properly:
            new Instructions.SingleOperand('jmp', 'exit'),
        );

        fileInstructions.push(...this.constants);

        fileInstructions.push(...this.instructions);

        fileInstructions.push(
            new Instructions.Label('exit'), // Exit function -> TODO: This should be part of the standard library!
            new Instructions.Instruction('cli'), // Disable all interrupts.
            new Instructions.Instruction('sleep'), // Put the microcontroller into sleep mode.
        );

        return fileInstructions;
    }

    private transpileFunction (functionNode: SemanticNodes.FunctionDeclaration): void
    {
        return;
    }
}
