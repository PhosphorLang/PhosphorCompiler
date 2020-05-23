import * as SemanticNodes from "../../../connector/semanticNodes";
import * as SemanticSymbols from "../../../connector/semanticSymbols";
import BuildInOperators from "../../../definitions/buildInOperators";
import BuildInTypes from "../../../definitions/buildInTypes";
import LocationManagerAmd64Linux from "./locationManagerAmd64Linux";
import RegistersAmd64Linux from "./registersAmd64Linux";
import SemanticKind from "../../../connector/semanticKind";
import Transpiler from "../../transpiler";
import LocationedVariable from "../../common/locationedVariable";

export default class TranspilerAmd64Linux extends LocationManagerAmd64Linux implements Transpiler
{
    protected code: string[];
    private constantCode: string[];

    /**
     * A counter for generating unqiue constant IDs.
     */
    private constantCounter: number;

    constructor ()
    {
        super();

        this.code = [];
        this.constantCode = [];
        this.constantCounter = 0;
    }

    public run (semanticTree: SemanticNodes.File): string
    {
        this.code = [];
        this.constantCode = [];
        this.constantCounter = 0;

        const fileAssembly = this.transpileFile(semanticTree);

        const result = fileAssembly.join("\n") + "\n";

        return result;
    }

    private transpileFile (fileNode: SemanticNodes.File): string[]
    {
        const assembly: string[] = [];

        for (const functionNode of fileNode.functions)
        {
            this.transpileFunction(functionNode);
        }

        assembly.push('[section .rodata]');

        assembly.push(...this.constantCode);

        assembly.push(
            '[section .text]',
            // FIXME: The following hardcoded externs must definitely be replaced with a proper import functionality.
            '[extern print]',
            '[extern exit]',
            // The start routine calls main and then exits properly:
            '[global _start]',
            '_start:',
            'call main',
            'call exit',
        );

        assembly.push(...this.code);

        return assembly;
    }

    private transpileFunction (functionNode: SemanticNodes.FunctionDeclaration): void
    {
        this.code.push(functionNode.symbol.name + ':'); // Function name

        // Save base pointer:
        this.code.push(`push ${RegistersAmd64Linux.stackBasePointer.bit64}`);
        // Set base pointer to current stack pointer:
        this.code.push(`mov ${RegistersAmd64Linux.stackBasePointer.bit64}, ${RegistersAmd64Linux.stackPointer.bit64}`);

        this.addNewVariableStack(true);

        let parameterCounter = 0;
        for (const parameter of functionNode.symbol.parameters)
        {
            if (parameterCounter >= RegistersAmd64Linux.integerArguments.length)
            {
                throw new Error('Transpiler error: Stack parameters are not supported.');
            }

            const register = RegistersAmd64Linux.integerArguments[parameterCounter];
            parameterCounter++;

            this.pushVariable(parameter, register);
        }

        this.transpileSection(functionNode.section);

        this.removeLastVariableStack(true);
    }

    private transpileSection (sectionNode: SemanticNodes.Section): void
    {
        this.addNewVariableStack();

        for (const statement of sectionNode.statements)
        {
            this.transpileStatement(statement);
        }

        this.removeLastVariableStack();
    }

    private transpileStatement (statementNode: SemanticNodes.SemanticNode): void
    {
        switch (statementNode.kind)
        {
            case SemanticKind.Section:
                this.transpileSection(statementNode as SemanticNodes.Section);
                break;
            case SemanticKind.VariableDeclaration:
                this.transpileVariableDeclaration(statementNode as SemanticNodes.VariableDeclaration);
                break;
            case SemanticKind.ReturnStatement:
                this.transpileReturnStatement(statementNode as SemanticNodes.ReturnStatement);
                break;
            case SemanticKind.Assignment:
                this.transpileAssignment(statementNode as SemanticNodes.Assignment);
                break;
            default:
                this.transpileExpression(statementNode as SemanticNodes.Expression);
        }
    }

    private transpileVariableDeclaration (variableDeclarationNode: SemanticNodes.VariableDeclaration): void
    {
        const variableLocation = this.pushVariable(variableDeclarationNode.symbol);

        if (variableDeclarationNode.initialiser !== null)
        {
            this.transpileExpression(variableDeclarationNode.initialiser, variableLocation);
        }
    }

    private transpileReturnStatement (returnStatementNode: SemanticNodes.ReturnStatement): void
    {
        if (returnStatementNode.expression !== null)
        {
            const temporaryVariable = new SemanticSymbols.Variable('return', returnStatementNode.expression.type, false);
            const temporaryLocationedVariable = new LocationedVariable(temporaryVariable, RegistersAmd64Linux.integerReturn);

            // TODO: Replace hard coded return register with actual type and size:
            this.transpileExpression(returnStatementNode.expression, temporaryLocationedVariable);
        }

        this.code.push(
            'leave',
            'ret',
        );
    }

    private transpileAssignment (assignmentNode: SemanticNodes.Assignment): void
    {
        const variableLocation = this.getVariableLocation(assignmentNode.variable);

        this.transpileExpression(assignmentNode.expression, variableLocation);
    }

