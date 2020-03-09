import SemanticalType from "./semanticalType";

export default class ActionToken
{
    public readonly type: SemanticalType;
    public readonly id: string;
    public readonly content: string;

    constructor (type: SemanticalType, id = '', value = '')
    {
        this.type = type;
        this.id = id;
        this.content = value;
    }
}
