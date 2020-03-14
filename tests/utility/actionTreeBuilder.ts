import ActionToken from "../../src/constructor_/actionToken";
import ActionTreeNode from "../../src/constructor_/actionTreeNode";

export default class ActionTreeBuilder
{
    private root: ActionTreeNode;
    private current: ActionTreeNode;

    constructor (actionToken: ActionToken)
    {
        this.root = new ActionTreeNode(null, actionToken);
        this.current = this.root;
    }

    /**
     * Create a new ActionTreeBuilder, starting at the given ActionToken.
     * @param actionToken The ActionToken to start at.
     * @returns The ActionTreeBuilder at the node created from the ActionToken.
     */
    public static new (actionToken: ActionToken): ActionTreeBuilder
    {
        return new ActionTreeBuilder(actionToken);
    }

    /**
     * Add a new ActionToken as child to the current node and move to the child.
     * @param actionToken The ActionToken to add as new child.
     * @returns The ActionTreeBuilder at the node created from the ActionToken.
     */
    public add (actionToken: ActionToken): ActionTreeBuilder
    {
        this.current = new ActionTreeNode(this.current, actionToken);

        return this;
    }

    /**
     * Add a new ActionToken as child to the current node ("after it"), staying at the current node.
     * @param actionToken The ActionToken to add as child.
     * @returns The ActionTreeBuilder at the same node as before.
     */
    public addAfter (actionToken: ActionToken): ActionTreeBuilder
    {
        new ActionTreeNode(this.current, actionToken);

        return this;
    }

    /**
     * Got to the parent of the current node.
     * @returns The ActionTreeBuilder with the paren of the current node as new current node.
     */
    public toParent (): ActionTreeBuilder
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
     * Get the root ActionTreeNode from the builder.
     * @returns The root ActionTreeNode.
     */
    public getRoot (): ActionTreeNode
    {
        return this.root;
    }
}
