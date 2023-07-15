import * as Intermediates from './intermediates';
import * as IntermediateSymbols from './intermediateSymbols';
import * as SemanticNodes from '../connector/semanticNodes';
import * as SemanticSymbols from '../connector/semanticSymbols';
import { BuildInFunctions } from '../definitions/buildInFunctions';
import { BuildInModules } from '../definitions/buildInModules';
import { BuildInOperators } from '../definitions/buildInOperators';
import { BuildInTypes } from '../definitions/buildInTypes';
import { Intermediate } from './intermediates';
import { IntermediateKind } from './intermediateKind';
import { IntermediateSize } from './intermediateSize';
import { SemanticKind } from '../connector/semanticKind';

/* TODO: When (if?) the Bool type size is changed from Int8 to UInt8 (i.e. unsigned), the value of true must be changed from -1 to 255.
         -> Should we rather introduce a boolean type in the intermediate language? */
// TODO: Should the lowerer really directly lower to the IL? Or should it rather only "desugar" on the semantic level?

/**
 * The lowerer "lowers" semantic by breaking up abstracted structures (like an if statement) into simpler components (e.g. multiple goto
 * statements). This makes implementing a backend much easier because the resulting intermediate code is much simpler and closer to
 * real machine code.
 */
export class Lowerer
{
    private constantCounter: number;
    private labelCounter: number;
    private variableCounter: number;

    private functions: Intermediates.Function[];
    private externals: Intermediates.External[];
    private constants: Intermediates.Constant[];

    private functionSymbolMap: Map<SemanticSymbols.Function, IntermediateSymbols.Function>;
    private variableSymbolMap: Map<SemanticSymbols.Variable, IntermediateSymbols.Variable>;
    private valueToConstantMap: Map<string, IntermediateSymbols.Constant>;
    /**
     * Maps an intermediate variable to the index after its last use (where it must be dismissed). \
     * The index is only valid inside a function and applies to the intermediates of the function. \
     * TODO: It is a bit ugly to have this here (globally). Is there a better way without sacrificing convenience?
     */
    private variableDismissIndexMap: Map<IntermediateSymbols.Variable, number>;

    private variableIntroducedSet: Set<IntermediateSymbols.Variable>;
    private buildInModuleLoweredSet: Set<SemanticSymbols.Module>;

    private currentModule: SemanticSymbols.Module|null;

    constructor ()
    {
        this.constantCounter = 0;
        this.labelCounter = 0;
        this.variableCounter = 0;

        this.functions = [];
        this.externals = [];
        this.constants = [];

        this.functionSymbolMap = new Map();
        this.variableSymbolMap = new Map();
        this.valueToConstantMap = new Map();
        this.variableDismissIndexMap = new Map();

        this.variableIntroducedSet = new Set();
        this.buildInModuleLoweredSet = new Set();

        this.currentModule = null;
    }

    public run (fileSemanticNode: SemanticNodes.File): Intermediates.File
    {
        /* TODO: Because this is already initialised in the constructor, we should clear everything after the run not before.
         * This will also reduce the RAM usage because all the things are currently hold onto even if they are never used again. */

        this.constantCounter = 0;
        this.labelCounter = 0;
        this.variableCounter = 0;

        this.functions = [];
        this.externals = [];
        this.constants = [];

        this.functionSymbolMap.clear();
        this.variableSymbolMap.clear();
        this.valueToConstantMap.clear();
        this.variableDismissIndexMap.clear();

        this.variableIntroducedSet.clear();
        this.buildInModuleLoweredSet.clear();

        this.currentModule = null;

        this.lowerFile(fileSemanticNode);

        return new Intermediates.File(this.functions, this.externals, this.constants, fileSemanticNode.module.isEntryPoint);
    }

    private getOrGenerateConstant (value: string): IntermediateSymbols.Constant
    {
        const existingConstant = this.valueToConstantMap.get(value);

        if (existingConstant !== undefined)
        {
            return existingConstant;
        }

        if (this.currentModule === null)
        {
            throw new Error(`Lowerer error: Current module is null while defining a constant.`);
        }

        const qualifiedName = this.currentModule.qualifiedName + '.' + `c#${this.constantCounter}`;

        const newConstant = new IntermediateSymbols.Constant(qualifiedName, value);

        this.constantCounter += 1;

        this.valueToConstantMap.set(value, newConstant);

        const newConstantIntermediate = new Intermediates.Constant(newConstant);
        this.constants.push(newConstantIntermediate);

        return newConstant;
    }

