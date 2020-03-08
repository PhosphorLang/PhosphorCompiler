import LexicalType from "../lexer/lexicalType";
import Operator from "../definitions/operator";
import SyntaxTreeNode from "./syntaxTreeNode";
import Token from "../lexer/token";

export default class Parser
{
    /**
     * Run the parser for a given token list of a file.
     * @param tokens The list of tokens
     * @param filePath The path of the file
     * @return The parsed syntax tree.
     */
    public run (tokens: Token[], filePath: string): SyntaxTreeNode
    {
        const fileToken = new Token(LexicalType.File, filePath);
        const root = new SyntaxTreeNode(null, fileToken);

        let currentNode = root;
        let lastToken = fileToken;

        for (const token of tokens)
        {
            switch (token.type)
            {
                case LexicalType.Id:
                {
                    // The id becomes the new current node, now able to get children:
                    currentNode = new SyntaxTreeNode(currentNode, token);

                    break;
                }
                case LexicalType.Operator:
                {
                    switch (token.content)
                    {
                        case Operator.openingBracket:
                        {
                            if (currentNode.value.type != LexicalType.Id)
                            {
                                throw new Error('Unexpected operator "' + token.content + '"');
                            }

                            break;
                        }
                        case Operator.closingBracket:
                        {
                            if ((currentNode.parent !== null) && (currentNode.children.length > 0))
                            {
                                // Closing the bracket means whatever has been in it has ended, so we go a node upwards:
                                currentNode = currentNode.parent;
                            }
                            else
                            {
                                throw new Error('Unexpected operator "' + token.content + '"');
                            }

                            break;
                        }
                        case Operator.semicolon:
                        {
                            // Semicolon means end the statement, if there is one:
                            if ((currentNode.parent !== null) && (currentNode.parent.value.type === LexicalType.Id))
                            {
                                currentNode = currentNode.parent;
                            }
                            else
                            {
                                throw new Error('Unexpected operator "' + token.content + '"');
                            }

                            break;
                        }
                        default:
                            throw new Error('Unknown operator "' + token.content + '"');
                    }

                    break;
                }
                case LexicalType.Number:
                {
                    if ((currentNode.value.type == LexicalType.Id) && (lastToken.content == Operator.openingBracket))
                    {
                        // The number is an end point, not being able to get any children.
                        // So we only add it as a child and not set it as the new current node:
                        new SyntaxTreeNode(currentNode, token);
                    }
                    else
                    {
                        throw new Error('Unexpected number "' + token.content + '"');
                    }

                    break;
                }
                default:
                    throw new Error('Unknown lexical type of symbol "' + token.content + '"');
            }

            lastToken = token;
        }

        return root;
    }
}
