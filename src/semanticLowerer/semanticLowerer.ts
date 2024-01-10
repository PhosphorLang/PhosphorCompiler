import * as LoweredNodes from './loweredNodes';
import * as SemanticNodes from '../connector/semanticNodes';
import * as SemanticSymbols from '../connector/semanticSymbols';
import { BuildInFunctions } from '../definitions/buildInFunctions';
import { BuildInModules } from '../definitions/buildInModules';
import { BuildInOperators } from '../definitions/buildInOperators';
import { BuildInTypes } from '../definitions/buildInTypes';
import { SemanticKind } from '../connector/semanticKind';

/**
 * The semantic lowerer "lowers" semantic by breaking up abstracted structures (like an if statement) into simpler components
 * (e.g. multiple goto statements). This process is also known as "desugaring".
 */
export default class SemanticLowerer
{
    private labelCounter: number;

    private buildInImports: Set<SemanticSymbols.Module>;

    constructor ()
    {
        this.labelCounter = 0;
        this.buildInImports = new Set();
    }

    public run (fileSemanticNode: SemanticNodes.File): LoweredNodes.File
    {
        this.labelCounter = 0;
        this.buildInImports = new Set();

        const loweredFile = this.lowerFile(fileSemanticNode);

        return loweredFile;
    }

    private generateLabel (): SemanticSymbols.Label
    {
        const newLabel = new SemanticSymbols.Label(`l#${this.labelCounter}`);

        this.labelCounter++;

        return newLabel;
    }

    /**
     * Adds a build-in module to the imports if not already listed. \
     * Note that this must only be used for build-in modules (which are all header files by definition).
     * Will not check if the module really is build-in but will throw if it is not header-only.
     */
    private importBuildInModuleIfNeeded (moduleSymbol: SemanticSymbols.Module): void
    {
        for (const functionSymbol of moduleSymbol.functionNameToSymbol.values())
        {
            if (!functionSymbol.isHeader)
            {
                throw new Error(
                    `Semantic Lowerer error: Tried to lower build-in module "${moduleSymbol.name}" which includes non-header function.`
                );
            }
        }

        if (!this.buildInImports.has(moduleSymbol))
        {
            this.buildInImports.add(moduleSymbol);
        }
    }

    private lowerFile (file: SemanticNodes.File): LoweredNodes.File
    {
        const loweredGlobalVariables: LoweredNodes.GlobalVariableDeclaration[] = [];
        for (const globalVariable of file.variables)
        {
            const loweredGlobalVariable = this.lowerGlobalVariableDeclaration(globalVariable);

            loweredGlobalVariables.push(loweredGlobalVariable);
        }

        const loweredFunctions: LoweredNodes.FunctionDeclaration[] = [];
        for (const functionNode of file.functions)
        {
            const loweredFunction = this.lowerFunction(functionNode);

            loweredFunctions.push(loweredFunction);
        }

        // TODO: This set back and forth is a bit ugly:
        const loweredImportsSet = new Set<SemanticSymbols.Module>(file.imports);
        for (const buildInImport of this.buildInImports)
        {
            loweredImportsSet.add(buildInImport);
        }
        const loweredImports = Array.from(loweredImportsSet);

        return new LoweredNodes.File(file.name, file.module, loweredImports, loweredGlobalVariables, loweredFunctions);
    }

    private lowerGlobalVariableDeclaration (
        globalVariableDeclaration: SemanticNodes.GlobalVariableDeclaration
    ): LoweredNodes.GlobalVariableDeclaration
    {
        let loweredInitialiser: LoweredNodes.Expression|null = null;

        if (globalVariableDeclaration.initialiser !== null)
        {
            loweredInitialiser = this.lowerExpression(globalVariableDeclaration.initialiser);
        }

        return new LoweredNodes.GlobalVariableDeclaration(globalVariableDeclaration.symbol, loweredInitialiser);
    }

    private lowerFunction (functionDeclaration: SemanticNodes.FunctionDeclaration): LoweredNodes.FunctionDeclaration
    {
        let loweredSection = null;

        if (!functionDeclaration.symbol.isHeader)
        {
            if (functionDeclaration.section === null)
            {
                throw new Error(`Semantic Lowerer error: The section of a non-external function is null."`);
            }

            loweredSection = this.lowerSection(functionDeclaration.section);
        }

        return new LoweredNodes.FunctionDeclaration(functionDeclaration.symbol, loweredSection);
    }

