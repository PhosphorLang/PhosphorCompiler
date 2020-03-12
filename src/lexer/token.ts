import LexicalType from "./lexicalType";

export default class Token
{
    public readonly type: LexicalType;
    public readonly content: string;

    constructor (type: LexicalType, content: string)
    {
        this.type = type;
        this.content = content;
    }
}
