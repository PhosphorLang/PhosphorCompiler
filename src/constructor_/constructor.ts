import ActionToken from "./actionToken";
import ActionTreeNode from "./actionTreeNode";
import SemanticalType from "./semanticalType";
import SyntaxNode from "../parser/syntaxNodes/syntaxNode";
import Token from "../lexer/token";
import TokenType from "../lexer/tokenType";
import UnknownTokenError from "../errors/unknownTokenError";

export default class Constructor
{
    private fileName: string;

    private functions: Set<string>;
    private constantValueToActionTokenMap: Map<string, ActionToken>;
    private constantIdCounter: number;

    constructor ()
    {
        this.functions = new Set<string>(['print']);

        this.constantValueToActionTokenMap = new Map<string, ActionToken>();
        this.constantIdCounter = 0;
        this.fileName = '';
    }

    public run (syntaxTree: SyntaxNode): ActionTreeNode
    {
        this.fileName = syntaxTree.value.content; // The first node is the file node, containing the file name.

        const actionTreeNode = this.constructNode(syntaxTree, null);

        this.constructConstants(actionTreeNode);

        // Clear the temporary lists and counters:
        this.constantValueToActionTokenMap.clear();
        this.constantIdCounter = 0;

        return actionTreeNode;
    }

    /**
     * Construct all constants by adding their definition action tokens to the action tree root.
     * @param actionTree The action tree to add the constants to.
     */
    private constructConstants (actionTree: ActionTreeNode): void
    {
        for (const constantActionToken of this.constantValueToActionTokenMap.values())
        {
            new ActionTreeNode(actionTree, constantActionToken);
        }
    }

    private constructNode (node: SyntaxNode, parent: ActionTreeNode|null): ActionTreeNode
    {
        let result: ActionTreeNode;

        switch (node.value.type)
        {
            /*
            case TokenType.File:
            {
                const fileActionToken = new ActionToken(SemanticalType.File, node.value.content);
                result = new ActionTreeNode(parent, fileActionToken);

                break;
            }
            */
            case TokenType.IdentifierToken:
            {
                if (!this.functions.has(node.value.content))
                {
                    throw new UnknownTokenError('function', this.fileName, node.value);
                }

                const functionActionToken = new ActionToken(SemanticalType.Function, node.value.content);
                result = new ActionTreeNode(parent, functionActionToken);

                break;
            }
            case TokenType.IntegerToken:
            {
                const constantId = this.getConstantId(node.value);
                const numberActionToken = new ActionToken(SemanticalType.IntegerLiteral, constantId, node.value.content);
                result = new ActionTreeNode(parent, numberActionToken);

                break;
            }
            case TokenType.StringToken:
            {
                const constantId = this.getConstantId(node.value);
                const stringActionToken = new ActionToken(SemanticalType.StringLiteral, constantId, node.value.content);
                result = new ActionTreeNode(parent, stringActionToken);

                break;
            }
            case TokenType.PlusOperator:
            {
                const additionActionToken = new ActionToken(SemanticalType.Addition);
                result = new ActionTreeNode(parent, additionActionToken);

                break;
            }
            default:
                throw new UnknownTokenError('lexical type', this.fileName, node.value);
        }

        for (const child of node.children)
        {
            this.constructNode(child, result);
        }

        return result;
    }

    /**
     * Will get the ID for a constant by looking up the constant value to action token map.
     * If there is no ID for the given constant value, a new one is created.
     * @param constantValue The value of the constant.
     * @return The ID for the given constant.
     */
    private getConstantId (constantToken: Token): string
    {
        let actionToken = this.constantValueToActionTokenMap.get(constantToken.content);

        if (actionToken === undefined)
        {
            const constantId = `c_${this.constantIdCounter}`;
            this.constantIdCounter++;

            let constantType: SemanticalType;

            switch (constantToken.type)
            {
                case TokenType.IntegerToken:
                    constantType = SemanticalType.IntegerDefinition;
                    break;
                case TokenType.StringToken:
                    constantType = SemanticalType.StringDefinition;
                    break;
                default:
                    throw new UnknownTokenError('lexical type of constant', this.fileName, constantToken);
            }

            actionToken = new ActionToken(constantType, constantId, constantToken.content);
        }

        this.constantValueToActionTokenMap.set(constantToken.content, actionToken);

        return actionToken.id;
    }
}
