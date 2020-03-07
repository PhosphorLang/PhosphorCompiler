import ActionTreeNode from "../../../constructor_/actionTreeNode";
import SemanticalType from "../../../constructor_/semanticalType";
import Transpiler from "../../transpiler";

export default class TranspilerLinux64 implements Transpiler
{
    /**
     * Constant value to constant name.
     */
    private constants: Map<string, string>;

    constructor ()
    {
        this.constants = new Map<string, string>();
    }

    public run (actionTree: ActionTreeNode): string
    {
        const strings = this.transpileNode(actionTree);

        const result = strings.join("\n");

        return result;
    }

    private transpileNode (node: ActionTreeNode): string[]
    {
        let result: string[];

        switch (node.value.type)
        {
            case SemanticalType.integerLiteral:
            {
                // The constant name will never be undefined because we inserted all of them getConstants:
                const constantName = this.constants.get(node.value.content) as string;

                result = [
                    'mov rdi, ' + constantName,
                    'mov rsi, 1'
                ];

                break;
            }
            case SemanticalType.function:
            {
                result = this.transpileNode(node.children[0]);

                result.push('call ' + node.value.content);

                break;
            }
            case SemanticalType.file:
            {
                result = [
                    'section .rodata'
                ];

                for (const child of node.children)
                {
                    result.push(...this.getConstants(child));
                }

                result.push(
                    'section .text',
                    'global _start',
                    'extern print',
                    '_start:'
                );

                for (const child of node.children)
                {
                    result.push(...this.transpileNode(child));
                }

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

    private getConstants (node: ActionTreeNode): string[]
    {
        if (node.value.type === SemanticalType.integerLiteral)
        {
            const constantName = 'constant_' + node.value.content;

            if (this.constants.has(node.value.content))
            {
                return [];
            }
            else
            {
                this.constants.set(node.value.content, constantName);

                return [
                    constantName + ': db ' + node.value.content
                ];
            }
        }
        else if (node.children.length > 0)
        {
            return this.getConstants(node.children[0]);
        }
        else
        {
            return [];
        }
    }
}