    private lowerSection (section: SemanticNodes.Section): LoweredNodes.Section
    {
        const loweredStatements: LoweredNodes.Statement[] = [];

        for (const statement of section.statements)
        {
            const loweredStatement = this.lowerStatement(statement);

            loweredStatements.push(...loweredStatement);
        }

        return new LoweredNodes.Section(loweredStatements);
    }

    private lowerStatement (statement: SemanticNodes.Statement): LoweredNodes.Statement[]
    {
        switch (statement.kind)
        {
            case SemanticKind.Assignment:
                return [this.lowerAssignment(statement)];
            case SemanticKind.CallExpression:
                return [this.lowerCallExpression(statement)];
            case SemanticKind.IfStatement:
                return this.lowerIfStatement(statement);
            case SemanticKind.LocalVariableDeclaration:
                return [this.lowerLocalVariableDeclaration(statement)];
            case SemanticKind.ReturnStatement:
                return [this.lowerReturnStatement(statement)];
            case SemanticKind.Section:
                return [this.lowerSection(statement)];
            case SemanticKind.WhileStatement:
                return this.lowerWhileStatement(statement);

        }
    }

    private lowerLocalVariableDeclaration (
        variableDeclaration: SemanticNodes.LocalVariableDeclaration
    ): LoweredNodes.LocalVariableDeclaration
    {
        let loweredInitialiser: LoweredNodes.Expression|null = null;

        if (variableDeclaration.initialiser !== null)
        {
            loweredInitialiser = this.lowerExpression(variableDeclaration.initialiser);
        }

        return new LoweredNodes.LocalVariableDeclaration(variableDeclaration.symbol, loweredInitialiser);
    }

    private lowerReturnStatement (returnStatement: SemanticNodes.ReturnStatement): LoweredNodes.ReturnStatement
    {
        let loweredExpression: LoweredNodes.Expression|null = null;

        if (returnStatement.expression !== null)
        {
            loweredExpression = this.lowerExpression(returnStatement.expression);
        }

        return new LoweredNodes.ReturnStatement(loweredExpression);
    }

