import ActionToken from "./actionToken";
import ActionTreeNode from "./actionTreeNode";
import LexicalType from "../lexer/lexicalType";
import SemanticalType from "./semanticalType";
import SyntaxTreeNode from "../parser/syntaxTreeNode";

export default class Constructor
{
    private functions: string[];

    constructor ()
    {
        this.functions = ['print'];
    }

    public run (syntaxTree: SyntaxTreeNode): ActionTreeNode
    {
        const actionTreeNode = this.constructNode(syntaxTree, null);

        return actionTreeNode;
    }

    public constructNode (node: SyntaxTreeNode, parent: ActionTreeNode|null): ActionTreeNode
    {
        let result: ActionTreeNode;

        switch (node.value.type)
        {
            case LexicalType.file:
            {
                const fileActionToken = new ActionToken(SemanticalType.file, node.value.content);
                result = new ActionTreeNode(parent, fileActionToken);

                break;
            }
            case LexicalType.id:
            {
                const functionId = this.functions.indexOf(node.value.content);

                if (functionId === -1)
                {
                    throw new Error('Unknown function "' + node.value.content + '"');
                }

                const functionActionToken = new ActionToken(SemanticalType.function, node.value.content);
                result = new ActionTreeNode(parent, functionActionToken);

                break;
            }
            case LexicalType.number:
            {
                const numberActionToken = new ActionToken(SemanticalType.integerLiteral, node.value.content);
                result = new ActionTreeNode(parent, numberActionToken);

                // TODO: Should we check for children here because they are not allowed?
                //       -> No, the parser should do this. Does he?

                break;
            }
            default:
                throw new Error('Unknown lexical type of symbol "' + node.value.content + '"');
        }

        for (const child of node.children)
        {
            this.constructNode(child, result);
        }

        return result;
    }
}
