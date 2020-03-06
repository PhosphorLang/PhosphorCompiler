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
        let currentSyntaxNode = syntaxTree;

        const fileActionToken = new ActionToken(SemanticalType.file, currentSyntaxNode.value.content);
        const actionTreeNode = new ActionTreeNode(null, fileActionToken);

        currentSyntaxNode = currentSyntaxNode.children[0];

        if (currentSyntaxNode.value.type !== LexicalType.id)
        {
            throw new Error('Expected identifier, got "' + currentSyntaxNode.value.content + '".');
        }

        const functionId = this.functions.indexOf(currentSyntaxNode.value.content);

        if (functionId === -1)
        {
            throw new Error('Unknown function "' + currentSyntaxNode.value.content + '"');
        }

        const functionActionToken = new ActionToken(SemanticalType.function, currentSyntaxNode.value.content);
        const functionActionNode = new ActionTreeNode(actionTreeNode, functionActionToken);

        currentSyntaxNode = currentSyntaxNode.children[0];

        if (currentSyntaxNode.value.type !== LexicalType.number)
        {
            throw new Error('Expected integer literal, got "' + currentSyntaxNode.value.content + '".');
        }

        const parameterActionToken = new ActionToken(SemanticalType.integerLiteral, currentSyntaxNode.value.content);
        new ActionTreeNode(functionActionNode, parameterActionToken);

        return actionTreeNode;
    }
}