    private generateLabel (): IntermediateSymbols.Label
    {
        const newLabel = new IntermediateSymbols.Label(`l#${this.labelCounter}`);

        this.labelCounter += 1;

        return newLabel;
    }

    private generateParameter (size: IntermediateSize, index: number): IntermediateSymbols.Parameter
    {
        const newParameter = new IntermediateSymbols.Parameter(index, size);

        return newParameter;
    }

    private generateVariable (size: IntermediateSize, symbol?: SemanticSymbols.Variable): IntermediateSymbols.Variable
    {
        const newVariable = new IntermediateSymbols.Variable(this.variableCounter, size);

        this.variableCounter += 1;

        if (symbol !== undefined)
        {
            if (this.variableSymbolMap.has(symbol))
            {
                throw new Error(`Lowerer error: Variable for symbol "${symbol.name}" already exists.`);
            }

            this.variableSymbolMap.set(symbol, newVariable);
        }

        return newVariable;
    }

    private getVariableFromSymbol (symbol: SemanticSymbols.Variable): IntermediateSymbols.Variable
    {
        const existingVariable = this.variableSymbolMap.get(symbol);

        if (existingVariable === undefined)
        {
            throw new Error(`Lowerer error: Variable for symbol "${symbol.name}" does not exist.`);
        }

        return existingVariable;
    }

    private typeToSize (type: SemanticSymbols.Type): IntermediateSize
    {
        switch (type)
        {
            case BuildInTypes.int:
                return IntermediateSize.Native;
            case BuildInTypes.bool:
                return IntermediateSize.Int8;
            case BuildInTypes.string:
                return IntermediateSize.Pointer;
            case BuildInTypes.noType:
                return IntermediateSize.Void;
        }

        if (type instanceof SemanticSymbols.VectorType)
        {
            return IntermediateSize.Pointer;
        }

        throw new Error(`Lowerer error: No known size for type "${type.name}"`);
    }

    /**
     * Generate a list of all referenced variables in an expression.
     */
    private getVariablesFromExpression (expression: SemanticNodes.Expression): IntermediateSymbols.Variable[]
    {
        const variables: IntermediateSymbols.Variable[] = [];

        switch (expression.kind)
        {
            case SemanticKind.LiteralExpression:
                // Nothing to do.
                break;
            case SemanticKind.VariableExpression:
                {
                    const variableExpression = expression as SemanticNodes.VariableExpression;
                    variables.push(this.getVariableFromSymbol(variableExpression.variable));

                    break;
                }
            case SemanticKind.CallExpression:
                {
                    const callExpression = expression as SemanticNodes.CallExpression;
                    for (const argument of callExpression.arguments)
                    {
                        variables.push(...this.getVariablesFromExpression(argument));
                    }

                    break;
                }
            case SemanticKind.UnaryExpression:
                {
                    const unaryExpression = expression as SemanticNodes.UnaryExpression;
                    variables.push(...this.getVariablesFromExpression(unaryExpression.operand));

                    break;
                }
            case SemanticKind.BinaryExpression:
                {
                    const binaryExpression = expression as SemanticNodes.BinaryExpression;
                    variables.push(...this.getVariablesFromExpression(binaryExpression.leftOperand));
                    variables.push(...this.getVariablesFromExpression(binaryExpression.rightOperand));

                    break;
                }
            default:
                throw new Error(`Lowerer error: Cannot get variables from expression of kind "${expression.kind}"`);
        }

        return variables;
    }

    private lowerFile (file: SemanticNodes.File): void
    {
        this.currentModule = file.module;

        for (const importModule of file.imports)
        {
            this.lowerImport(importModule);
        }

        for (const functionNode of file.functions)
        {
            this.lowerFunction(functionNode);
        }

        this.currentModule = null;
    }

    private lowerImport (importModule: SemanticSymbols.Module): void
    {
        for (const semanticFunctionSymbol of importModule.functionsNameToSymbol.values())
        {
            const intermediateFunctionSymbol = this.lowerFunctionSymbol(semanticFunctionSymbol, importModule);

            const externalFunction = new Intermediates.External(intermediateFunctionSymbol);
            this.externals.push(externalFunction);
        }
    }

