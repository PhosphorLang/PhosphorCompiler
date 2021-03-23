import Instruction from "../common/instructions/instruction";

export default class LocationManagerAvr
{
    public instructions: Instruction[];

    constructor (instructions: Instruction[])
    {
        this.instructions = instructions;
    }
}