    private lowerIfStatement (ifStatement: SemanticNodes.IfStatement): LoweredNodes.Statement[]
    {
        const condition = this.lowerExpression(ifStatement.condition);
        const section = this.lowerSection(ifStatement.section);

        const endLabelSymbol = this.generateLabel();
        const endLabel = new LoweredNodes.Label(endLabelSymbol);

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

            const conditionalEndLabelGoto = new LoweredNodes.ConditionalGotoStatement(endLabelSymbol, condition, false);

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
            const elseLabel = new LoweredNodes.Label(elseLabelSymbol);
            const conditionalElseLabelGoto = new LoweredNodes.ConditionalGotoStatement(elseLabelSymbol, condition, false);
            const endLabelGoto = new LoweredNodes.GotoStatement(endLabelSymbol);

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

    private lowerWhileStatement (whileStatement: SemanticNodes.WhileStatement): LoweredNodes.Statement[]
    {
        /* While statement

            while <condition>
                <section>

            -->

            startLabel:
            goto <condition> endLabel false
            <section>
            goto startLabel
            endLabel:
        */

        const condition = this.lowerExpression(whileStatement.condition);
        const section = this.lowerSection(whileStatement.section);

        const startLabelSymbol = this.generateLabel();
        const startLabel = new LoweredNodes.Label(startLabelSymbol);

        const endLabelSymbol = this.generateLabel();
        const endLabel = new LoweredNodes.Label(endLabelSymbol);

        const conditionalEndLabelGoto = new LoweredNodes.ConditionalGotoStatement(endLabelSymbol, condition, false);
        const startLabelGoto = new LoweredNodes.GotoStatement(startLabelSymbol);

        return [
            startLabel,
            conditionalEndLabelGoto,
            section,
            startLabelGoto,
            endLabel,
        ];
    }

    private lowerAssignment (assignment: SemanticNodes.Assignment): LoweredNodes.Assignment
    {
        const loweredExpression = this.lowerExpression(assignment.expression);

        return new LoweredNodes.Assignment(assignment.variable, loweredExpression);
    }

    private lowerExpression (expression: SemanticNodes.Expression): LoweredNodes.Expression
    {
        switch (expression.kind)
        {
            case SemanticKind.CallExpression:
                return this.lowerCallExpression(expression);
            case SemanticKind.BinaryExpression:
                return this.lowerBinaryExpression(expression);
            case SemanticKind.InstantiationExpression:
                return this.lowerInstantiationExpression(expression);
            case SemanticKind.LiteralExpression:
                return this.lowerLiteralExpression(expression);
            case SemanticKind.UnaryExpression:
                return this.lowerUnaryExpression(expression);
            case SemanticKind.VariableExpression:
                return this.lowerVariableExpression(expression);
        }
    }

    private lowerCallExpression (callExpression: SemanticNodes.CallExpression): LoweredNodes.CallExpression
    {
        const loweredArguments: LoweredNodes.Expression[] = [];
        for (const argumentExpression of callExpression.arguments)
        {
            const loweredArgument = this.lowerExpression(argumentExpression);

            loweredArguments.push(loweredArgument);
        }

        let loweredThisReference: LoweredNodes.VariableExpression|null = null;
        if (callExpression.thisReference !== null)
        {
            loweredThisReference = this.lowerVariableExpression(callExpression.thisReference);
        }

        return new LoweredNodes.CallExpression(
            callExpression.functionSymbol,
            callExpression.ownerModule,
            loweredArguments,
            loweredThisReference
        );
    }

    private lowerUnaryExpression (unaryExpression: SemanticNodes.UnaryExpression): LoweredNodes.UnaryExpression
    {
        const loweredOperand = this.lowerExpression(unaryExpression.operand);

        return new LoweredNodes.UnaryExpression(unaryExpression.operator, loweredOperand);
    }

    private lowerBinaryExpression (binaryExpression: SemanticNodes.BinaryExpression): LoweredNodes.Expression
    {
        const loweredLeftOperand = this.lowerExpression(binaryExpression.leftOperand);
        const loweredRightOperand = this.lowerExpression(binaryExpression.rightOperand);

        if (binaryExpression.operator == BuildInOperators.binaryStringEqual)
        {
            /* Equal comparison of two strings
             * Lowers a comparison of two strings by reference to a function call that compares them by value.

                string1 = string2

                -->

                stringsAreEqual(string1, string2)
            */

            this.importBuildInModuleIfNeeded(BuildInModules.string);

            const callExpression = new LoweredNodes.CallExpression(
                BuildInFunctions.stringsAreEqual,
                BuildInModules.string,
                [
                    loweredLeftOperand,
                    loweredRightOperand,
                ],
                null
            );

            return callExpression;
        }
        else
        {
            return new LoweredNodes.BinaryExpression(binaryExpression.operator, loweredLeftOperand, loweredRightOperand);
        }
    }

    private lowerInstantiationExpression (
        instantiationExpression: SemanticNodes.InstantiationExpression
    ): LoweredNodes.CallExpression
    {
        /* Instantiation of a class
         * Lowers an instantiation of a class by reference to a function call that allocates the memory.

            string1 = string2

            -->

            stringsAreEqual(string1, string2)
        */

        this.importBuildInModuleIfNeeded(BuildInModules.memory);

        const callExpression = new LoweredNodes.CallExpression(
            BuildInFunctions.allocate,
            BuildInModules.memory,
            [
                new LoweredNodes.LiteralExpression("1", BuildInTypes.int),
                // TODO: As soon as classes can have fields, this must become a real value based on the classes size.
            ],
            null
        );

        // TODO: Call constructor.
        if (instantiationExpression.arguments.length > 0)
        {
            throw new Error(`Semantic Lowerer error: Initialisation expression with arguments is not implemented.`);
        }

        return callExpression;
    }

    private lowerLiteralExpression (literalExpression: SemanticNodes.LiteralExpression): LoweredNodes.LiteralExpression
    {
        return new LoweredNodes.LiteralExpression(literalExpression.value, literalExpression.type);
    }

    private lowerVariableExpression (variableExpression: SemanticNodes.VariableExpression): LoweredNodes.VariableExpression
    {
        return new LoweredNodes.VariableExpression(variableExpression.variable);
    }
}