    private lowerFunctionSymbol (
        semanticFunctionSymbol: SemanticSymbols.Function,
        module: SemanticSymbols.Module
    ): IntermediateSymbols.Function
    {
        const parameterSizes: IntermediateSize[] = [];
        for (const parameter of semanticFunctionSymbol.parameters)
        {
            const parameterSize = this.typeToSize(parameter.type);
            parameterSizes.push(parameterSize);
        }

        let qualifiedName: string;
        if (module.isEntryPoint && semanticFunctionSymbol.name == 'main') // TODO: Find a better way than a hardcoded name.
        {
            qualifiedName = semanticFunctionSymbol.name;
        }
        else
        {
            qualifiedName = module.qualifiedName + '.' + semanticFunctionSymbol.name;
        }

        const intermediateFunctionSymbol = new IntermediateSymbols.Function(
            qualifiedName,
            this.typeToSize(semanticFunctionSymbol.returnType),
            parameterSizes
        );

        this.functionSymbolMap.set(semanticFunctionSymbol, intermediateFunctionSymbol);

        return intermediateFunctionSymbol;
    }

    /**
     * Lower a build-in module if not already lowered. \
     * Note that this must only be used for build-in modules (which are all header files by definition).
     * Will not check if the module really is build-in but will throw if it is not header-only.
     */
    private lowerBuildInModuleIfNeeded (moduleSymbol: SemanticSymbols.Module): void
    {
        for (const functionSymbol of moduleSymbol.functionsNameToSymbol.values())
        {
            if (!functionSymbol.isHeader)
            {
                throw new Error(`Lowerer error: Tried to lower build-in module "${moduleSymbol.name}" which includes non-header function.`);
            }
        }

        if (!this.buildInModuleLoweredSet.has(moduleSymbol))
        {
            this.lowerImport(BuildInModules.string);

            this.buildInModuleLoweredSet.add(moduleSymbol);
        }
    }

    private lowerFunction (functionDeclaration: SemanticNodes.FunctionDeclaration): void
    {
        if (this.currentModule === null)
        {
            throw new Error(`Lowerer error: Current module is null while lowering a function.`);
        }

        const functionSymbol = this.lowerFunctionSymbol(functionDeclaration.symbol, this.currentModule);

        if (functionDeclaration.symbol.isHeader)
        {
            const externalFunction = new Intermediates.External(functionSymbol);
            this.externals.push(externalFunction);
        }
        else
        {
            if (functionDeclaration.section === null)
            {
                throw new Error(`Lowerer error: The section of a non-external function is null."`);
            }

            this.variableDismissIndexMap.clear();

            const functionBody: Intermediates.Statement[] = [];
            let parameterCounter = 0;

            // Receive all parameters for them to be available as variables:
            for (const parameter of functionDeclaration.symbol.parameters)
            {
                const parameterSymbol = this.generateParameter(this.typeToSize(parameter.type), parameterCounter);
                parameterCounter += 1;

                const parameterVariable = this.generateVariable(parameterSymbol.size, parameter);

                functionBody.push(
                    new Intermediates.Introduce(parameterVariable),
                    new Intermediates.Take(parameterVariable, parameterSymbol)
                );

                this.variableDismissIndexMap.set(parameterVariable, functionBody.length);
            }

            this.lowerSection(functionDeclaration.section, functionBody);

            // The last instruction of a function must always be a return:
            if ((functionBody.at(-1)?.kind !== IntermediateKind.Return))
            {
                functionBody.push(
                    new Intermediates.Return()
                );
            }

            // I hate this magic, but sorting shouldn't be a ten-liner either, so here an explanation:
            // We need the indices for the dismisses be sorted descending because they need to be inserted backwards into the function body,
            // otherwise all following indices would be invalidated.
            // This one-liner does that: Create a new map from the old map by sorting the entries descendingly by the value (the index).
            const sortedDismissIndexes = new Map([...this.variableDismissIndexMap.entries()].sort((a, b) => b[1] - a[1]));

            // Insert Dismiss statements for each variable's last use:
            for (const [variable, lastUse] of sortedDismissIndexes)
            {
                functionBody.splice(lastUse, 0, new Intermediates.Dismiss(variable));
            }

            const functionIntermediate = new Intermediates.Function(functionSymbol, functionBody);

            this.functions.push(functionIntermediate);
        }
    }

