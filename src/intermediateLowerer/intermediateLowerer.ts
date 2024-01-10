import * as Intermediates from './intermediates';
import * as IntermediateSymbols from './intermediateSymbols';
import * as LoweredNodes from '../semanticLowerer/loweredNodes';
import * as SemanticSymbols from '../connector/semanticSymbols';
import { BuildInOperators } from '../definitions/buildInOperators';
import { BuildInTypes } from '../definitions/buildInTypes';
import { Intermediate } from './intermediates';
import { IntermediateKind } from './intermediateKind';
import { IntermediateSize } from './intermediateSize';
import { IntermediateSymbolKind } from './intermediateSymbolKind';
import { SemanticKind } from '../connector/semanticKind';

/* TODO: When (if?) the Bool type size is changed from Int8 to UInt8 (i.e. unsigned), the value of true must be changed from -1 to 255.
         -> Should we rather introduce a boolean type in the intermediate language? */
// TODO: Could there be a better name than "lowerer" for the transformation into intermediate code?

/**
 * The intermediate lowerer "lowers" the semantic tree into intermediate code, which is simpler and closer to real machine code.
 */
export class IntermediateLowerer
{
    private constantCounter: number;
    private labelCounter: number;
    private localVariableCounter: number;

    private constants: Intermediates.Constant[];
    private externals: Intermediates.External[];
    private globals: Intermediates.Global[];
    private functions: Intermediates.Function[];

    private functionSymbolMap: Map<SemanticSymbols.Function, IntermediateSymbols.Function>;
    private variableSymbolMap: Map<SemanticSymbols.Variable, IntermediateSymbols.Variable>;
    private valueToConstantMap: Map<string, IntermediateSymbols.Constant>;
    private semanticLabelNameToIntermediateLabelMap: Map<string, IntermediateSymbols.Label>;
    private variableIntroducedSet: Set<IntermediateSymbols.Variable>;

    private currentModule: SemanticSymbols.Module|null;

    constructor ()
    {
        this.constantCounter = 0;
        this.labelCounter = 0;
        this.localVariableCounter = 0;

        this.constants = [];
        this.externals = [];
        this.globals = [];
        this.functions = [];

        this.functionSymbolMap = new Map();
        this.variableSymbolMap = new Map();
        this.valueToConstantMap = new Map();
        this.semanticLabelNameToIntermediateLabelMap = new Map();
        this.variableIntroducedSet = new Set();

        this.currentModule = null;
    }

    /**
     * @param fileNode
     * @param modulesToBeInitialised
     *  A set of semantic modules which have initialisers that must be called. Must not contain the entry
     *  point module.
     * @returns
     */
    public run (fileNode: LoweredNodes.File, modulesToBeInitialised: Set<SemanticSymbols.Module>): Intermediates.File
    {
        /* TODO: Because this is already initialised in the constructor, we should clear everything after the run not before.
         * This will also reduce the RAM usage because all the things are currently hold onto even if they are never used again. */

        this.constantCounter = 0;
        this.labelCounter = 0;
        this.localVariableCounter = 0;

        this.constants = [];
        this.externals = [];
        this.globals = [];
        this.functions = [];

        this.functionSymbolMap.clear();
        this.variableSymbolMap.clear();
        this.valueToConstantMap.clear();
        this.semanticLabelNameToIntermediateLabelMap.clear();
        this.variableIntroducedSet.clear();

        this.currentModule = null;

        this.lowerFile(fileNode, modulesToBeInitialised);

        return new Intermediates.File(this.constants, this.externals, this.globals, this.functions, fileNode.module.isEntryPoint);
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
            throw new Error(`Intermediate Lowerer error: Current module is null while defining a constant.`);
        }

        const qualifiedName = this.currentModule.qualifiedName + '.' + `c#${this.constantCounter}`;

        const newConstant = new IntermediateSymbols.Constant(qualifiedName, value);

        this.constantCounter += 1;

        this.valueToConstantMap.set(value, newConstant);

        const newConstantIntermediate = new Intermediates.Constant(newConstant);
        this.constants.push(newConstantIntermediate);

