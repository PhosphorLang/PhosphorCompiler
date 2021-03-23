import * as SemanticNodes from "../../connector/semanticNodes";
import Instruction from "../common/instructions/instruction";
import LabelInstruction from "../common/instructions/labelInstruction";
import LocationManagerAvr from "./locationManagerAvr";
import SingleOperandInstruction from "../common/instructions/singleOperandInstruction";
import Transpiler from "../transpiler";

export default class TranspilerAvr implements Transpiler
{
    private instructions: Instruction[];
    private constants: Instruction[];

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

        const fileInstructions = this.transpileFile(semanticTree);

        const fileAssembly = this.convertInstructionsToAssembly(fileInstructions);

        return fileAssembly;
    }

    private convertInstructionsToAssembly (instructions: Instruction[]): string
    {
        let assembly = '';

        for (const instruction of instructions)
        {
            assembly += instruction.text + "\n";
        }

        return assembly;
    }

    private transpileFile (fileNode: SemanticNodes.File): Instruction[]
    {
        const fileInstructions: Instruction[] = [];

        for (const functionNode of fileNode.functions)
        {
            this.transpileFunction(functionNode);
        }

        fileInstructions.push(
            // Start the programme with calling the main function:
            new SingleOperandInstruction('call', 'f_main'),
            // Then exit it properly:
            new SingleOperandInstruction('jmp', 'exit'),
        );

        fileInstructions.push(...this.constants);

        fileInstructions.push(...this.instructions);

        fileInstructions.push(
            new LabelInstruction('exit'), // Exit function -> TODO: This should be part of the standard library!
            new Instruction('cli'), // Disable all interrupts.
            new Instruction('sleep'), // Put the microcontroller into sleep mode.
        );

        return fileInstructions;
    }

    private transpileFunction (functionNode: SemanticNodes.FunctionDeclaration): void
    {
        return;
    }
}