    private lowerSection (section: SemanticNodes.Section, intermediates: Intermediate[]): void
    {
        for (const statement of section.statements)
        {
            this.lowerStatement(statement, intermediates);
        }
    }

    private lowerStatement (statement: SemanticNodes.SemanticNode, intermediates: Intermediate[]): void
    {
        switch (statement.kind)
        {
            case SemanticKind.Section:
                this.lowerSection(statement as SemanticNodes.Section, intermediates);
                break;
            case SemanticKind.VariableDeclaration:
                this.lowerVariableDeclaration(statement as SemanticNodes.VariableDeclaration, intermediates);
                break;
            case SemanticKind.ReturnStatement:
                this.lowerReturnStatement(statement as SemanticNodes.ReturnStatement, intermediates);
                break;
            case SemanticKind.IfStatement:
                this.lowerIfStatement(statement as SemanticNodes.IfStatement, intermediates);
                break;
            case SemanticKind.WhileStatement:
                this.lowerWhileStatement(statement as SemanticNodes.WhileStatement, intermediates);
                break;
            case SemanticKind.Assignment:
                this.lowerAssignment(statement as SemanticNodes.Assignment, intermediates);
                break;
            case SemanticKind.CallExpression:
                this.lowerCallExpression(statement as SemanticNodes.CallExpression, intermediates);
                break;
            default:
                throw new Error(`Lowerer error: The expression of kind "${statement.kind}" cannot be used as a statement.`);
        }
    }

    private lowerVariableDeclaration (variableDeclaration: SemanticNodes.VariableDeclaration, intermediates: Intermediate[]): void
    {
        const variable = this.generateVariable(this.typeToSize(variableDeclaration.symbol.type), variableDeclaration.symbol);

        if (variableDeclaration.initialiser !== null)
        {
            this.lowerExpression(variableDeclaration.initialiser, intermediates, variable);
        }
    }

    private lowerReturnStatement (returnStatement: SemanticNodes.ReturnStatement, intermediates: Intermediate[]): void
    {
        if (returnStatement.expression !== null)
        {
            const returnSymbol = new IntermediateSymbols.ReturnValue(0, this.typeToSize(returnStatement.expression.type));
            const temporaryVariable = this.generateVariable(returnSymbol.size);

            this.lowerExpression(returnStatement.expression, intermediates, temporaryVariable);

            intermediates.push(
                new Intermediates.Give(returnSymbol, temporaryVariable),
            );

            this.variableDismissIndexMap.set(temporaryVariable, intermediates.length);
        }

        intermediates.push(
            new Intermediates.Return(),
        );
    }

    private lowerIfStatement (ifStatement: SemanticNodes.IfStatement, intermediates: Intermediate[]): void
    {
        const condition = this.generateVariable(this.typeToSize(ifStatement.condition.type));

        this.lowerExpression(ifStatement.condition, intermediates, condition);

        const endLabelSymbol = this.generateLabel();
        const falseLiteral = new IntermediateSymbols.Literal('0', IntermediateSize.Int8);

        // NOTE: This temporary variable will be dismissed manually after the compares instead of using variableDismissIndexMap.
        const falseLiteralVariable = this.generateVariable(falseLiteral.size);

        intermediates.push(
            new Intermediates.Introduce(falseLiteralVariable),
            new Intermediates.Move(falseLiteralVariable, falseLiteral),
        );

        if (ifStatement.elseClause === null)
        {
            intermediates.push(
                new Intermediates.Compare(condition, falseLiteralVariable),
                new Intermediates.Dismiss(falseLiteralVariable),
            );

            this.variableDismissIndexMap.set(condition, intermediates.length);

            intermediates.push(
                new Intermediates.JumpIfEqual(endLabelSymbol),
            );

            this.lowerSection(ifStatement.section, intermediates);

            intermediates.push(
                new Intermediates.Label(endLabelSymbol),
            );
        }
        else
        {
            const elseLabelSymbol = this.generateLabel();

            intermediates.push(
                new Intermediates.Compare(condition, falseLiteralVariable),
                new Intermediates.Dismiss(falseLiteralVariable),
            );

            this.variableDismissIndexMap.set(condition, intermediates.length);

            intermediates.push(
                new Intermediates.JumpIfEqual(elseLabelSymbol),
            );

            this.lowerSection(ifStatement.section, intermediates);

            intermediates.push(
                new Intermediates.Goto(endLabelSymbol),
                new Intermediates.Label(elseLabelSymbol),
            );

            this.lowerStatement(ifStatement.elseClause.followUp, intermediates);

            intermediates.push(
                new Intermediates.Label(endLabelSymbol),
            );
        }
    }

