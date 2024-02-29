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
    private structure: Intermediates.Structure|null;

    private functionSymbolMap: Map<string, IntermediateSymbols.Function>;
    private variableSymbolMap: Map<SemanticSymbols.VariableLike, IntermediateSymbols.Variable>; // TODO: Use the qualified name as key.
    private fieldSymbolMap: Map<SemanticSymbols.Field, IntermediateSymbols.Field>; // TODO: Use the qualified name as key.
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
        this.structure = null;

        this.functionSymbolMap = new Map();
        this.variableSymbolMap = new Map();
        this.fieldSymbolMap = new Map();
        this.valueToConstantMap = new Map();
        this.semanticLabelNameToIntermediateLabelMap = new Map();
        this.variableIntroducedSet = new Set();

        this.currentModule = null;
    }

    public run (fileNode: LoweredNodes.File): Intermediates.File
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
        this.structure = null;

        this.functionSymbolMap.clear();
        this.variableSymbolMap.clear();
        this.fieldSymbolMap.clear();
        this.valueToConstantMap.clear();
        this.semanticLabelNameToIntermediateLabelMap.clear();
        this.variableIntroducedSet.clear();

        this.currentModule = null;

        this.lowerFile(fileNode);

        return new Intermediates.File(
            this.constants,
            this.externals,
            this.globals,
            this.functions,
            this.structure,
            fileNode.module.isEntryPoint
        );
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

        const qualifiedName = this.currentModule.namespace.qualifiedName + '~' + `c#${this.constantCounter}`;

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

        if (this.semanticLabelNameToIntermediateLabelMap.has(semanticLabelSymbol.namespace.qualifiedName))
        {
            intermediateLabelSymbol = this.semanticLabelNameToIntermediateLabelMap.get(semanticLabelSymbol.namespace.qualifiedName)!;
        }
        else
        {
            intermediateLabelSymbol = this.generateLabel();

            this.semanticLabelNameToIntermediateLabelMap.set(semanticLabelSymbol.namespace.qualifiedName, intermediateLabelSymbol);
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

    private generateLocalVariable (size: IntermediateSize, symbol?: SemanticSymbols.VariableLike): IntermediateSymbols.LocalVariable
    {
        const newVariable = new IntermediateSymbols.LocalVariable(this.localVariableCounter, size);

        this.localVariableCounter += 1;

        if (symbol !== undefined)
        {
            if (this.variableSymbolMap.has(symbol))
            {
                throw new Error(`Intermediate Lowerer error: Variable for symbol "${symbol.namespace.qualifiedName}" already exists.`);
            }

            this.variableSymbolMap.set(symbol, newVariable);
        }

        return newVariable;
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

    private introduceIfNecessary (variable: IntermediateSymbols.WritableValue, intermediates: Intermediate[]): void
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

    private lowerFile (file: LoweredNodes.File): void
    {
        this.currentModule = file.module;

        for (const importModule of file.imports)
        {
            this.lowerImport(importModule);
        }

        for (const globalVariable of file.variables)
        {
            this.lowerGlobal(globalVariable);
        }

        this.lowerFields(file.fields);

        // Pre-lowering of the function symbols for them to be available in every other function regardless of their order:
        for (const functionNode of file.functions)
        {
            this.lowerFunctionSymbol(functionNode.symbol, file.module);
        }

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

        if (semanticFunctionSymbol.thisReference !== null)
        {
            parameterSizes.push(IntermediateSize.Pointer);
        }

        for (const parameter of semanticFunctionSymbol.parameters)
        {
            const parameterSize = this.typeToSize(parameter.type);
            parameterSizes.push(parameterSize);
        }

        let intermediateName: string;
        if (module.isEntryPoint && semanticFunctionSymbol.namespace.baseName == 'main') // TODO: Find a better way than a hardcoded name.
        {
            intermediateName = semanticFunctionSymbol.namespace.baseName;
        }
        else
        {
            intermediateName = semanticFunctionSymbol.namespace.qualifiedName;
        }

        const intermediateFunctionSymbol = new IntermediateSymbols.Function(
            intermediateName,
            this.typeToSize(semanticFunctionSymbol.returnType),
            parameterSizes
        );

        this.functionSymbolMap.set(semanticFunctionSymbol.namespace.qualifiedName, intermediateFunctionSymbol);

        return intermediateFunctionSymbol;
    }

    private lowerGlobal (globalVariable: SemanticSymbols.Variable): IntermediateSymbols.Global
    {
        const globalSymbol = new IntermediateSymbols.Global(
            globalVariable.namespace.qualifiedName,
            this.typeToSize(globalVariable.type)
        );

        this.variableSymbolMap.set(globalVariable, globalSymbol);

        const globalIntermediate = new Intermediates.Global(globalSymbol);
        this.globals.push(globalIntermediate);

        return globalSymbol;
    }

    private lowerFields (fields: SemanticSymbols.Field[]): void
    {
        if (fields.length == 0)
        {
            this.structure = null;
            return;
        }

        const module = this.currentModule;
        if (module === null)
        {
            throw new Error(`Intermediate Lowerer error: Current module is null while lowering fields.`);
        }

        const fieldSymbols: IntermediateSymbols.Field[] = [];
        for (let index = 0; index < fields.length; index += 1)
        {
            const semanticFieldSymbol = fields[index];

            const fieldSymbol = new IntermediateSymbols.Field(
                semanticFieldSymbol.namespace.qualifiedName,
                this.typeToSize(semanticFieldSymbol.type),
                index
            );

            this.fieldSymbolMap.set(semanticFieldSymbol, fieldSymbol);
            fieldSymbols.push(fieldSymbol);
        }

        // TODO: Find a better way than a hardcoded name.
        // TODO: Using ":" as a separator is ambiguous because it is also used in the qualified name.
        const qualifiedName = module.namespace.qualifiedName + ':class';

        const structureSymbol = new IntermediateSymbols.Structure(qualifiedName, fieldSymbols);

        this.structure = new Intermediates.Structure(structureSymbol);
    }

    private lowerFunction (functionDeclaration: LoweredNodes.FunctionDeclaration): void
    {
        if (this.currentModule === null)
        {
            throw new Error(`Intermediate Lowerer error: Current module is null while lowering a function.`);
        }

        const functionSymbol = this.functionSymbolMap.get(functionDeclaration.symbol.namespace.qualifiedName);

        if (functionSymbol === undefined)
        {
            throw new Error(
                `Intermediate Lowerer error: No pre-lowered symbol found for function "${functionDeclaration.symbol.namespace.qualifiedName}".`
            );
        }

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

            const parameters: SemanticSymbols.FunctionParameter[] = [];

            if (functionDeclaration.symbol.thisReference !== null)
            {
                parameters.push(functionDeclaration.symbol.thisReference);
            }

            parameters.push(...functionDeclaration.symbol.parameters);

            // Receive all parameters for them to be available as variables:
            for (const parameter of parameters)
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
            throw new Error(
                `Intermediate Lowerer error: Label "${gotoStatement.labelSymbol.namespace.qualifiedName}" in goto statement not found.`
            );
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
            throw new Error(
                `Intermediate Lowerer error: Label "${conditionalGotoStatement.labelSymbol.namespace.qualifiedName}"`
                + ` in conditional goto statement not found.`);
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
        if (assignment.to.kind == SemanticKind.VariableExpression)
        {
            const variable = this.variableSymbolMap.get(assignment.to.variable);

            if (variable === undefined)
            {
                throw new Error(
                    `Intermediate Lowerer error: Variable for symbol "${assignment.to.variable.namespace.qualifiedName}" does not exist.`
                );
            }

            // TODO: Should we lowere the to expression or would that be redundant?
            this.lowerExpression(assignment.from, intermediates, variable);
        }
        else
        {
            const field = this.fieldSymbolMap.get(assignment.to.field);

            if (field === undefined)
            {
                throw new Error(
                    `Intermediate Lowerer error: Field for symbol "${assignment.to.field.namespace.qualifiedName}" does not exist.`
                );
            }

            if (this.structure === null)
            {
                throw new Error(`Intermediate Lowerer error: Structure is null while accessing a field.`);
            }

            const temporaryVariable = this.generateLocalVariable(this.typeToSize(assignment.to.type));
            this.introduceIfNecessary(temporaryVariable, intermediates);
            this.lowerExpression(assignment.from, intermediates, temporaryVariable);

            const thisReference = this.generateLocalVariable(IntermediateSize.Pointer);
            this.lowerVariableExpression(assignment.to.thisReference, intermediates, thisReference);

            // TODO: We must not lower the field expression, must we?

            intermediates.push(
                new Intermediates.StoreField(temporaryVariable, this.structure.symbol, thisReference, field),
            );
        }
    }

    private lowerExpression (
        expression: LoweredNodes.Expression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.WritableValue
    ): void
    {
        switch (expression.kind)
        {
            case SemanticKind.BinaryExpression:
                this.lowerBinaryExpression(expression, intermediates, targetLocation);
                break;
            case SemanticKind.CallExpression:
                this.lowerCallExpression(expression, intermediates, targetLocation);
                break;
            case SemanticKind.FieldExpression:
                this.lowerFieldExpression(expression, intermediates, targetLocation);
                break;
            case SemanticKind.LiteralExpression:
                this.lowerLiteralExpression(expression, intermediates, targetLocation);
                break;
            case SemanticKind.SizeOfExpression:
                this.lowerSizeOfExpression(expression, intermediates, targetLocation);
                break;
            case SemanticKind.UnaryExpression:
                this.lowerUnaryExpression(expression, intermediates, targetLocation);
                break;
            case SemanticKind.VariableExpression:
                this.lowerVariableExpression(expression, intermediates, targetLocation);
                break;
        }
    }

    private lowerSizeOfExpression (
        sizeOfExpression: LoweredNodes.SizeOfExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.WritableValue
    ): void
    {
        if (this.currentModule === null)
        {
            throw new Error('Intermediate Lowerer error: Current module is null while lowering a sizeOf expression.');
        }

        if (sizeOfExpression.parameter.namespace.qualifiedName !== this.currentModule.namespace.qualifiedName)
        {
            throw new Error('Intermediate Lowerer error: The sizeOf expression is not implemented for parameters from other modules.');
        }

        this.introduceIfNecessary(targetLocation, intermediates);

        if (this.structure === null)
        {
            intermediates.push(
                new Intermediates.Move(
                    targetLocation,
                    new IntermediateSymbols.Literal('0', IntermediateSize.Native)
                ),
            );
        }
        else
        {
            intermediates.push(
                new Intermediates.SizeOf(targetLocation, this.structure.symbol),
            );
        }
    }

    private lowerLiteralExpression (
        literalExpression: LoweredNodes.LiteralExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.WritableValue
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
                throw new Error(`Intermediate Lowerer error: Unknown literal of type "${literalExpression.type.namespace.qualifiedName}"`);
        }

        this.introduceIfNecessary(targetLocation, intermediates);

        intermediates.push(
            new Intermediates.Move(targetLocation, literalOrConstant),
        );
    }

    private lowerVariableExpression (
        variableExpression: LoweredNodes.VariableExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.WritableValue
    ): void
    {
        const variable = this.variableSymbolMap.get(variableExpression.variable);

        if (variable === undefined)
        {
            throw new Error(
                `Intermediate Lowerer error: Variable "${variableExpression.variable.namespace.qualifiedName}" used before declaration.`
            );
        }

        if (variable !== targetLocation)
        {
            this.introduceIfNecessary(targetLocation, intermediates);

            intermediates.push(
                new Intermediates.Move(targetLocation, variable),
            );
        }
    }

    private lowerFieldExpression (
        fieldExpression: LoweredNodes.FieldExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.WritableValue
    ): void
    {
        const field = this.fieldSymbolMap.get(fieldExpression.field);

        if (field === undefined)
        {
            throw new Error(
                `Intermediate Lowerer error: Field "${fieldExpression.field.namespace.qualifiedName}" used before declaration.`
            );
        }

        const thisReference = this.generateLocalVariable(IntermediateSize.Pointer);
        this.lowerVariableExpression(fieldExpression.thisReference, intermediates, thisReference);

        this.introduceIfNecessary(targetLocation, intermediates);

        if (this.structure === null)
        {
            throw new Error(`Intermediate Lowerer error: Structure is null while accessing a field.`);
        }

        intermediates.push(
            new Intermediates.LoadField(targetLocation, this.structure.symbol, thisReference, field),
        );
    }

    private lowerCallExpression (
        callExpression: LoweredNodes.CallExpression,
        intermediates: Intermediate[],
        targetLocation?: IntermediateSymbols.WritableValue
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

        const functionSymbol = this.functionSymbolMap.get(callExpression.functionSymbol.namespace.qualifiedName);

        if (functionSymbol === undefined)
        {
            throw new Error(
                `Intermediate Lowerer error: Function "${callExpression.functionSymbol.namespace.qualifiedName}" used before declaration.`
            );
        }

        intermediates.push(
            new Intermediates.Call(functionSymbol),
        );

        if (targetLocation !== undefined)
        {
            if (functionSymbol.returnSize == IntermediateSize.Void)
            {
                throw new Error(
                    `Intermediate Lowerer error: Function "${callExpression.functionSymbol.namespace.qualifiedName}"`
                    + ` has no return value but is used as an expression.`
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
        targetLocation: IntermediateSymbols.WritableValue
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
                    `Intermediate Lowerer error: The operator "${operator.kind}" for operand of`
                    + ` "${operator.operandType.namespace.qualifiedName}" and result of "${operator.resultType.namespace.qualifiedName}"`
                    + ` is not implemented.`
                );
        }
    }

    private lowerBinaryExpression (
        binaryExpression: LoweredNodes.BinaryExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.WritableValue
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
        targetLocation: IntermediateSymbols.WritableValue
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
                    `Intermediate Lowerer error: The size-retaining operator "${operator.kind}" for the operands of`
                    + ` "${operator.leftType.namespace.qualifiedName}" and "${operator.rightType.namespace.qualifiedName}"`
                    + ` with the result type of "${operator.resultType.namespace.qualifiedName}" is not implemented.`
                );
        }
    }

    /**
     * Lower a binary expression where the result type has the same as the left type.
     */
    private lowerSizeChangingBinaryExpression (
        binaryExpression: LoweredNodes.BinaryExpression,
        intermediates: Intermediate[],
        targetLocation: IntermediateSymbols.WritableValue
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
                    `Intermediate Lowerer error: The size-changing operator "${operator.kind}" for the operands of`
                    + ` "${operator.leftType.namespace.qualifiedName}" and "${operator.rightType.namespace.qualifiedName}" with the`
                    + ` result type of "${operator.resultType.namespace.qualifiedName}" is not implemented.`
                );
        }
    }
}
