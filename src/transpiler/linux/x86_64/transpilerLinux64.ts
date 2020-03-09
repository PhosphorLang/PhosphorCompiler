import ActionTreeNode from "../../../constructor_/actionTreeNode";
import SemanticalType from "../../../constructor_/semanticalType";
import Transpiler from "../../transpiler";

export default class TranspilerLinux64 implements Transpiler
{
    public run (actionTree: ActionTreeNode): string
    {
        const assembly: string[] = [];
        const constants: string[] = [];
        const code: string[] = [];

        this.transpileNode(actionTree, constants, code);

        assembly.push('section .rodata');

        assembly.push(...constants);

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

    private transpileNode (node: ActionTreeNode, constants: string[], code: string[]): void
    {
        for (const child of node.children)
        {
            this.transpileNode(child, constants, code);
        }

        switch (node.value.type)
        {
            case SemanticalType.IntegerDefinition:
            {
                constants.push(node.value.id + ': db ' + node.value.content);

                break;
            }
            case SemanticalType.StringDefinition:
            {
                constants.push(node.value.id + ': db ' + "'" + node.value.content + "'");

                break;
            }
            case SemanticalType.IntegerLiteral:
            {
                code.push(
                    'mov rdi, ' + node.value.id,
                    'mov rsi, 1'
                );

                break;
            }
            case SemanticalType.StringLiteral:
            {
                // We need an encoded string to get the real byte count:
                const encoder = new TextEncoder();
                const encodedString = encoder.encode(node.value.content);

                const constantLength = encodedString.length;

                code.push(
                    'mov rdi, ' + node.value.id,
                    'mov rsi, ' + `${constantLength}`,
                );

                break;
            }
            case SemanticalType.Function:
            {
                code.push('call ' + node.value.id);

                break;
            }
            case SemanticalType.File:
            {
                code.push(
                    'mov rdi, 0',
                    'mov rax, 60',
                    'syscall'
                );

                break;
            }
            default:
                throw new Error('Unknown semantical type for "' + node.value.id + '"');
        }
    }
}
