import SyntaxTreeNode from "../../src/parser/syntaxTreeNode";
import Token from "../../src/lexer/token";

export default class SyntaxTreeBuilder
{
    private root: SyntaxTreeNode;
    private current: SyntaxTreeNode;

    constructor (token: Token)
    {
        this.root = new SyntaxTreeNode(null, token);
        this.current = this.root;
    }

    /**
     * Create a new SyntaxTreeBuilder, starting at the given token.
     * @param token The token to start at.
     * @returns The SyntaxTreeBuilder at the node created from the token.
     */
    public static new (token: Token): SyntaxTreeBuilder
    {
        return new SyntaxTreeBuilder(token);
    }

    /**
     * Add a new token as child to the current node and move to the child.
     * @param token The token to add as new child.
     * @returns The SyntaxTreeBuilder at the node created from the token.
     */
    public add (token: Token): SyntaxTreeBuilder
    {
        this.current = new SyntaxTreeNode(this.current, token);

        return this;
    }

    /**
     * Add a new token as child to the current node ("after it"), staying at the current node.
     * @param token The token to add as child.
     * @returns The SyntaxTreeBuilder at the same node as before.
     */
    public addAfter (token: Token): SyntaxTreeBuilder
    {
        new SyntaxTreeNode(this.current, token);

        return this;
    }

    /**
     * Got to the parent of the current node.
     * @returns The SyntaxTreeBuilder with the paren of the current node as new current node.
     */
    public toParent (): SyntaxTreeBuilder
    {
        if (this.current.parent === null)
        {
            throw new Error('Cannot get parent. Parent is null.');
        }
        else
        {
            this.current = this.current.parent;
        }

        return this;
    }

    /**
     * Get the root SyntaxTreeNode from the builder.
     * @returns The root SyntaxTreeNode.
     */
    public getRoot (): SyntaxTreeNode
    {
        return this.root;
    }
}
