import * as LoweredNodes from './loweredNodes';
import * as SemanticNodes from '../connector/semanticNodes';
import * as SemanticSymbols from '../connector/semanticSymbols';
import { BuildInFunctions } from '../definitions/buildInFunctions';
import { BuildInModules } from '../definitions/buildInModules';
import { BuildInOperators } from '../definitions/buildInOperators';
import { BuildInTypes } from '../definitions/buildInTypes';
import { Namespace } from '../parser/namespace';
import { SemanticKind } from '../connector/semanticKind';

/**
 * The semantic lowerer "lowers" semantic by breaking up abstracted structures (like an if statement) into simpler components
 * (e.g. multiple goto statements). This process is also known as "desugaring".
 */
export default class SemanticLowerer
{
    private labelCounter: number;

    private buildInImports: Set<SemanticSymbols.Module>;
    private additionalFunctions: LoweredNodes.FunctionDeclaration[];

    private currentModule: SemanticSymbols.Module|null;

    constructor ()
    {
        this.labelCounter = 0;
        this.buildInImports = new Set();
        this.additionalFunctions = [];
        this.currentModule = null;
    }

    /**
     * @param fileSemanticNode
     * @param modulesToBeInitialised
     *  A set of semantic modules which have initialisers that must be called. Must not contain the entry point module.
     * @returns
     */
    public run (fileSemanticNode: SemanticNodes.File, modulesToBeInitialised: Set<SemanticSymbols.Module>): LoweredNodes.File
    {
        this.labelCounter = 0;
        this.buildInImports = new Set();
        this.additionalFunctions = [];
        this.currentModule = null;

        const loweredFile = this.lowerFile(fileSemanticNode, modulesToBeInitialised);

        return loweredFile;
    }

