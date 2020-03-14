import LexicalType from './lexicalType';
import Operator from '../definitions/operator';
import Token from './token';
import UnknownSymbolError from '../errors/unknownSymbolError';

export default class Lexer
{
    private tokenSplitterRegex: RegExp;

    private numberTestRegex: RegExp;
    private stringTestRegex: RegExp;
    private idTestRegex: RegExp;

    private operatorList: Set<string>;

    constructor ()
    {
        this.tokenSplitterRegex = /'(.*?)'|\d+|[a-zA-Z]+|:=|\S|\n/g;

        this.numberTestRegex = /^\d+$/;
        this.stringTestRegex = /^'.*'$/;
        this.idTestRegex = /^[a-zA-Z]+$/;

        this.operatorList = new Set();
        for (const operator of Object.values(Operator))
        {
            this.operatorList.add(operator);
        }
    }

    /**
     * Run the lexer.
     * @param fileContent The content of the file
     * @param filePath The path of the file
     * @param setLineInfo If true the tokens will include line and column numbers, otherwise they will always be zero.
     * @returns The generated list of tokens.
     */
    public run (fileContent: string, filePath: string, setLineInfo = true): Token[]
    {
        const tokens: Token[] = [];

        let currentLine = 1;
        /** The position from the beginning of the file at which the last line ended, or: The position of the last line break. */
        let lastLineEndPosition = -1;

        const fileToken = new Token(LexicalType.File, filePath);
        tokens.push(fileToken);

        let match: RegExpExecArray | null;
        do
        {
            match = this.tokenSplitterRegex.exec(fileContent);
            if (match)
            {
                const fullMatch = match[0];

                let token: Token;
                let currentColumn: number;

                if (fullMatch === "\n")
                {
                    currentLine++;
                    lastLineEndPosition = match.index;

                    continue;
                }
                else
                {
                    if (setLineInfo)
                    {
                        currentColumn = match.index - lastLineEndPosition;
                    }
                    else
                    {
                        currentLine = 0;
                        currentColumn = 0;
                    }
                }

                if (this.numberTestRegex.test(fullMatch))
                {
                    token = new Token(LexicalType.Number, fullMatch, currentLine, currentColumn);
                }
                else if (this.stringTestRegex.test(fullMatch))
                {
                    const stringContent = match[1];

                    token = new Token(LexicalType.String, stringContent, currentLine, currentColumn);
                }
                else if (this.operatorList.has(fullMatch))
                {
                    token = new Token(LexicalType.Operator, fullMatch, currentLine, currentColumn);
                }
                else if (this.idTestRegex.test(fullMatch))
                {
                    token = new Token(LexicalType.Id, fullMatch, currentLine, currentColumn);
                }
                else
                {
                    throw new UnknownSymbolError(fullMatch, {line: currentLine, column: currentColumn});
                }

                tokens.push(token);
            }
        }
        while (match);

        return tokens;
    }
}
