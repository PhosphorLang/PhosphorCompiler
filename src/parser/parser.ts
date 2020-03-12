import LexicalType from "../lexer/lexicalType";
import Operator from "../definitions/operator";
import SyntaxTreeNode from "./syntaxTreeNode";
import Token from "../lexer/token";

interface ParserResult
{
    nodes: SyntaxTreeNode[];
    lastIndex: number;
}

export default class Parser
{
    /**
     * Run the parser for a given token list of a file.
     * @param tokens The list of tokens
     * @return The parsed syntax tree.
     */
    public run (tokens: Token[]): SyntaxTreeNode
    {
        const root = this.parseFile(tokens);

        return root;
    }

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

    private parseScope (tokens: Token[], startIndex: number): ParserResult
    {
        const nodes: SyntaxTreeNode[] = [];

        let i = startIndex;
        while (i < tokens.length)
        {
            // There can only be statements inside a scope:
            const parserResult = this.parseStatement(tokens, i);

            nodes.push(...parserResult.nodes);
            i = parserResult.lastIndex + 1;
        }

        return {
            nodes: nodes,
            lastIndex: i,
        };
    }

    private parseStatement (tokens: Token[], startIndex: number): ParserResult
    {
        let node: SyntaxTreeNode;
        let children: SyntaxTreeNode[] = [];
        let lastIndex = startIndex;

        const token = tokens[lastIndex];

        if (token.type == LexicalType.Id)
        {
            // We assume a function here.

            node = new SyntaxTreeNode(null, token);

            const result = this.parseFunctionParameters(tokens, lastIndex + 1);

            children = result.nodes;
            lastIndex = result.lastIndex;
        }
        else if ((token.type == LexicalType.Operator) && (token.content == Operator.var))
        {
            node = new SyntaxTreeNode(null, token);

            const result = this.parseVariableDeclaration(tokens, lastIndex + 1);

            children = result.nodes;
            lastIndex = result.lastIndex;
        }
        else
        {
            throw new Error('Unknown statement "' + token.content + '"');
        }

        lastIndex++;
        const endToken = tokens[lastIndex];

        if ((endToken.type != LexicalType.Operator) || (endToken.content != Operator.semicolon))
        {
            throw new Error('A statement must end with a semicolon.');
        }

        for (const child of children)
        {
            child.parent = node;
        }

        return {
            nodes: [node],
            lastIndex: lastIndex,
        };
    }

    private parseFunctionParameters (tokens: Token[], startIndex: number): ParserResult
    {
        let node: SyntaxTreeNode|null = null;
        let currentIndex = startIndex;

        const startToken = tokens[currentIndex];
        currentIndex++;

        if ((startToken.type != LexicalType.Operator) || (startToken.content != Operator.openingBracket))
        {
            throw new Error('A function parameter list must start with an opening bracket.');
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
                    throw new Error('The given token "' + parameterToken.content + '" is no valid function parameter.');
                }
        }

        const endToken = tokens[currentIndex];

        if ((endToken.type != LexicalType.Operator) || (endToken.content != Operator.closingBracket))
        {
            throw new Error('A function parameter list must end with an closing bracket.');
        }

        return {
            nodes: node === null ? [] : [node],
            lastIndex: currentIndex,
        };
    }

    private parseVariableDeclaration (tokens: Token[], startIndex: number): ParserResult
    {
        const token = tokens[startIndex];

        if (token.type == LexicalType.Id)
        {
            const node = new SyntaxTreeNode(null, token);

            return {
                nodes: [node],
                lastIndex: startIndex,
            };
        }
        else
        {
            throw new Error('Expected identifier in variable declaration, got "' + token.content + '".');
        }
    }
}