    private transpileExpression (expressionNode: SemanticNodes.Expression, targetLocation?: LocationedVariable): void
    {
        if (targetLocation === undefined)
        {
            switch (expressionNode.kind)
            {
                case SemanticKind.CallExpression:
                    this.transpileCallExpression(expressionNode as SemanticNodes.CallExpression);
                    break;
                default:
                    throw new Error(`Transpile error: The expression of kind "${expressionNode.kind}" cannot be used as a statement.`);
            }
        }
        else
        {
            switch (expressionNode.kind)
            {
                case SemanticKind.LiteralExpression:
                    this.transpileLiteralExpression(expressionNode as SemanticNodes.LiteralExpression, targetLocation);
                    break;
                case SemanticKind.VariableExpression:
                    this.transpileVariableExpression(expressionNode as SemanticNodes.VariableExpression, targetLocation);
                    break;
                case SemanticKind.CallExpression:
                    this.transpileCallExpression(expressionNode as SemanticNodes.CallExpression, targetLocation);
                    break;
                case SemanticKind.UnaryExpression:
                    this.transpileUnaryExpression(expressionNode as SemanticNodes.UnaryExpression, targetLocation);
                    break;
                case SemanticKind.BinaryExpression:
                    this.transpileBinaryExpression(expressionNode as SemanticNodes.BinaryExpression, targetLocation);
                    break;
                default:
                    throw new Error(`Transpiler error: No implementation for expression of kind "${expressionNode.kind}"`);
            }
        }
    }

    private transpileLiteralExpression (literalExpression: SemanticNodes.LiteralExpression, targetLocation: LocationedVariable): void
    {
        switch (literalExpression.type)
        {
            case BuildInTypes.int:
                this.code.push(`mov ${targetLocation.locationString}, ${literalExpression.value}`);
                break;
            case BuildInTypes.string:
            {
                // We need an encoded string to get the real byte count:
                const encoder = new TextEncoder();
                const encodedString = encoder.encode(literalExpression.value);

                const constantLength = encodedString.length;

                const constantId = `c_${this.constantCounter}`;
                this.constantCounter++;

                // The string is a byte array prefixed with it's (platform dependent) length:
                this.constantCode.push(
                    `${constantId}:`,
                    `dq ${constantLength}`,
                    `db '${literalExpression.value}'`,
                );

                this.code.push(
                    `mov ${targetLocation.locationString}, ${constantId}`,
                );

                break;
            }
            default:
                throw new Error(`Transpiler error: Unknown literal of type "${literalExpression.type}".`);
        }
    }

    private transpileVariableExpression (variableExpression: SemanticNodes.VariableExpression, targetLocation: LocationedVariable): void
    {
        const variableLocation = this.getVariableLocation(variableExpression.variable);

        this.code.push(`mov ${targetLocation.locationString}, ${variableLocation.locationString}`);
    }

    private transpileCallExpression (callExpression: SemanticNodes.CallExpression, targetLocation?: LocationedVariable): void
    {
        let argumentCounter = 0;
        for (const argument of callExpression.arguments)
        {
            if (argumentCounter >= RegistersAmd64Linux.integerArguments.length)
            {
                throw new Error('Transpiler error: Stack arguments are not supported.');
            }

            const register = RegistersAmd64Linux.integerArguments[argumentCounter];

            // The arguments will be treated as temporary variables:
            const locationedArgument = this.pushVariable(callExpression.functionSymbol.parameters[argumentCounter], register);

            // The argument is an expression that must be placed into the register for this parameter:
            this.transpileExpression(argument, locationedArgument);

            argumentCounter++;
        }

        this.saveRegistersForFunctionCall(targetLocation);

        this.code.push(`call ${callExpression.functionSymbol.name}`);

        this.restoreRegistersAfterFunctionCall();

        // We must free the temporary variables again after the function call:
        for (const parameter of callExpression.functionSymbol.parameters)
        {
            this.freeVariable(parameter);
        }

        if ((targetLocation !== undefined) && (targetLocation.location !== RegistersAmd64Linux.integerReturn))
        {
            // TODO: Replace hard coded return register with actual type and size:
            this.code.push(`mov ${targetLocation.locationString}, ${RegistersAmd64Linux.integerReturn.bit64}`);
        }
    }

    private transpileUnaryExpression (unaryExpression: SemanticNodes.UnaryExpression, targetLocation: LocationedVariable): void
    {
        this.transpileExpression(unaryExpression.operand, targetLocation);

        const operator = unaryExpression.operator;

        switch (operator)
        {
            case BuildInOperators.unaryIntAddition:
                // An unary addition has no effect.
                break;
            case BuildInOperators.unaryIntSubtraction:
                this.moveVariableToRegister(targetLocation);
                this.code.push(`neg ${targetLocation.locationString}`);
                break;
            default:
                throw new Error(
                    `Transpiler error: The operator "${operator.kind}" for operand of "${operator.operandType}" and ` +
                    `result of "${operator.resultType}" is not implemented.`
                );
        }
    }

    private transpileBinaryExpression (_binaryExpression: SemanticNodes.BinaryExpression, _targetLocation: LocationedVariable): void
    {
        /* A
        const operator = binaryExpression.operator;

        switch (operator)
        {
            case BuildInOperators.binaryIntAddition:
                break;
            case BuildInOperators.binaryIntSubtraction:
                break;
            case BuildInOperators.binaryIntMultiplication:
                break;
            case BuildInOperators.binaryIntDivision:
                break;
            default:
                throw new Error(
                    `Transpiler error: The operator "${operator.kind}" for the operands of "${operator.leftType}" and ` +
                    `"${operator.leftType}" with the result type of "${operator.rightType}" is not implemented.`
                );
        }
        */
    }
}
