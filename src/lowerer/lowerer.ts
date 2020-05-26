import * as SemanticNodes from "../connector/semanticNodes";
import * as SemanticSymbols from "../connector/semanticSymbols";
import SemanticKind from "../connector/semanticKind";

/**
 * The lowerer "lowers" semantic by breaking up abstracted structures (like an if statement) into simpler components (e.g. multiple goto
 * statements). This makes implementing a backend much easier because the number of different node kinds is smaller.
 */
export default class Lowerer
{
    private labelCounter: number;

    constructor ()
    {
        this.labelCounter = 0;
    }

    public run (fileSemanticNode: SemanticNodes.File): SemanticNodes.File
    {
        this.labelCounter = 0;

        const loweredFile = this.lowerFile(fileSemanticNode);

        return loweredFile;
    }

    private generateLabel (): SemanticSymbols.Label
    {
        const newLabel = new SemanticSymbols.Label(`l#${this.labelCounter}`);

        this.labelCounter++;

        return newLabel;
    }

    private lowerFile (file: SemanticNodes.File): SemanticNodes.File
    {
        const loweredFunctions: SemanticNodes.FunctionDeclaration[] = [];

        for (const functionNode of file.functions)
        {
            const loweredFunction = this.lowerFunction(functionNode);

            loweredFunctions.push(loweredFunction);
        }

        file.functions = loweredFunctions;

        return file;
    }

    private lowerFunction (functionDeclaration: SemanticNodes.FunctionDeclaration): SemanticNodes.FunctionDeclaration
    {
        const loweredSection = this.lowerSection(functionDeclaration.section);

        functionDeclaration.section = loweredSection;

        return functionDeclaration;
    }

    private lowerSection (section: SemanticNodes.Section): SemanticNodes.Section
    {
        const loweredStatements: SemanticNodes.SemanticNode[] = [];

        for (const statement of section.statements)
        {
            const loweredStatement = this.lowerStatement(statement);

            loweredStatements.push(...loweredStatement);
        }

        section.statements = loweredStatements;

        return section;
    }

    private lowerStatement (statement: SemanticNodes.SemanticNode): SemanticNodes.SemanticNode[]
    {
        switch (statement.kind)
        {
            case SemanticKind.Section:
                return [this.lowerSection(statement as SemanticNodes.Section)];
            case SemanticKind.VariableDeclaration:
                return [this.lowerVariableDeclaration(statement as SemanticNodes.VariableDeclaration)];
            case SemanticKind.ReturnStatement:
                return [this.lowerReturnStatement(statement as SemanticNodes.ReturnStatement)];
            case SemanticKind.IfStatement:
                return this.lowerIfStatement(statement as SemanticNodes.IfStatement);
            case SemanticKind.Assignment:
                return [this.lowerAssignment(statement as SemanticNodes.Assignment)];
            default:
                return [this.lowerExpression(statement as SemanticNodes.Expression)];
        }
    }

    private lowerVariableDeclaration (variableDeclaration: SemanticNodes.VariableDeclaration): SemanticNodes.VariableDeclaration
    {
        if (variableDeclaration.initialiser !== null)
        {
            const loweredInitialiser = this.lowerExpression(variableDeclaration.initialiser);

            variableDeclaration.initialiser = loweredInitialiser;
        }

        return variableDeclaration;
    }

    private lowerReturnStatement (returnStatement: SemanticNodes.ReturnStatement): SemanticNodes.ReturnStatement
    {
        if (returnStatement.expression !== null)
        {
            const loweredExpression = this.lowerExpression(returnStatement.expression);

            returnStatement.expression = loweredExpression;
        }

        return returnStatement;
    }

    private lowerIfStatement (ifStatement: SemanticNodes.IfStatement): SemanticNodes.SemanticNode[]
    {
        const condition = this.lowerExpression(ifStatement.condition);
        const section = this.lowerSection(ifStatement.section);

        const endLabelSymbol = this.generateLabel();
        const endLabel = new SemanticNodes.Label(endLabelSymbol);

        if (ifStatement.elseClause === null)
        {
            /* Single if statement:

                if <condition>
                    <section>

                -->

                goto <condition> endLabel false
                <section>
                endLabel:
            */

            const conditionalEndLabelGoto = new SemanticNodes.ConditionalGotoStatement(endLabelSymbol, condition, false);

            return [
                conditionalEndLabelGoto,
                section,
                endLabel,
            ];
        }
        else
        {
            /* If statement with else clause:

                if <condition>
                    <section>
                else
                    <elseFollowUp>

                -->

                goto <condition> elseLabel false
                <section>
                goto endLabel
                elseLabel:
                <elseFollowUp>
                endLabel:
            */

            const elseFollowUp = this.lowerStatement(ifStatement.elseClause.followUp);

            const elseLabelSymbol = this.generateLabel();
            const elseLabel = new SemanticNodes.Label(elseLabelSymbol);
            const conditionalElseLabelGoto = new SemanticNodes.ConditionalGotoStatement(elseLabelSymbol, condition, false);
            const endLabelGoto = new SemanticNodes.GotoStatement(endLabelSymbol);

            return [
                conditionalElseLabelGoto,
                section,
                endLabelGoto,
                elseLabel,
                ...elseFollowUp,
                endLabel,
            ];
        }
    }

    private lowerAssignment (assignment: SemanticNodes.Assignment): SemanticNodes.Assignment
    {
        if (assignment.expression !== null)
        {
            const loweredExpression = this.lowerExpression(assignment.expression);

            assignment.expression = loweredExpression;
        }

        return assignment;
    }

    private lowerExpression (expression: SemanticNodes.Expression): SemanticNodes.Expression
    {
        switch (expression.kind)
        {
            case SemanticKind.LiteralExpression:
            case SemanticKind.VariableExpression:
                return expression; // These expressions do not need to be lowered.
            case SemanticKind.CallExpression:
                return this.lowerCallExpression(expression as SemanticNodes.CallExpression);
            case SemanticKind.UnaryExpression:
                return this.lowerUnaryExpression(expression as SemanticNodes.UnaryExpression);
            case SemanticKind.BinaryExpression:
                return this.lowerBinaryExpression(expression as SemanticNodes.BinaryExpression);
            default:
                throw new Error(`Lowerer error: No implementation for expression of kind "${expression.kind}"`);
        }
    }

    private lowerCallExpression (callExpression: SemanticNodes.CallExpression): SemanticNodes.CallExpression
    {
        const loweredArguments: SemanticNodes.Expression[] = [];

        for (const argumentExpression of callExpression.arguments)
        {
            const loweredArgument = this.lowerExpression(argumentExpression);

            loweredArguments.push(loweredArgument);
        }

        callExpression.arguments = loweredArguments;

        return callExpression;
    }

    private lowerUnaryExpression (unaryExpression: SemanticNodes.UnaryExpression): SemanticNodes.UnaryExpression
    {
        const loweredOperand = this.lowerExpression(unaryExpression.operand);

        unaryExpression.operand = loweredOperand;

        return unaryExpression;
    }

    private lowerBinaryExpression (binaryExpression: SemanticNodes.BinaryExpression): SemanticNodes.BinaryExpression
    {
        const loweredLeftOperand = this.lowerExpression(binaryExpression.leftOperand);
        const loweredRightOperand = this.lowerExpression(binaryExpression.rightOperand);

        binaryExpression.leftOperand = loweredLeftOperand;
        binaryExpression.rightOperand = loweredRightOperand;

        return binaryExpression;
    }
}
