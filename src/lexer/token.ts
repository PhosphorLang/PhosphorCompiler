import LineInformation from "../definitions/lineInformation";
import TokenKind from "./tokenKind";

export default class Token implements LineInformation
{
    public readonly kind: TokenKind;
    public readonly content: string;
    public readonly line: number;
    public readonly column: number;

    constructor (kind: TokenKind, content: string, line = 0, column = 0)
    {
        this.kind = kind;
        this.content = content;
        this.line = line;
        this.column = column;
    }
}
