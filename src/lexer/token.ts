import LineInformation from "../definitions/lineInformation";
import TokenKind from "./tokenKind";

export default class Token implements LineInformation
{
    public readonly kind: TokenKind;
    public readonly content: string;
    public readonly fileName: string;
    public readonly lineNumber: number;
    public readonly columnNumber: number;

    constructor (kind: TokenKind, content: string, fileName = '', line = 0, column = 0)
    {
        this.kind = kind;
        this.content = content;
        this.fileName = fileName;
        this.lineNumber = line;
        this.columnNumber = column;
    }
}