    private lowerWhileStatement (whileStatement: SemanticNodes.WhileStatement, intermediates: Intermediate[]): void
    {
        const startLabelSymbol = this.generateLabel();
        const endLabelSymbol = this.generateLabel();

        intermediates.push(
            new Intermediates.Label(startLabelSymbol),
        );

        const condition = this.generateVariable(this.typeToSize(whileStatement.condition.type));

        this.lowerExpression(whileStatement.condition, intermediates, condition);

        const falseLiteral = new IntermediateSymbols.Literal('0', IntermediateSize.Int8);
        const falseLiteralVariable = this.generateVariable(falseLiteral.size);

        intermediates.push(
            new Intermediates.Introduce(falseLiteralVariable),
            new Intermediates.Move(falseLiteralVariable, falseLiteral),
            new Intermediates.Compare(condition, falseLiteralVariable),
            new Intermediates.Dismiss(falseLiteralVariable),
        );

        this.variableDismissIndexMap.set(condition, intermediates.length);

        intermediates.push(
            new Intermediates.JumpIfEqual(endLabelSymbol),
        );

        this.lowerSection(whileStatement.section, intermediates);

        intermediates.push(
            new Intermediates.Goto(startLabelSymbol),
            new Intermediates.Label(endLabelSymbol),
        );

        // All variables used in the while statement's condition must only be freed after the while loop has finished:
        const variablesInContidion = this.getVariablesFromExpression(whileStatement.condition);
        for (const variable of variablesInContidion)
        {
            this.variableDismissIndexMap.set(variable, intermediates.length);
        }
    }

    private lowerAssignment (assignment: SemanticNodes.Assignment, intermediates: Intermediate[]): void
    {
        const variable = this.getVariableFromSymbol(assignment.variable);

        if (assignment.expression !== null)
        {
            this.lowerExpression(assignment.expression, intermediates, variable);
        }
    }

    private lowerExpression (
        expression: SemanticNodes.Expression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.Variable
    ): void
    {
        switch (expression.kind)
        {
            case SemanticKind.LiteralExpression:
                this.lowerLiteralExpression(expression as SemanticNodes.LiteralExpression, intermediates, targetLocation);
                break;
            case SemanticKind.VariableExpression:
                this.lowerVariableExpression(expression as SemanticNodes.VariableExpression, intermediates, targetLocation);
                break;
            case SemanticKind.CallExpression:
                this.lowerCallExpression(expression as SemanticNodes.CallExpression, intermediates, targetLocation);
                break;
            case SemanticKind.UnaryExpression:
                this.lowerUnaryExpression(expression as SemanticNodes.UnaryExpression, intermediates, targetLocation);
                break;
            case SemanticKind.BinaryExpression:
                this.lowerBinaryExpression(expression as SemanticNodes.BinaryExpression, intermediates, targetLocation);
                break;
            default:
                throw new Error(`Lowerer error: No implementation for expression of kind "${expression.kind}"`);
        }
    }

