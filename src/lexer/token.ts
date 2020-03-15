import LineInformation from "../definitions/lineInformation";
import TokenType from "./tokenType";

export default class Token implements LineInformation
{
    public readonly type: TokenType;
    public readonly content: string;
    public readonly line: number;
    public readonly column: number;

    constructor (type: TokenType, content: string, line = 0, column = 0)
    {
        this.type = type;
        this.content = content;
        this.line = line;
        this.column = column;
    }
}
