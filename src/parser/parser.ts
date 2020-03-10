import LexicalType from "../lexer/lexicalType";
import Operator from "../definitions/operator";
import StatementType from "./statementType";
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
        const parseResult = this.parseScope(tokens, 0);

        const root = parseResult.nodes[0];

        return root;
    }

    private parseScope (tokens: Token[], startIndex: number): ParserResult
    {
        const nodes: SyntaxTreeNode[] = [];

        let i = startIndex;
        while (i < tokens.length)
        {
            const token = tokens[i];

            if (token.type == LexicalType.File)
            {
                const fileRoot = new SyntaxTreeNode(null, token);
                nodes.push(fileRoot);

                const parserResult = this.parseScope(tokens, i + 1);

                for (const child of parserResult.nodes)
                {
                    child.parent = fileRoot;
                }

                i = parserResult.lastIndex;
            }
            else if (token.type == LexicalType.Id)
            {
                const idNode = new SyntaxTreeNode(null, token);
                nodes.push(idNode);

                const parserResult = this.parseStatement(tokens, i + 1);

                for (const child of parserResult.nodes)
                {
                    child.parent = idNode;
                }

                i = parserResult.lastIndex;
            }
            else
            {
                throw new Error('Given token "' + token.content + '" is no scope.');
            }

            i++;
        }

        return {
            nodes: nodes,
            lastIndex: i,
        };
    }

    private parseStatement (tokens: Token[], startIndex: number): ParserResult
    {
        const result: SyntaxTreeNode[] = [];
        const stack: SyntaxTreeNode[] = [];
        let statementType = StatementType.None;

        let i = startIndex;
        while (i < tokens.length)
        {
            const token = tokens[i];

            if (token.type == LexicalType.Id)
            {
                stack.push(new SyntaxTreeNode(null, token));
                statementType = StatementType.UnaryLeft;
            }
            else if (token.content == Operator.plus)
            {
                stack.push(new SyntaxTreeNode(null, token));
                statementType = StatementType.Binary;
            }
            else if (token.content == Operator.openingBracket)
            {
                const subResult = this.parseStatement(tokens, i + 1);
                stack.push(...subResult.nodes);
                i = subResult.lastIndex;
            }
            else if ((token.type == LexicalType.Number) || (token.type == LexicalType.String))
            {
                stack.push(new SyntaxTreeNode(null, token));
            }
            else if ((token.content == Operator.closingBracket) || (token.content == Operator.semicolon))
            {
                break;
            }
            else
            {
                throw new Error('Unknown token "' + token.content + '"');
            }

            i++;
        }

        if (statementType == StatementType.None)
        {
            result.push(...stack);

            return {
                nodes: result,
                lastIndex: i,
            };
        }
        else if (statementType == StatementType.UnaryLeft)
        {
            stack[1].parent = stack[0];

            return {
                nodes: [stack[0]],
                lastIndex: i,
            };
        }
        else if (statementType == StatementType.Binary)
        {
            stack[0].parent = stack[1];
            stack[2].parent = stack[1];

            return {
                nodes: [stack[1]],
                lastIndex: i,
            };
        }
        else
        {
            throw new Error('Unknown statement type');
        }
    }
}