    private lowerLiteralExpression (
        literalExpression: SemanticNodes.LiteralExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.Variable
    ): void
    {
        let literalOrConstant: IntermediateSymbols.Literal | IntermediateSymbols.Constant;

        switch (literalExpression.type)
        {
            case BuildInTypes.int:
                {
                    literalOrConstant = new IntermediateSymbols.Literal(literalExpression.value, this.typeToSize(literalExpression.type));

                    break;
                }
            case BuildInTypes.bool:
                {
                    let value: string;

                     // TODO: Remove the magic strings "true" and "false". Should they be handled in the connector?
                    if (literalExpression.value === 'true')
                    {
                        value = '-1';
                    }
                    else if (literalExpression.value === 'false')
                    {
                        value = '0';
                    }
                    else
                    {
                        throw new Error(`Lowerer error: Unknown Bool value of "${literalExpression.value}"`);
                    }

                    literalOrConstant = new IntermediateSymbols.Literal(value, this.typeToSize(literalExpression.type));

                    break;
                }
            case BuildInTypes.string:
                {
                    literalOrConstant = this.getOrGenerateConstant(literalExpression.value);

                    break;
                }
            default:
                throw new Error(`Lowerer error: Unknown literal of type "${literalExpression.type.name}"`);
        }

        if (!this.variableIntroducedSet.has(targetLocation))
        {
            intermediates.push(
                new Intermediates.Introduce(targetLocation),
            );

            this.variableIntroducedSet.add(targetLocation);
        }

        intermediates.push(
            new Intermediates.Move(targetLocation, literalOrConstant),
        );

        this.variableDismissIndexMap.set(targetLocation, intermediates.length);
    }

    private lowerVariableExpression (
        variableExpression: SemanticNodes.VariableExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.Variable
    ): void
    {
        const variable = this.variableSymbolMap.get(variableExpression.variable);

        if (variable === undefined)
        {
            throw new Error(`Lowerer error: Variable "${variableExpression.variable.name}" used before declaration.`);
        }

        if (variable !== targetLocation)
        {
            if (!this.variableIntroducedSet.has(targetLocation))
            {
                intermediates.push(
                    new Intermediates.Introduce(targetLocation),
                );

                this.variableIntroducedSet.add(targetLocation);
            }

            intermediates.push(
                new Intermediates.Move(targetLocation, variable),
            );

            this.variableDismissIndexMap.set(targetLocation, intermediates.length);
            this.variableDismissIndexMap.set(variable, intermediates.length);
        }
    }

    private lowerCallExpression (
        callExpression: SemanticNodes.CallExpression,
        intermediates: Intermediate[],
        targetLocation?: IntermediateSymbols.Variable
    ): void
    {
        let parameterCounter = 0;

        for (const argumentExpression of callExpression.arguments)
        {
            const temporaryVariable = this.generateVariable(this.typeToSize(argumentExpression.type));

            this.lowerExpression(argumentExpression, intermediates, temporaryVariable);

            const parameter = this.generateParameter(temporaryVariable.size, parameterCounter);
            parameterCounter += 1;

            intermediates.push(
                new Intermediates.Give(parameter, temporaryVariable),
            );

            this.variableDismissIndexMap.set(temporaryVariable, intermediates.length);
        }

        const functionSymbol = this.functionSymbolMap.get(callExpression.functionSymbol);

        if (functionSymbol === undefined)
        {
            throw new Error(`Lowerer error: Function "${callExpression.functionSymbol.name}" used before declaration.`);
        }

        intermediates.push(
            new Intermediates.Call(functionSymbol),
        );

        if (targetLocation !== undefined)
        {
            if (functionSymbol.returnSize == IntermediateSize.Void)
            {
                throw new Error(
                    `Lowerer error: Function "${callExpression.functionSymbol.name}" has no return value but is used as an expression.`
                );
            }

            if (!this.variableIntroducedSet.has(targetLocation))
            {
                intermediates.push(
                    new Intermediates.Introduce(targetLocation),
                );

                this.variableIntroducedSet.add(targetLocation);
            }

            const returnValue = new IntermediateSymbols.ReturnValue(0, functionSymbol.returnSize);

            intermediates.push(
                new Intermediates.Take(targetLocation, returnValue),
            );

            this.variableDismissIndexMap.set(targetLocation, intermediates.length);
        }
    }

