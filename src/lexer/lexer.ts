import * as Diagnostic from '../diagnostic';
import { Token } from './token';
import { TokenKind } from './tokenKind';

interface ContentAndKind
{
    content: string;
    kind: TokenKind;
}

export class Lexer
{
    private readonly diagnostic: Diagnostic.Diagnostic;

    private fileName: string;
    private text: string;
    private position: number;
    private line: number;
    private column: number;

    private readonly numberTestRegex: RegExp;
    private readonly identifierTestRegex: RegExp;

    constructor (diagnostic: Diagnostic.Diagnostic)
    {
        this.diagnostic = diagnostic;

        this.fileName = '';
        this.text = '';
        this.position = 0;
        this.line = 1;
        this.column = 1;

        this.numberTestRegex = /\d/;
        this.identifierTestRegex = /[a-zA-Z]/; // TODO: Replace with /[a-zA-Z]+\w*|_\w*[a-zA-Z0-9]+_*/
    }

    private getNextChar (): string
    {
        let result = '';

        if (this.position < this.text.length)
        {
            result = this.text[this.position];
        }

        this.position++;

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
        let kind: TokenKind|undefined = undefined;
        let content = this.getNextChar();

        switch (content)
        {
            case "\r":
                if (this.getNextChar() !== "\n")
                {
                    this.position--;
                }
                // Fallthrough, because "\r" (Mac) and "\r\n" (Windows) must be treated as "\n" (Linux, Unix).
            case "\n":
                this.line++;
                this.column = 1;
                return null;
            case ' ':
                this.column++;
                return null;
            case '(':
                kind = TokenKind.OpeningParenthesisToken;
                break;
            case ')':
                kind = TokenKind.ClosingParenthesisToken;
                break;
            case '{':
                kind = TokenKind.OpeningCurlyBraceToken;
                break;
            case '}':
                kind = TokenKind.ClosingCurlyBraceToken;
                break;
            case '[':
                kind = TokenKind.OpeningSquareBracketToken;
                break;
            case ']':
                kind = TokenKind.ClosingSquareBracketToken;
                break;
            case '.':
                kind = TokenKind.DotToken;
                break;
            case ':':
                if (this.getNextChar() === '=')
                {
                    kind = TokenKind.AssignmentOperator;
                    content = ':=';
                }
                else
                {
                    this.position--;

                    kind = TokenKind.ColonToken;
                }
                break;
            case ';':
                kind = TokenKind.SemicolonToken;
                break;
            case ',':
                kind = TokenKind.CommaToken;
                break;
            case '+':
                kind = TokenKind.PlusOperator;
                break;
            case '-':
                kind = TokenKind.MinusOperator;
                break;
            case '*':
                kind = TokenKind.StarOperator;
                break;
            case '/':
            {
                const nextChar = this.getNextChar();
                if (nextChar === '/')
                {
                    kind = TokenKind.LineCommentToken;
                    content = this.readLineComment();
                }
                else if (nextChar === '*')
                {
                    kind = TokenKind.BlockCommentToken;
                    content = this.readBlockComment();
                }
                else
                {
                    this.position--;

                    kind = TokenKind.SlashOperator;
                }
                break;
            }
            case '%':
                kind = TokenKind.PercentOperator;
                break;
            case '=':
                kind = TokenKind.EqualOperator;
                break;
            case '<':
                kind = TokenKind.LessOperator;
                break;
            case '>':
                kind = TokenKind.GreaterOperator;
                break;
            case '!':
                if (this.getNextChar() === '=')
                {
                    kind = TokenKind.NotEqualOperator;
                    content = '!=';
                }
                else
                {
                    this.position--;

                    kind = TokenKind.NotOperator;
                }
                break;
            case '&':
                kind = TokenKind.AndOperator;
                break;
            case '|':
                kind = TokenKind.OrOperator;
                break;
            case "'":
                kind = TokenKind.StringToken;
                content = this.readString();
                break;
            default:
            {
                this.position--;

                let readResult: ContentAndKind;

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
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Unknown token "${content}"`,
                            Diagnostic.Codes.UnknownTokenError,
                            {
                                fileName: this.fileName,
                                lineNumber: this.line,
                                columnNumber: this.column
                            }
                        )
                    );
                }

                content = readResult.content;
                kind = readResult.kind;
            }
        }

        let token: Token;
        if (setLineInfo)
        {
            token = new Token(kind, content, this.fileName, this.line, this.column);
        }
        else
        {
            token = new Token(kind, content);
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
                case "\r":
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            'Unterminated string',
                            Diagnostic.Codes.UnterminatedStringError,
                            {
                                fileName: this.fileName,
                                lineNumber: this.line,
                                columnNumber: this.column
                            }
                        )
                    );
                // Does not fall through as this.diagnostic.throw never returns.
                case "'":
                    continueReading = false;
                    break;
            }
        }

        const content = this.text.slice(start, this.position - 1);

        this.column += this.position - start - 1;

        return content;
    }

    private readLineComment (): string
    {
        const start = this.position;

        let continueReading = true;
        while (continueReading)
        {
            switch (this.getNextChar())
            {
                case '':
                case "\n":
                case "\r":
                    continueReading = false;
                    break;
            }
        }

        const content = this.text.slice(start, this.position - 1);

        this.column += this.position - start - 2; // Include the leading "//", thus -2.

        return content;
    }

    private readBlockComment (): string
    {
        const start = this.position;

        let continueReading = true;
        while (continueReading)
        {
            switch (this.getNextChar())
            {
                case '':
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            'Unterminated block comment',
                            Diagnostic.Codes.UnterminatedBlockCommentError,
                            {
                                fileName: this.fileName,
                                lineNumber: this.line,
                                columnNumber: this.column
                            }
                        )
                    );
                // Does not fall through as this.diagnostic.throw never returns.
                case "*":
                    if (this.getNextChar() === '/')
                    {
                        continueReading = false;
                    }
                    break;
            }
        }

        const content = this.text.slice(start, this.position - 2);

        this.column += this.position - start - 2;

        return content;
    }

    private readNumber (): ContentAndKind
    {
        const content = this.readWhileRegexPasses(this.numberTestRegex);

        return {
            content: content,
            kind: TokenKind.IntegerToken,
        };
    }

    private readIdentifierOrKeyword (): ContentAndKind
    {
        const content = this.readWhileRegexPasses(this.identifierTestRegex);
        let kind: TokenKind;

        switch (content)
        {
            case 'var':
                kind = TokenKind.VarKeyword;
                break;
            case 'function':
                kind = TokenKind.FunctionKeyword;
                break;
            case 'return':
                kind = TokenKind.ReturnKeyword;
                break;
            case 'header':
                kind = TokenKind.HeaderKeyword;
                break;
            case 'if':
                kind = TokenKind.IfKeyword;
                break;
            case 'else':
                kind = TokenKind.ElseKeyword;
                break;
            case 'while':
                kind = TokenKind.WhileKeyword;
                break;
            case 'true':
                kind = TokenKind.TrueKeyword;
                break;
            case 'false':
                kind = TokenKind.FalseKeyword;
                break;
            case 'module':
                kind = TokenKind.ModuleKeyword;
                break;
            case 'import':
                kind = TokenKind.ImportKeyword;
                break;
            default:
                kind = TokenKind.IdentifierToken;
        }

        return {
            content: content,
            kind: kind,
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
