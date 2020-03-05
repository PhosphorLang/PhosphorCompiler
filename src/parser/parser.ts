import LexicalType from "../lexer/lexicalType";
import SyntaxTreeNode from "./syntaxTreeNode";
import Token from "../lexer/token";

export default class Parser
{
    public run (tokens: Token[], filePath: string): SyntaxTreeNode
    {
        const fileToken = new Token(LexicalType.file, filePath);
        const root = new SyntaxTreeNode(null, fileToken);

        let currentNode = root;

        for (const token of tokens)
        {
            if (token.type == LexicalType.id)
            {
                const idNode = new SyntaxTreeNode(currentNode, token);

                currentNode = idNode;
            }
            else if (token.type == LexicalType.number)
            {
                if (currentNode.value.type == LexicalType.id)
                {
                    const parameterNode = new SyntaxTreeNode(currentNode, token);

                    currentNode = parameterNode;
                }
                else
                {
                    throw new Error('Invalid syntax at token "' + token.content + '"');
                }
            }
        }

        return root;
    }
}
