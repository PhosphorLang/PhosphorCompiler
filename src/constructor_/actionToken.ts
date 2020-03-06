import SemanticalType from "./semanticalType";

export default class ActionToken
{
    public readonly type: SemanticalType;
    public readonly content: string;

    constructor (type: SemanticalType, content: string)
    {
        this.type = type;
        this.content = content;
    }
}
