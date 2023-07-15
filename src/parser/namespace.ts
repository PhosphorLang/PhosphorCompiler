import { Token } from '../lexer/token';

export class Namespace
{
    public readonly name: string;
    public readonly pathName: string;
    public readonly qualifiedName: string;

    constructor (prefixComponents: Token[], pathComponents: Token[], name: Token)
    {
        this.name = name.content;

        // TODO: It could be better to not have the seperators hardcoded here.

        let pathName = this.joinTokenArray(pathComponents);
        if (pathName.length > 0)
        {
            pathName += '.';
        }
        pathName += name.content;

        this.pathName = pathName;

        let qualifiedName = this.joinTokenArray(prefixComponents);
        if (qualifiedName.length > 0)
        {
            qualifiedName += ':';
        }
        qualifiedName += pathName;

        this.qualifiedName = qualifiedName;
    }

    private joinTokenArray (tokens: Token[]): string
    {
        // TODO: It could be better to not have the seperator hardcoded here.

        const result = new Array<string>(tokens.length);

        for (let i = 0; i < tokens.length; i++)
        {
            result[i] = tokens[i].content;
        }

        return result.join('.');
    }
}