        return newConstant;
    }

    private getOrGenerateIntermediateLabelForSemanticLabel (semanticLabelSymbol: SemanticSymbols.Label): IntermediateSymbols.Label
    {
        let intermediateLabelSymbol: IntermediateSymbols.Label;

        if (this.semanticLabelNameToIntermediateLabelMap.has(semanticLabelSymbol.name))
        {
            intermediateLabelSymbol = this.semanticLabelNameToIntermediateLabelMap.get(semanticLabelSymbol.name)!;
        }
        else
        {
            intermediateLabelSymbol = this.generateLabel();

            this.semanticLabelNameToIntermediateLabelMap.set(semanticLabelSymbol.name, intermediateLabelSymbol);
        }

        return intermediateLabelSymbol;
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

    private generateLocalVariable (size: IntermediateSize, symbol?: SemanticSymbols.Variable): IntermediateSymbols.LocalVariable
    {
        const newVariable = new IntermediateSymbols.LocalVariable(this.localVariableCounter, size);

        this.localVariableCounter += 1;

        if (symbol !== undefined)
        {
            if (this.variableSymbolMap.has(symbol))
            {
                throw new Error(`Intermediate Lowerer error: Variable for symbol "${symbol.name}" already exists.`);
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
            throw new Error(`Intermediate Lowerer error: Variable for symbol "${symbol.name}" does not exist.`);
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
            case BuildInTypes.noType:
                return IntermediateSize.Void;
            case BuildInTypes.pointer:
            case BuildInTypes.string:
            default:
                // TODO: How to prevent other value types (primitives) will be silently marked as pointers here in the future?
                return IntermediateSize.Pointer;
        }
    }

    private introduceIfNecessary (variable: IntermediateSymbols.Variable, intermediates: Intermediate[]): void
    {
        if (variable.kind == IntermediateSymbolKind.GlobalVariable)
        {
            return;
        }

        if (!this.variableIntroducedSet.has(variable))
        {
            intermediates.push(
                new Intermediates.Introduce(variable),
            );

            this.variableIntroducedSet.add(variable);
        }
    }

    private lowerFile (file: LoweredNodes.File, modulesToBeInitialised: Set<SemanticSymbols.Module>): void
    {
        this.currentModule = file.module;

        for (const importModule of file.imports)
        {
            this.lowerImport(importModule);
        }

        this.lowerGlobals(file.variables, modulesToBeInitialised);

        for (const functionNode of file.functions)
        {
            this.lowerFunction(functionNode);
        }

        this.currentModule = null;
    }

    private lowerImport (importModule: SemanticSymbols.Module): void
    {
        for (const semanticFunctionSymbol of importModule.functionNameToSymbol.values())
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

        if (semanticFunctionSymbol.isMethod)
        {
            parameterSizes.push(IntermediateSize.Pointer);
        }

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

    private lowerGlobals (globals: LoweredNodes.GlobalVariableDeclaration[], modulesToBeInitialised: Set<SemanticSymbols.Module>): void
    {
        const globalInitialisers: Intermediates.Statement[] = [];

        for (const globalVariable of globals)
        {
            const globalSymbol = this.lowerGlobal(globalVariable);

            if (globalVariable.initialiser !== null)
            {
                this.lowerExpression(globalVariable.initialiser, globalInitialisers, globalSymbol);
            }
        }

        this.createInitialiserFunction(globalInitialisers, modulesToBeInitialised);
    }

    private lowerGlobal (globalVariable: LoweredNodes.GlobalVariableDeclaration): IntermediateSymbols.Global
    {
        const module = this.currentModule;
        if (module === null)
        {
            throw new Error(`Intermediate Lowerer error: Current module is null while lowering a global variable.`);
        }

        const qualifiedName = module.qualifiedName + '.' + globalVariable.symbol.name;

        const globalSymbol = new IntermediateSymbols.Global(qualifiedName, this.typeToSize(globalVariable.symbol.type));

        if (this.variableSymbolMap.has(globalVariable.symbol))
        {
            throw new Error(`Intermediate Lowerer error: Variable for symbol "${globalVariable.symbol.name}" already exists.`);
        }
        this.variableSymbolMap.set(globalVariable.symbol, globalSymbol);

        const globalIntermediate = new Intermediates.Global(globalSymbol);
        this.globals.push(globalIntermediate);

        return globalSymbol;
    }

    private createInitialiserFunction (initialisers: Intermediates.Statement[], modulesToBeInitialised: Set<SemanticSymbols.Module>): void
    {
        const module = this.currentModule;
        if (module === null)
        {
            throw new Error(`Intermediate Lowerer error: Current module is null while creating the initialiser function.`);
        }

        if (module.isEntryPoint)
        {
            if ((initialisers.length == 0) && (modulesToBeInitialised.size == 0))
            {
                return;
            }
        }
        else
        {
            if (initialisers.length == 0)
            {
                return;
            }
        }

        const initialisationBody = [];

        if (module.isEntryPoint)
        {
            for (const moduleWithInitiliser of modulesToBeInitialised)
            {
                // TODO: Find a better way than a hardcoded name:
                const qualifiedName = moduleWithInitiliser.qualifiedName + ':initialisation';

                const functionSymbol = new IntermediateSymbols.Function(qualifiedName, IntermediateSize.Void, []);

                initialisationBody.push(
                    new Intermediates.Call(functionSymbol),
                );

                const externalFunction = new Intermediates.External(functionSymbol);
                this.externals.push(externalFunction);
            }
        }

        initialisationBody.push(...initialisers);

        initialisationBody.push(
            new Intermediates.Return()
        );

        let qualifiedName: string;
        if (module.isEntryPoint)
        {
            qualifiedName = ':initialisation'; // TODO: Find a better way than a hardcoded name.
        }
        else
        {
            qualifiedName = module.qualifiedName + ':initialisation'; // TODO: Find a better way than a hardcoded name.
        }

        const functionSymbol = new IntermediateSymbols.Function(qualifiedName, IntermediateSize.Void, []);
        const functionIntermediate = new Intermediates.Function(functionSymbol, initialisationBody);
        this.functions.push(functionIntermediate);
    }

    private lowerFunction (functionDeclaration: LoweredNodes.FunctionDeclaration): void
    {
        if (this.currentModule === null)
        {
            throw new Error(`Intermediate Lowerer error: Current module is null while lowering a function.`);
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
                throw new Error(`Intermediate Lowerer error: The section of a non-external function is null."`);
            }

            const functionBody: Intermediates.Statement[] = [];
            let parameterCounter = 0;

            // Receive all parameters for them to be available as variables:
            for (const parameter of functionDeclaration.symbol.parameters)
            {
                const parameterSymbol = this.generateParameter(this.typeToSize(parameter.type), parameterCounter);
                parameterCounter += 1;

                const parameterVariable = this.generateLocalVariable(parameterSymbol.size, parameter);

                functionBody.push(
                    new Intermediates.Introduce(parameterVariable),
                    new Intermediates.Take(parameterVariable, parameterSymbol)
                );
            }

            this.lowerSection(functionDeclaration.section, functionBody);

            // The last instruction of a function must always be a return:
            if ((functionBody.at(-1)?.kind !== IntermediateKind.Return))
            {
                functionBody.push(
                    new Intermediates.Return()
                );
            }

            const functionIntermediate = new Intermediates.Function(functionSymbol, functionBody);

            this.functions.push(functionIntermediate);
        }
    }

    private lowerSection (section: LoweredNodes.Section, intermediates: Intermediate[]): void
    {
        for (const statement of section.statements)
        {
            this.lowerStatement(statement, intermediates);
        }
    }

    private lowerStatement (statement: LoweredNodes.Statement, intermediates: Intermediate[]): void
    {
        switch (statement.kind)
        {
            case SemanticKind.Section:
                this.lowerSection(statement, intermediates);
                break;
            case SemanticKind.LocalVariableDeclaration:
                this.lowerLocalVariableDeclaration(statement, intermediates);
                break;
            case SemanticKind.ReturnStatement:
                this.lowerReturnStatement(statement, intermediates);
                break;
            case SemanticKind.Assignment:
                this.lowerAssignment(statement, intermediates);
                break;
            case SemanticKind.CallExpression:
                this.lowerCallExpression(statement, intermediates);
                break;
            case SemanticKind.Label:
                this.lowerLabel(statement, intermediates);
                break;
            case SemanticKind.GotoStatement:
                this.lowerGotoStatement(statement, intermediates);
                break;
            case SemanticKind.ConditionalGotoStatement:
                this.lowerConditionalGotoStatement(statement, intermediates);
                break;
        }
    }

    private lowerLabel (labelNode: LoweredNodes.Label, intermediates: Intermediate[]): void
    {
        const labelSymbol = this.getOrGenerateIntermediateLabelForSemanticLabel(labelNode.symbol);

        intermediates.push(
            new Intermediates.Label(labelSymbol),
        );
    }

    private lowerGotoStatement (gotoStatement: LoweredNodes.GotoStatement, intermediates: Intermediate[]): void
    {
        const labelSymbol = this.getOrGenerateIntermediateLabelForSemanticLabel(gotoStatement.labelSymbol);

        if (labelSymbol === undefined)
        {
            throw new Error(`Intermediate Lowerer error: Label "${gotoStatement.labelSymbol.name}" in goto statement not found.`);
        }

        intermediates.push(
            new Intermediates.Goto(labelSymbol),
        );
    }

    private lowerConditionalGotoStatement (
        conditionalGotoStatement: LoweredNodes.ConditionalGotoStatement,
        intermediates: Intermediate[]
    ): void
    {
        const labelSymbol = this.getOrGenerateIntermediateLabelForSemanticLabel(conditionalGotoStatement.labelSymbol);

        if (labelSymbol === undefined)
        {
            throw new Error(`Intermediate Lowerer error: Label "${conditionalGotoStatement.labelSymbol.name}" in conditional goto statement not found.`);
        }

        const condition = this.generateLocalVariable(this.typeToSize(conditionalGotoStatement.condition.type));

        this.lowerExpression(conditionalGotoStatement.condition, intermediates, condition);

        const falseLiteral = new IntermediateSymbols.Literal('0', IntermediateSize.Int8);

        const falseLiteralVariable = this.generateLocalVariable(falseLiteral.size);

        intermediates.push(
            new Intermediates.Introduce(falseLiteralVariable),
            new Intermediates.Move(falseLiteralVariable, falseLiteral),
            new Intermediates.Compare(condition, falseLiteralVariable),
        );

        intermediates.push(
            new Intermediates.JumpIfEqual(labelSymbol),
        );
    }

    private lowerLocalVariableDeclaration (
        variableDeclaration: LoweredNodes.LocalVariableDeclaration,
        intermediates: Intermediate[]
    ): void
    {
        const variable = this.generateLocalVariable(this.typeToSize(variableDeclaration.symbol.type), variableDeclaration.symbol);

        if (variableDeclaration.initialiser !== null)
        {
            this.lowerExpression(variableDeclaration.initialiser, intermediates, variable);
        }
    }

    private lowerReturnStatement (returnStatement: LoweredNodes.ReturnStatement, intermediates: Intermediate[]): void
    {
        if (returnStatement.expression !== null)
        {
            const returnSymbol = new IntermediateSymbols.ReturnValue(0, this.typeToSize(returnStatement.expression.type));
            const temporaryVariable = this.generateLocalVariable(returnSymbol.size);

            this.lowerExpression(returnStatement.expression, intermediates, temporaryVariable);

            intermediates.push(
                new Intermediates.Give(returnSymbol, temporaryVariable),
            );
        }

        intermediates.push(
            new Intermediates.Return(),
        );
    }

    private lowerAssignment (assignment: LoweredNodes.Assignment, intermediates: Intermediate[]): void
    {
        const variable = this.getVariableFromSymbol(assignment.variable);

        if (assignment.expression !== null)
        {
            this.lowerExpression(assignment.expression, intermediates, variable);
        }
    }

    private lowerExpression (
        expression: LoweredNodes.Expression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.Variable
    ): void
    {
        switch (expression.kind)
        {
            case SemanticKind.LiteralExpression:
                this.lowerLiteralExpression(expression, intermediates, targetLocation);
                break;
            case SemanticKind.VariableExpression:
                this.lowerVariableExpression(expression, intermediates, targetLocation);
                break;
            case SemanticKind.CallExpression:
                this.lowerCallExpression(expression, intermediates, targetLocation);
                break;
            case SemanticKind.UnaryExpression:
                this.lowerUnaryExpression(expression, intermediates, targetLocation);
                break;
            case SemanticKind.BinaryExpression:
                this.lowerBinaryExpression(expression, intermediates, targetLocation);
                break;
        }
    }

    private lowerLiteralExpression (
        literalExpression: LoweredNodes.LiteralExpression,
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
                        throw new Error(`Intermediate Lowerer error: Unknown Bool value of "${literalExpression.value}"`);
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
                throw new Error(`Intermediate Lowerer error: Unknown literal of type "${literalExpression.type.name}"`);
        }

        this.introduceIfNecessary(targetLocation, intermediates);

        intermediates.push(
            new Intermediates.Move(targetLocation, literalOrConstant),
        );
    }

    private lowerVariableExpression (
        variableExpression: LoweredNodes.VariableExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.Variable
    ): void
    {
        const variable = this.variableSymbolMap.get(variableExpression.variable);

        if (variable === undefined)
        {
            throw new Error(`Intermediate Lowerer error: Variable "${variableExpression.variable.name}" used before declaration.`);
        }

        if (variable !== targetLocation)
        {
            this.introduceIfNecessary(targetLocation, intermediates);

            intermediates.push(
                new Intermediates.Move(targetLocation, variable),
            );
        }
    }

    private lowerCallExpression (
        callExpression: LoweredNodes.CallExpression,
        intermediates: Intermediate[],
        targetLocation?: IntermediateSymbols.Variable
    ): void
    {
        let parameterCounter = 0;

        const argumentExpressions: LoweredNodes.Expression[] = [];
        if (callExpression.thisReference !== null)
        {
            argumentExpressions.push(callExpression.thisReference);
        }
        argumentExpressions.push(...callExpression.arguments);

        for (const argumentExpression of argumentExpressions)
        {
            const temporaryVariable = this.generateLocalVariable(this.typeToSize(argumentExpression.type));

            this.lowerExpression(argumentExpression, intermediates, temporaryVariable);

            const parameter = this.generateParameter(temporaryVariable.size, parameterCounter);
            parameterCounter += 1;

            intermediates.push(
                new Intermediates.Give(parameter, temporaryVariable),
            );
        }

        const functionSymbol = this.functionSymbolMap.get(callExpression.functionSymbol);

        if (functionSymbol === undefined)
        {
            throw new Error(`Intermediate Lowerer error: Function "${callExpression.functionSymbol.name}" used before declaration.`);
        }

        intermediates.push(
            new Intermediates.Call(functionSymbol),
        );

        if (targetLocation !== undefined)
        {
            if (functionSymbol.returnSize == IntermediateSize.Void)
            {
                throw new Error(
                    `Intermediate Lowerer error: Function "${callExpression.functionSymbol.name}" has no return value but is used as an expression.`
                );
            }

            this.introduceIfNecessary(targetLocation, intermediates);

            const returnValue = new IntermediateSymbols.ReturnValue(0, functionSymbol.returnSize);

            intermediates.push(
                new Intermediates.Take(targetLocation, returnValue),
            );
        }
    }

    private lowerUnaryExpression (
        unaryExpression: LoweredNodes.UnaryExpression,
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
                    this.introduceIfNecessary(targetLocation, intermediates);

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
                            throw new Error(`Intermediate Lowerer error: Inconsistent handling for operator "${operator.kind}"`);
                    }

                    intermediates.push(intermediate);

                    break;
                }
            default:
                throw new Error(
                    `Intermediate Lowerer error: The operator "${operator.kind}" for operand of "${operator.operandType.name}" and ` +
                    `result of "${operator.resultType.name}" is not implemented.`
                );
        }
    }

    private lowerBinaryExpression (
        binaryExpression: LoweredNodes.BinaryExpression,
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
        binaryExpression: LoweredNodes.BinaryExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.Variable
    ): void
    {
        this.lowerExpression(binaryExpression.leftOperand, intermediates, targetLocation);

        const temporaryVariable = this.generateLocalVariable(this.typeToSize(binaryExpression.rightOperand.type));

        this.lowerExpression(binaryExpression.rightOperand, intermediates, temporaryVariable);

        this.introduceIfNecessary(targetLocation, intermediates);

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
                    `Intermediate Lowerer error: The size-retaining operator "${operator.kind}" for the operands of "${operator.leftType.name}" and ` +
                    `"${operator.rightType.name}" with the result type of "${operator.resultType.name}" is not implemented.`
                );
        }
    }

    /**
     * Lower a binary expression where the result type has the same as the left type.
     */
    private lowerSizeChangingBinaryExpression (
        binaryExpression: LoweredNodes.BinaryExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.Variable
    ): void
    {
        const leftTemporaryVariable = this.generateLocalVariable(this.typeToSize(binaryExpression.leftOperand.type));

        this.lowerExpression(binaryExpression.leftOperand, intermediates, leftTemporaryVariable);

        const rightTemporaryVariable = this.generateLocalVariable(this.typeToSize(binaryExpression.rightOperand.type));

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

                this.introduceIfNecessary(targetLocation, intermediates);

                intermediates.push(
                    new Intermediates.Move(targetLocation, falseLiteral),
                    new Intermediates.Goto(endLabel),
                    new Intermediates.Label(trueLabel),
                    new Intermediates.Move(targetLocation, trueLiteral),
                    new Intermediates.Label(endLabel),
                );

                break;
            }
            default:
                throw new Error(
                    `Intermediate Lowerer error: The size-changing operator "${operator.kind}" for the operands of "${operator.leftType.name}" ` +
                    `and "${operator.rightType.name}" with the result type of "${operator.resultType.name}" is not implemented.`
                );
        }
    }
}
