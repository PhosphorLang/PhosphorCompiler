import ActionToken from "../../../constructor_/actionToken";
import ActionTreeNode from "../../../constructor_/actionTreeNode";
import SemanticalType from "../../../constructor_/semanticalType";
import Transpiler from "../../transpiler";

export default class TranspilerLinux64 implements Transpiler
{
    /**
     * Constant name to constant action token.
     */
    private constants: Map<string, ActionToken>;

    constructor ()
    {
        this.constants = new Map<string, ActionToken>();
    }

    public run (actionTree: ActionTreeNode): string
    {
        const assembly: string[] = [];

        const code = this.transpileNode(actionTree);

        assembly.push('section .rodata');

        assembly.push(...this.transpileCollectedConstants());

        assembly.push(
            'section .text',
            'global _start',
            'extern print',
            '_start:'
        );

        assembly.push(...code);

        const result = assembly.join("\n");

        return result;
    }

    private transpileNode (node: ActionTreeNode): string[]
    {
        const result: string[] = [];

        for (const child of node.children)
        {
            result.push(...this.transpileNode(child));
        }

        switch (node.value.type)
        {
            case SemanticalType.IntegerLiteral:
            {
                const constantName = 'constant_' + node.value.content;

                this.constants.set(constantName, node.value);

                result.push(
                    'mov rdi, ' + constantName,
                    'mov rsi, 1'
                );

                break;
            }
            case SemanticalType.StringLiteral:
            {
                const constantName = 'constant_' + node.value.content;

                this.constants.set(constantName, node.value);

                const constantLength = node.value.content.length;

                result.push(
                    'mov rdi, ' + constantName,
                    'mov rsi, ' + `${constantLength}`,
                );

                break;
            }
            case SemanticalType.Function:
            {
                result.push('call ' + node.value.content);

                break;
            }
            case SemanticalType.File:
            {
                result.push(
                    'mov rdi, 0',
                    'mov rax, 60',
                    'syscall'
                );

                break;
            }
            default:
                throw new Error('Unknown semantical type of symbol "' + node.value.content + '"');
        }

        return result;
    }

    private transpileCollectedConstants (): string[]
    {
        const result: string[] = [];

        for (const [name, token] of this.constants)
        {
            let constantAssembler: string;

            switch (token.type)
            {
                case SemanticalType.IntegerLiteral:
                {
                    constantAssembler = name + ': db ' + token.content;

                    break;
                }
                case SemanticalType.StringLiteral:
                {
                    constantAssembler = name + ': db ' + "'" + token.content + "'";

                    break;
                }
                default:
                    throw new Error('Unknown semantical type of constant "' + token.content + '"');
            }

            result.push(constantAssembler);
        }

        return result;
    }
}
