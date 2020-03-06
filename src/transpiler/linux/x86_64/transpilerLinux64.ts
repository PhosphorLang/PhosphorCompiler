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
        switch (node.value.type)
        {
            case SemanticalType.integerLiteral:
            {
                // The constant name will never be undefined because we inserted all of them getConstants:
                const constantName = this.constants.get(node.value.content) as string;

                return [
                    'mov rdi, ' + constantName,
                    'mov rsi, 1'
                ];
            }
            case SemanticalType.function:
            {
                const result = this.transpileNode(node.children[0]);

                result.push('call ' + node.value.content);

                return result;
            }
            case SemanticalType.file:
            {
                const result: string[] = [
                    'section .rodata'
                ];
                result.push(...this.getConstants(node.children[0]));

                result.push(
                    'section .text',
                    'global _start',
                    'extern print',
                    '_start:'
                );

                result.push(...this.transpileNode(node.children[0]));

                result.push(
                    'mov rdi, 0',
                    'mov rax, 60',
                    'syscall'
                );

                return result;
            }
            default:
                throw new Error('Unknown semantical type of symbol "' + node.value.content + '"');
        }
    }

    private getConstants (node: ActionTreeNode): string[]
    {
        if (node.value.type === SemanticalType.integerLiteral)
        {
            const constantName = 'constant_' + node.value.content;

            this.constants.set(node.value.content, constantName);

            return [
                constantName + ': db ' + node.value.content
            ];
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