    private generateLabel (): SemanticSymbols.Label
    {
        if (this.currentModule === null)
        {
            throw new Error(`Semantic Lowerer error: Tried to generate label outside of a module.`);
        }

        const namespace = Namespace.constructFromNamespace(this.currentModule.namespace, `l#${this.labelCounter}`);

        const newLabel = new SemanticSymbols.Label(namespace);

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
                    `Semantic Lowerer error: Tried to lower build-in module "${moduleSymbol.namespace.qualifiedName}"`
                    + ` which includes non-header function.`
                );
            }
        }

        if (!this.buildInImports.has(moduleSymbol))
        {
            this.buildInImports.add(moduleSymbol);
        }
    }

    private lowerFile (file: SemanticNodes.File, modulesToBeInitialised: Set<SemanticSymbols.Module>): LoweredNodes.File
    {
        this.currentModule = file.module;

        const loweredGlobalVariables = this.lowerGlobalVariables(file.variables, modulesToBeInitialised);

        let loweredFields: SemanticSymbols.Field[] = [];
        if (file.module.classType !== null)
        {
            loweredFields = this.lowerFields(file.fields);
        }

        const loweredFunctions: LoweredNodes.FunctionDeclaration[] = [];

        for (const additionalFunction of this.additionalFunctions)
        {
            loweredFunctions.push(additionalFunction);
            this.currentModule.functionNameToSymbol.set(additionalFunction.symbol.namespace.qualifiedName, additionalFunction.symbol);
        }

        for (const functionNode of file.functions)
        {
            const loweredFunction = this.lowerFunctionDeclaration(functionNode);

            loweredFunctions.push(loweredFunction);
        }

        // TODO: This set back and forth is a bit ugly:
        const loweredImportsSet = new Set<SemanticSymbols.Module>(file.imports);
        for (const buildInImport of this.buildInImports)
        {
            loweredImportsSet.add(buildInImport);
        }
        const loweredImports = Array.from(loweredImportsSet);

        this.currentModule = null;

        return new LoweredNodes.File(file.name, file.module, loweredImports, loweredGlobalVariables, loweredFields, loweredFunctions);
    }

    private lowerGlobalVariables (
        globalVariableDeclarations: SemanticNodes.GlobalVariableDeclaration[],
        modulesToBeInitialised: Set<SemanticSymbols.Module>
    ): SemanticSymbols.Variable[]
    {
        const loweredGlobalVariables: SemanticSymbols.Variable[] = [];
        const loweredInitialisers = new Map<SemanticSymbols.Variable, LoweredNodes.Expression>();

        for (const globalVariableDeclaration of globalVariableDeclarations)
        {
            if (globalVariableDeclaration.initialiser !== null)
            {
                const loweredInitialiser = this.lowerExpression(globalVariableDeclaration.initialiser);
                loweredInitialisers.set(globalVariableDeclaration.symbol, loweredInitialiser);
            }

            loweredGlobalVariables.push(globalVariableDeclaration.symbol);
        }

        this.createModuleInitialiserFunction(loweredInitialisers, modulesToBeInitialised);

        return loweredGlobalVariables;
    }

    private createModuleInitialiserFunction (
        initialisersMap: Map<SemanticSymbols.Variable, LoweredNodes.Expression>,
        modulesToBeInitialised: Set<SemanticSymbols.Module>
    ): void
    {
        const module = this.currentModule;
        if (module === null)
        {
            throw new Error(`Semantic Lowerer error: Current module is null while creating the module initialiser function.`);
        }

        if (module.isEntryPoint)
        {
            if ((initialisersMap.size == 0) && (modulesToBeInitialised.size == 0))
            {
                return;
            }
        }
        else
        {
            if (initialisersMap.size == 0)
            {
                return;
            }
        }

        const initialisationBody: LoweredNodes.Statement[] = [];

        if (module.isEntryPoint)
        {
            for (const moduleWithInitiliser of modulesToBeInitialised)
            {
                // TODO: Find a better way than a hardcoded name:
                const namespace = Namespace.constructFromNamespace(moduleWithInitiliser.namespace, ':moduleInitialiser');
                const functionSymbol = new SemanticSymbols.Function(namespace, BuildInTypes.noType, [], null, false);

                const callStatement = new LoweredNodes.CallExpression(functionSymbol, [], null);
                initialisationBody.push(callStatement);
            }
        }

        for (const [variableSymbol, initialiser] of initialisersMap)
        {
            const assignment = new LoweredNodes.Assignment(
                new LoweredNodes.VariableExpression(variableSymbol),
                initialiser
            );

            initialisationBody.push(assignment);
        }

        initialisationBody.push(
            new LoweredNodes.ReturnStatement(null)
        );

        // TODO: Find a better way than a hardcoded name:
        const namespace = Namespace.constructFromNamespace(module.namespace, ':moduleInitialiser');
        const moduleInitialiserFunctionSymbol = new SemanticSymbols.Function(namespace, BuildInTypes.noType, [], null, false);

        const section = new LoweredNodes.Section(initialisationBody);
        const functionDeclaration = new LoweredNodes.FunctionDeclaration(moduleInitialiserFunctionSymbol, section);

        // TODO: The "additionalFunctions" field could be replaced by returning the function declaration here.
        this.additionalFunctions.push(functionDeclaration);
    }

    private lowerFields (fieldDeclarations: SemanticNodes.FieldDeclaration[]): SemanticSymbols.Field[]
    {
        const loweredFields: SemanticSymbols.Field[] = [];
        const loweredInitialisers = new Map<SemanticSymbols.Field, LoweredNodes.Expression>();

        for (const fieldDeclaration of fieldDeclarations)
        {
            if (fieldDeclaration.initialiser !== null)
            {
                const loweredInitialiser = this.lowerExpression(fieldDeclaration.initialiser);
                loweredInitialisers.set(fieldDeclaration.symbol, loweredInitialiser);
            }

            loweredFields.push(fieldDeclaration.symbol);
        }

        this.createClassInitialiserFunction(loweredInitialisers);

        return loweredFields;
    }

    private createClassInitialiserFunction (initialisersMap: Map<SemanticSymbols.Field, LoweredNodes.Expression>): void
    {
        if (this.currentModule === null)
        {
            throw new Error(`Semantic Lowerer error: Current module is null while creating the class initialiser function.`);
        }

        if (this.currentModule.classType === null)
        {
            throw new Error(`Semantic Lowerer error: Current module is not a class while creating the class initialiser function.`);
        }

        const initialisationBody: LoweredNodes.Statement[] = [];

        this.importBuildInModuleIfNeeded(BuildInModules.memory);

        let concreteClassType: SemanticSymbols.ConcreteType;
        if (this.currentModule.classType.parameters.length > 0)
        {
            throw new Error(`Semantic Lowerer error: Class initialisation with generic parameters is not implemented.`);
        }
        else
        {
            // TODO: Must be adjusted as soon as there are generics.
            concreteClassType = new SemanticSymbols.ConcreteType(this.currentModule.classType.namespace, []);
        }

        const allocatedInstanceVariableSymbol = new SemanticSymbols.Variable(
            // TODO: Find a better way than a hardcoded name:
            Namespace.constructFromNamespace(this.currentModule.namespace, ':classInitialiser', 'allocatedInstance'),
            concreteClassType,
            false
        );

        const allocatedInstanceVariableExpression = new LoweredNodes.VariableExpression(allocatedInstanceVariableSymbol);

        const allocatorCallExpression = new LoweredNodes.CallExpression(
            BuildInFunctions.allocate,
            [
                new LoweredNodes.SizeOfExpression(concreteClassType), // TODO: Should we make sure this is never zero?
            ],
            null
        );

        initialisationBody.push(
            new LoweredNodes.LocalVariableDeclaration(allocatedInstanceVariableSymbol, allocatorCallExpression)
        );

        for (const [fieldSymbol, initialiser] of initialisersMap)
        {
            const assignment = new LoweredNodes.Assignment(
                new LoweredNodes.FieldExpression(fieldSymbol, allocatedInstanceVariableExpression),
                initialiser
            );

            initialisationBody.push(assignment);
        }

        // TODO: As soon as we have a constructor, it must be called here with allocatedInstanceVariableExpression as "this".

        initialisationBody.push(
            new LoweredNodes.ReturnStatement(allocatedInstanceVariableExpression)
        );

        // TODO: Find a better way than a hardcoded name:
        const namespace = Namespace.constructFromNamespace(this.currentModule.namespace, ':classInitialiser');
        const functionSymbol = new SemanticSymbols.Function(namespace, BuildInTypes.pointer, [], null, false);

        const section = new LoweredNodes.Section(initialisationBody);
        const functionDeclaration = new LoweredNodes.FunctionDeclaration(functionSymbol, section);

        // TODO: The "additionalFunctions" field could be replaced by returning the function declaration here.
        this.additionalFunctions.push(functionDeclaration);
    }

    private lowerFunctionDeclaration (functionDeclaration: SemanticNodes.FunctionDeclaration): LoweredNodes.FunctionDeclaration
    {
        let loweredSection = null;

        if (!functionDeclaration.symbol.isHeader)
        {
            if (functionDeclaration.section === null)
            {
                throw new Error(`Semantic Lowerer error: The section of a non-external function is null."`);
            }

            loweredSection = this.lowerSection(functionDeclaration.section);

            if (this.currentModule === null)
            {
                throw new Error('Semantic Lowerer error: Current module is null while lowering a function declaration.');
            }

            // TODO: Find a better way than a hardcoded name:
            if (this.currentModule.isEntryPoint && (functionDeclaration.symbol.namespace.memberName === 'main'))
            {
                let moduleInitialiserFunctionSymbol: SemanticSymbols.Function|null = null;
                // TODO: It is bad that we have to search for the module initialiser function here:
                for (const functionDeclaration of this.additionalFunctions)
                {
                    // TODO: Find a better way than a hardcoded name:
                    if (functionDeclaration.symbol.namespace.memberName === ':moduleInitialiser')
                    {
                        moduleInitialiserFunctionSymbol = functionDeclaration.symbol;
                    }
                }

                if (moduleInitialiserFunctionSymbol !== null)
                {
                    const callModuleInitialiserStatement = new LoweredNodes.CallExpression(moduleInitialiserFunctionSymbol, [], null);
                    loweredSection.statements.unshift(callModuleInitialiserStatement);
                }
            }
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
        const loweredFromExpression = this.lowerExpression(assignment.from);

        let loweredToExpression: LoweredNodes.FieldExpression|LoweredNodes.VariableExpression;
        switch (assignment.to.kind)
        {
            case SemanticKind.FieldExpression:
                loweredToExpression = this.lowerFieldExpression(assignment.to);
                break;
            case SemanticKind.VariableExpression:
                loweredToExpression = this.lowerVariableExpression(assignment.to);
                break;
        }

        return new LoweredNodes.Assignment(loweredToExpression, loweredFromExpression);
    }

    private lowerExpression (expression: SemanticNodes.Expression): LoweredNodes.Expression
    {
        switch (expression.kind)
        {
            case SemanticKind.CallExpression:
                return this.lowerCallExpression(expression);
            case SemanticKind.BinaryExpression:
                return this.lowerBinaryExpression(expression);
            case SemanticKind.FieldExpression:
                return this.lowerFieldExpression(expression);
            case SemanticKind.InstantiationExpression:
                return this.lowerInstantiationExpression(expression);
            case SemanticKind.LiteralExpression:
                return this.lowerLiteralExpression(expression);
            case SemanticKind.ModuleExpression:
                throw new Error(`Semantic Lowerer error: Unexpected module expression.`);
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

        let loweredThisReference: LoweredNodes.Expression|null = null;
        if (callExpression.thisReference !== null)
        {
            loweredThisReference = this.lowerExpression(callExpression.thisReference);
        }

        return new LoweredNodes.CallExpression(
            callExpression.functionSymbol,
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
         * Lowers an instantiation of a class by reference to a function call that instantiates the class.

            new Class()

            -->

            Class.:classInitialiser()
        */

        // TODO: Find a better way than a hardcoded name:
        const namespace = Namespace.constructFromNamespace(instantiationExpression.type.namespace, ':classInitialiser');
        // TODO: Could we get this symbol from the type?
        const classInitialiserSymbol = new SemanticSymbols.Function(namespace, BuildInTypes.pointer, [], null, false);

        const callExpression = new LoweredNodes.CallExpression(classInitialiserSymbol, [], null);

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

    private lowerFieldExpression (fieldExpression: SemanticNodes.FieldExpression): LoweredNodes.FieldExpression
    {
        const loweredThisReference = this.lowerExpression(fieldExpression.thisReference);

        return new LoweredNodes.FieldExpression(fieldExpression.field, loweredThisReference);
    }
}