    private lowerUnaryExpression (
        unaryExpression: SemanticNodes.UnaryExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.Variable
    ): void
    {
        this.lowerExpression(unaryExpression.operand, intermediates, targetLocation);

        const operator = unaryExpression.operator;

        switch (operator)
        {
            case BuildInOperators.unaryIntAddition:
                // An unary addition has no effect.
                break;
            case BuildInOperators.unaryIntSubtraction:
            case BuildInOperators.unaryIntNot:
            case BuildInOperators.unaryBoolNot:
                {
                    if (!this.variableIntroducedSet.has(targetLocation))
                    {
                        intermediates.push(
                            new Intermediates.Introduce(targetLocation),
                        );

                        this.variableIntroducedSet.add(targetLocation);
                    }

                    let intermediate: Intermediate;
                    switch (operator)
                    {
                        case BuildInOperators.unaryIntSubtraction:
                            intermediate = new Intermediates.Negate(targetLocation);
                            break;
                        case BuildInOperators.unaryIntNot:
                        case BuildInOperators.unaryBoolNot:
                            intermediate = new Intermediates.Not(targetLocation);
                            break;
                        default:
                            throw new Error(`Lowerer error: Inconsistent handling for operator "${operator.kind}"`);
                    }

                    intermediates.push(intermediate);

                    this.variableDismissIndexMap.set(targetLocation, intermediates.length);

                    break;
                }
            default:
                throw new Error(
                    `Lowerer error: The operator "${operator.kind}" for operand of "${operator.operandType.name}" and ` +
                    `result of "${operator.resultType.name}" is not implemented.`
                );
        }
    }

    private lowerBinaryExpression (
        binaryExpression: SemanticNodes.BinaryExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.Variable
    ): void
    {
        // We differentiate between size-retaining operations, where the result has the same size as the left operand, and size-changing
        // operations, where the result has a different size than the left operand.
        // This is done because when the size change, we need one temporary variable for each operand and write the result to the target
        // variable. This is typical for operations where the result needs to be written to a different location anyway.
        // When the size is retained, we can use the target location as the temporary variable for the left operand. This is handy because
        // it is typically the case for operations that return the result in the same location as the left operand, thus we save an extra
        // move instruction.
        // One could argue that this is optimisation, but as it makes the code easier to follow, it makes sense to do that here.

        if (this.typeToSize(binaryExpression.operator.leftType) == this.typeToSize(binaryExpression.operator.resultType))
        {
            this.lowerSizeRetainingBinaryExpression(binaryExpression, intermediates, targetLocation);
        }
        else
        {
            this.lowerSizeChangingBinaryExpression(binaryExpression, intermediates, targetLocation);
        }
    }

    /**
     * Lower a binary expression where the result type has the same size as the left type.
     */
    private lowerSizeRetainingBinaryExpression (
        binaryExpression: SemanticNodes.BinaryExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.Variable
    ): void
    {
        this.lowerExpression(binaryExpression.leftOperand, intermediates, targetLocation);

        const temporaryVariable = this.generateVariable(this.typeToSize(binaryExpression.rightOperand.type));

        this.lowerExpression(binaryExpression.rightOperand, intermediates, temporaryVariable);

        if (!this.variableIntroducedSet.has(targetLocation))
        {
            intermediates.push(
                new Intermediates.Introduce(targetLocation),
            );

            this.variableIntroducedSet.add(targetLocation);
        }

        const operator = binaryExpression.operator;

        switch (operator)
        {
            case BuildInOperators.binaryIntAddition:
                intermediates.push(
                    new Intermediates.Add(targetLocation, temporaryVariable),
                );
                break;
            case BuildInOperators.binaryIntSubtraction:
                intermediates.push(
                    new Intermediates.Subtract(targetLocation, temporaryVariable),
                );
                break;
            case BuildInOperators.binaryIntMultiplication:
                intermediates.push(
                    new Intermediates.Multiply(targetLocation, temporaryVariable),
                );
                break;
            case BuildInOperators.binaryIntDivision:
                intermediates.push(
                    new Intermediates.Divide(targetLocation, temporaryVariable),
                );
                break;
            case BuildInOperators.binaryIntModulo:
                intermediates.push(
                    new Intermediates.Modulo(targetLocation, temporaryVariable),
                );
                break;
            case BuildInOperators.binaryIntAnd:
            case BuildInOperators.binaryBoolAnd:
                intermediates.push(
                    new Intermediates.And(targetLocation, temporaryVariable),
                );
                break;
            case BuildInOperators.binaryIntOr:
            case BuildInOperators.binaryBoolOr:
                intermediates.push(
                    new Intermediates.Or(targetLocation, temporaryVariable),
                );
                break;
            default:
                throw new Error(
                    `Lowerer error: The size-retaining operator "${operator.kind}" for the operands of "${operator.leftType.name}" and ` +
                    `"${operator.rightType.name}" with the result type of "${operator.resultType.name}" is not implemented.`
                );
        }

        // NOTE: This relies on the fact that, currently, the default branch of the switch statement aboth throws an error.
        this.variableDismissIndexMap.set(targetLocation, intermediates.length);
        this.variableDismissIndexMap.set(temporaryVariable, intermediates.length);
    }

