import Token from './token';
import TokenType from './tokenType';
import UnknownSymbolError from '../errors/unknownSymbolError';
import UnterminatedStringError from '../errors/unterminatedStringError';

interface ContentAndType
{
    content: string;
    type: TokenType;
}

export default class Lexer
{
    private fileName: string;
    private text: string;
    private position: number;
    private line: number;
    private column: number;

    private readonly numberTestRegex: RegExp;
    private readonly identifierTestRegex: RegExp;

    constructor ()
    {
        this.fileName = '';
        this.text = '';
        this.position = 0;
        this.line = 1;
        this.column = 1;

        this.numberTestRegex = /\d/;
        this.identifierTestRegex = /[a-zA-Z]/;
    }

    private getNextChar (): string
    {
        let result = '';

        if (this.position < this.text.length)
        {
            result = this.text[this.position];

            this.position++;
        }

        return result;
    }

    /**
     * Run the lexer.
     * @param fileContent The content of the file
     * @param fileName The name/path of the file
     * @param setLineInfo If true the tokens will include line and column numbers, otherwise they will always be zero.
     * @returns The generated list of tokens.
     */
    public run (fileContent: string, fileName: string, setLineInfo = true): Token[]
    {
        this.fileName = fileName;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.text = fileContent;

        if ((this.text === '') || (!this.text.endsWith("\n")))
        {
            this.text += "\n"; // Go sure the text ends with a line ending.
        }

        const tokens: Token[] = [];
        while (this.position < this.text.length)
        {
            const token = this.lex(setLineInfo);

            if (token !== null)
            {
                tokens.push(token);
            }
        }

        return tokens;
    }

    public lex (setLineInfo: boolean): Token|null
    {
        let type: TokenType|undefined = undefined;
        let content = this.getNextChar();

        switch (content)
        {
            case "\n":
                this.line++;
                this.column = 1;
                return null;
            case ' ':
                this.column++;
                return null;
            case '(':
                type = TokenType.OpeningBracketToken;
                break;
            case ')':
                type = TokenType.ClosingBracketToken;
                break;
            case '+':
                type = TokenType.PlusOperator;
                break;
            case ':':
                if (this.getNextChar() === '=')
                {
                    type = TokenType.AssignmentOperator;
                    content = ':=';
                }
                else
                {
                    throw new UnknownSymbolError(content, this.fileName, {line: this.line, column: this.column});
                }
                break;
            case ';':
                type = TokenType.SemicolonToken;
                break;
            case "'":
                type = TokenType.StringToken;
                content = this.readString();
                break;
            default:
            {
                this.position--;

                let readResult: ContentAndType;

                if (this.numberTestRegex.test(content))
                {
                    readResult = this.readNumber();
                }
                else if (this.identifierTestRegex.test(content))
                {
                    readResult = this.readIdentifierOrKeyword();
                }
                else
                {
                    throw new UnknownSymbolError(content, this.fileName, {line: this.line, column: this.column});
                }

                content = readResult.content;
                type = readResult.type;
            }
        }

        let token: Token;
        if (setLineInfo)
        {
            token = new Token(type, content, this.line, this.column);
        }
        else
        {
            token = new Token(type, content);
        }

        this.column++;

        return token;
    }

    private readString (): string
    {
        const start = this.position;

        let continueReading = true;
        while (continueReading)
        {
            switch (this.getNextChar())
            {
                case '':
                case "\n":
                    throw new UnterminatedStringError(this.fileName, {line: this.line, column: this.column});
                case "'":
                    continueReading = false;
                    break;
            }
        }

        const content = this.text.slice(start, this.position - 1);

        this.column += this.position - start - 1;

        return content;
    }

    private readNumber (): ContentAndType
    {
        const content = this.readWhileRegexPasses(this.numberTestRegex);

        return {
            content: content,
            type: TokenType.IntegerToken,
        };
    }

    private readIdentifierOrKeyword (): ContentAndType
    {
        const content = this.readWhileRegexPasses(this.identifierTestRegex);
        let type: TokenType;

        switch (content)
        {
            case 'var':
                type = TokenType.VarKeyword;
                break;
            default:
                type = TokenType.IdentifierToken;
        }

        return {
            content: content,
            type: type,
        };
    }

    /**
     * Read a token while the given regex' test function returns true.
     * @param regex The regex to test with.
     * @returns The read content.
     */
    private readWhileRegexPasses (regex: RegExp): string
    {
        const start = this.position;

        let nextChar: string;
        do
        {
            nextChar = this.getNextChar();
        }
        while (regex.test(nextChar));

        this.position--;
        const content = this.text.slice(start, this.position);

        this.column += this.position - start - 1;

        return content;
    }
}
