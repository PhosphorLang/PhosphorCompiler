import LexicalType from './lexicalType';
import Token from './token';

export default class Lexer
{
    private wordSplitterRegex: RegExp;

    private numberTestRegex: RegExp;
    private idTestRegex: RegExp;

    constructor ()
    {
        this.wordSplitterRegex = /(\S+)/g;
        this.numberTestRegex = /^\d+$/;
        this.idTestRegex = /^[a-zA-Z]+$/;
    }

    public run (fileContent: string): Token[]
    {
        const tokens: Token[] = [];

        let match: RegExpExecArray | null;
        do
        {
            match = this.wordSplitterRegex.exec(fileContent);
            if (match)
            {
                const word = match[1];

                let token: Token;

                if (this.numberTestRegex.test(word))
                {
                    token = new Token(LexicalType.number, word);
                }
                else if (this.idTestRegex.test(word))
                {
                    token = new Token(LexicalType.id, word);
                }
                else
                {
                    throw new Error('Unknown token "' + word + '"');
                }

                tokens.push(token);
            }
        }
        while (match);

        return tokens;
    }
}
