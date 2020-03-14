import InvalidTokenError from "../errors/invalidTokenError";
import LexicalType from "../lexer/lexicalType";
import Operator from "../definitions/operator";
import SyntaxTreeNode from "./syntaxTreeNode";
import Token from "../lexer/token";
import UnexpectedTokenError from "../errors/unexpectedTokenError";
import UnknownTokenError from "../errors/unknownTokenError";

/** The result of a parser, containing multiple nodes. */
interface ParserScopeResult
{
    nodes: SyntaxTreeNode[];
    lastIndex: number;
}

/** The result of a parser, containing a single node. */
interface ParserStatementResult
{
    node: SyntaxTreeNode;
    lastIndex: number;
}

export default class Parser
{
    private fileName: string;

    constructor ()
    {
        this.fileName = '';
    }

    /**
     * Run the parser for a given token list of a file.
     * @param tokens The list of tokens
     * @return The parsed syntax tree.
     */
    public run (tokens: Token[]): SyntaxTreeNode
    {
        this.fileName = tokens[0].content; // The first token is the file token.

        const root = this.parseFile(tokens);

        return root;
    }

    /**
     * Parse a file scope. This initialises the parsing process.
     * @param tokens
     * @returns
     */
    private parseFile (tokens: Token[]): SyntaxTreeNode
    {
        const fileRoot = new SyntaxTreeNode(null, tokens[0]);

        // The file token starts a scope:
        const parserResult = this.parseScope(tokens, 1);

        for (const child of parserResult.nodes)
        {
            child.parent = fileRoot;
        }

        return fileRoot;
    }

    /**
     * Parse a scope, returning multiple nodes.
     * @param tokens
     * @param startIndex
     * @returns
     */
    private parseScope (tokens: Token[], startIndex: number): ParserScopeResult
    {
        const nodes: SyntaxTreeNode[] = [];

        let i = startIndex;
        while (i < tokens.length)
        {
            // There can only be statements inside a scope:
            const parserResult = this.parseStatement(tokens, i);

            nodes.push(parserResult.node);
            i = parserResult.lastIndex + 1;
        }

        return {
            nodes: nodes,
            lastIndex: i,
        };
    }

    /**
     * Parse a statement, returning a single node.
     * @param tokens
     * @param startIndex
     * @returns
     */
    private parseStatement (tokens: Token[], startIndex: number): ParserStatementResult
    {
        let node: SyntaxTreeNode;
        const children: SyntaxTreeNode[] = [];
        let lastIndex = startIndex;

        const token = tokens[lastIndex];

        if (token.type == LexicalType.Id)
        {
            const result = this.parseIdentificator(tokens, lastIndex);

            node = result.node;
            lastIndex = result.lastIndex;
        }
        else if ((token.type == LexicalType.Operator) && (token.content == Operator.var))
        {
            node = new SyntaxTreeNode(null, token);

            const result = this.parseVariableDeclaration(tokens, lastIndex + 1);

            children.push(result.node);
            lastIndex = result.lastIndex;
        }
        else
        {
            throw new UnknownTokenError('statement', this.fileName, token);
        }

        lastIndex++;
        const endToken = tokens[lastIndex];

        if ((endToken.type != LexicalType.Operator) || (endToken.content != Operator.semicolon))
        {
            throw new InvalidTokenError('A statement must end with a semicolon.', this.fileName, token);
        }

        for (const child of children)
        {
            child.parent = node;
        }

        return {
            node: node,
            lastIndex: lastIndex,
        };
    }

    /**
     * Parse an identificator, deciding its function by looking at it's neighbours, returning a single node.
     * @param tokens
     * @param startIndex
     * @returns
     */
    private parseIdentificator (tokens: Token[], startIndex: number): ParserStatementResult
    {
        let currentIndex = startIndex;

        const identificatorToken = tokens[currentIndex];

        let node: SyntaxTreeNode;

        const followerToken = tokens[currentIndex + 1];

        switch (followerToken.content)
        {
            case Operator.openingBracket:
            {
                node = new SyntaxTreeNode(null, identificatorToken);

                const result = this.parseFunctionParameters(tokens, currentIndex + 1);

                for (const child of result.nodes)
                {
                    child.parent = node;
                }

                currentIndex = result.lastIndex;

                break;
            }
            case Operator.assignment:
            {
                const result = this.parseAssignment(tokens, currentIndex);

                node = result.node;

                currentIndex = result.lastIndex;

                break;
            }
            default:
                throw new UnexpectedTokenError('identificator', this.fileName, followerToken);
        }

        return {
            node: node,
            lastIndex: currentIndex,
        };
    }

    /**
     * Parse a function parameter list, returning multiple nodes.
     * @param tokens
     * @param startIndex
     * @returns
     */
    private parseFunctionParameters (tokens: Token[], startIndex: number): ParserScopeResult
    {
        let node: SyntaxTreeNode|null = null;
        let currentIndex = startIndex;

        const startToken = tokens[currentIndex];
        currentIndex++;

        if ((startToken.type != LexicalType.Operator) || (startToken.content != Operator.openingBracket))
        {
            throw new InvalidTokenError('A function parameter list must start with an opening bracket.', this.fileName, startToken);
        }

        const parameterToken = tokens[currentIndex];

        switch (parameterToken.type)
        {
            case LexicalType.Number:
            case LexicalType.String:
            {
                node = new SyntaxTreeNode(null, parameterToken);

                currentIndex++;

                break;
            }
            default:
                if (parameterToken.content != Operator.closingBracket)
                {
                    throw new InvalidTokenError(
                        `The given token "${parameterToken.content}" is no valid function parameter.`,
                        this.fileName,
                        startToken
                    );
                }
        }

        const endToken = tokens[currentIndex];

        if ((endToken.type != LexicalType.Operator) || (endToken.content != Operator.closingBracket))
        {
            throw new InvalidTokenError('A function parameter list must end with an closing bracket.', this.fileName, startToken);
        }

        return {
            nodes: node === null ? [] : [node],
            lastIndex: currentIndex,
        };
    }

    /**
     * Parse a variable declaration, returning a single node.
     * @param tokens
     * @param startIndex
     * @return
     */
    private parseVariableDeclaration (tokens: Token[], startIndex: number): ParserStatementResult
    {
        const token = tokens[startIndex];

        if (token.type == LexicalType.Id)
        {
            const node = new SyntaxTreeNode(null, token);

            return {
                node: node,
                lastIndex: startIndex,
            };
        }
        else
        {
            throw new InvalidTokenError('Expected identifier in variable declaration, got "' + token.content + '".', this.fileName, token);
        }
    }

    private parseAssignment (tokens: Token[], startIndex: number): ParserStatementResult
    {
        const node = new SyntaxTreeNode(null, tokens[startIndex + 1]);
        new SyntaxTreeNode(node, tokens[startIndex]);

        const secondArgumentToken = tokens[startIndex + 2];

        switch (secondArgumentToken.type)
        {
            case LexicalType.Number:
            case LexicalType.String:
            {
                new SyntaxTreeNode(node, secondArgumentToken);

                break;
            }
            default:
                throw new InvalidTokenError(
                    `The given token "${secondArgumentToken.content}" is no valid second argument for an assignment.`,
                    this.fileName,
                    secondArgumentToken
                );
        }

        return {
            node: node,
            lastIndex: startIndex + 2,
        };
    }
}
