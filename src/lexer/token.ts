import LexicalType from "./lexicalType";
import LineInformation from "../definitions/lineInformation";

export default class Token implements LineInformation
{
    public readonly type: LexicalType;
    public readonly content: string;
    public readonly line: number;
    public readonly column: number;

    constructor (type: LexicalType, content: string, line = 0, column = 0)
    {
        this.type = type;
        this.content = content;
        this.line = line;
        this.column = column;
    }
}
