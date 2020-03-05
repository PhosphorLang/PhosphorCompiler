import fs from 'fs';
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

    public run (filePath: string): Token[] // TODO: Change this from filePath to fileString.
    {
        const tokens: Token[] = [];

        const file = fs.readFileSync(filePath, {encoding: 'utf8'});

        let match: RegExpExecArray | null;
        do
        {
            match = this.wordSplitterRegex.exec(file);
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