    /**
     * Lower a binary expression where the result type has the same as the left type.
     */
    private lowerSizeChangingBinaryExpression (
        binaryExpression: SemanticNodes.BinaryExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.Variable
    ): void
    {
        if (binaryExpression.operator == BuildInOperators.binaryStringEqual)
        {
            // NOTE: Compiler magic: The comparison of a string is call to the build in function "stringsAreEqual".

            this.lowerBuildInModuleIfNeeded(BuildInModules.string);

            const callExpression = new SemanticNodes.CallExpression(
                BuildInFunctions.stringsAreEqual,
                BuildInModules.string,
                [
                    binaryExpression.leftOperand,
                    binaryExpression.rightOperand,
                ]
            );

            this.lowerCallExpression(callExpression, intermediates, targetLocation);
        }
        else
        {
            const leftTemporaryVariable = this.generateVariable(this.typeToSize(binaryExpression.leftOperand.type));

            this.lowerExpression(binaryExpression.leftOperand, intermediates, leftTemporaryVariable);

            const rightTemporaryVariable = this.generateVariable(this.typeToSize(binaryExpression.rightOperand.type));

            this.lowerExpression(binaryExpression.rightOperand, intermediates, rightTemporaryVariable);

            const operator = binaryExpression.operator;

            switch (operator)
            {
                case BuildInOperators.binaryIntEqual:
                case BuildInOperators.binaryIntNotEqual:
                case BuildInOperators.binaryIntLess:
                case BuildInOperators.binaryIntGreater:
                case BuildInOperators.binaryBoolEqual:
                case BuildInOperators.binaryBoolNotEqual:
                {
                    intermediates.push(
                        new Intermediates.Compare(leftTemporaryVariable, rightTemporaryVariable),
                    );

                    this.variableDismissIndexMap.set(leftTemporaryVariable, intermediates.length);
                    this.variableDismissIndexMap.set(rightTemporaryVariable, intermediates.length);

                    const trueLabel = this.generateLabel();
                    const endLabel = this.generateLabel();

                    switch (operator)
                    {
                        case BuildInOperators.binaryIntEqual:
                        case BuildInOperators.binaryBoolEqual:
                            intermediates.push(
                                new Intermediates.JumpIfEqual(trueLabel)
                            );
                            break;
                        case BuildInOperators.binaryIntNotEqual:
                        case BuildInOperators.binaryBoolNotEqual:
                            intermediates.push(
                                new Intermediates.JumpIfNotEqual(trueLabel)
                            );
                            break;
                        case BuildInOperators.binaryIntLess:
                            intermediates.push(
                                new Intermediates.JumpIfLess(trueLabel)
                            );
                            break;
                        case BuildInOperators.binaryIntGreater:
                            intermediates.push(
                                new Intermediates.JumpIfGreater(trueLabel)
                            );
                            break;
                    }

                    const trueLiteral = new IntermediateSymbols.Literal('-1', IntermediateSize.Int8);
                    const falseLiteral = new IntermediateSymbols.Literal('0', IntermediateSize.Int8);

                    if (!this.variableIntroducedSet.has(targetLocation))
                    {
                        intermediates.push(
                            new Intermediates.Introduce(targetLocation),
                        );

                        this.variableIntroducedSet.add(targetLocation);
                    }

                    intermediates.push(
                        new Intermediates.Move(targetLocation, falseLiteral),
                        new Intermediates.Goto(endLabel),
                        new Intermediates.Label(trueLabel),
                        new Intermediates.Move(targetLocation, trueLiteral),
                        new Intermediates.Label(endLabel),
                    );

                    this.variableDismissIndexMap.set(targetLocation, intermediates.length);

                    break;
                }
                default:
                    throw new Error(
                        `Lowerer error: The size-changing operator "${operator.kind}" for the operands of "${operator.leftType.name}" ` +
                        `and "${operator.rightType.name}" with the result type of "${operator.resultType.name}" is not implemented.`
                    );
            }
        }
    }
}
