import LexicalType from './lexicalType';
import Operator from '../definitions/operator';
import Token from './token';

export default class Lexer
{
    private tokenSplitterRegex: RegExp;

    private numberTestRegex: RegExp;
    private idTestRegex: RegExp;

    private operatorList: Set<string>;

    constructor ()
    {
        this.tokenSplitterRegex = /\d+|[a-zA-Z]+|\(|\)/g;

        this.numberTestRegex = /^\d+$/;
        this.idTestRegex = /^[a-zA-Z]+$/;

        this.operatorList = new Set();
        for (const operator of Object.values(Operator))
        {
            this.operatorList.add(operator);
        }
    }

    public run (fileContent: string): Token[]
    {
        const tokens: Token[] = [];

        let match: RegExpExecArray | null;
        do
        {
            match = this.tokenSplitterRegex.exec(fileContent);
            if (match)
            {
                const fullMatch = match[0];

                let token: Token;

                if (this.numberTestRegex.test(fullMatch))
                {
                    token = new Token(LexicalType.number, fullMatch);
                }
                else if (this.operatorList.has(fullMatch))
                {
                    token = new Token(LexicalType.operator, fullMatch);
                }
                else if (this.idTestRegex.test(fullMatch))
                {
                    token = new Token(LexicalType.id, fullMatch);
                }
                else
                {
                    throw new Error('Unknown token "' + fullMatch + '"');
                }

                tokens.push(token);
            }
        }
        while (match);

        return tokens;
    }
}
