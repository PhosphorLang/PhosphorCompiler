import * as Diagnostic from '../diagnostic';
import * as SemanticNodes from './semanticNodes';
import * as SemanticSymbols from './semanticSymbols';
import * as SyntaxNodes from '../parser/syntaxNodes';
import { ClassContext, FunctionContext, ModuleContext } from './connectorContext';
import { BuildInOperators } from '../definitions/buildInOperators';
import { BuildInTypes } from '../definitions/buildInTypes';
import { ElementsList } from '../parser/elementsList';
import { Namespace } from '../parser/namespace';
import { SemanticSymbolKind } from './semanticSymbolKind';
import { SyntaxKind } from '../parser/syntaxKind';
import { SemanticKind } from './semanticKind';

export class Connector
{
    private readonly diagnostic: Diagnostic.Diagnostic;

    /**
     * A map of files (by their local module name).
     * This is filled with already connected files that are imported in the current one.
     */
    private importedFiles: Map<string, SemanticNodes.File>;
    /**
     * A list of variables, global to the file.
     */
    private variables: Map<string, SemanticSymbols.Variable>;
    /**
     * A list of fields, global to the file (the class).
     */
    private fields: Map<string, SemanticSymbols.Field>;
    /**
     * A list of functions, global to the file.
     * This is filled before the function bodies are connected, so every function can reference every other function,
     * regardless of their position.
     */
    private functions: Map<string, SemanticSymbols.Function>;
    /**
     * A list of variable lists, working as a stack.
     * While connecting the function bodies, at the beginning of each section a new list is pushed, at the end of the section it is removed.
     * With this we keep track of which variables are accessible at which point in the code.
     */
    private variableStacks: Map<string, SemanticSymbols.VariableLike>[];

    constructor (diagnostic: Diagnostic.Diagnostic)
    {
        this.diagnostic = diagnostic;

        this.importedFiles = new Map();
        this.variables = new Map();
        this.fields = new Map();
        this.functions = new Map();
        this.variableStacks = [this.variables];
    }

    public run (fileSyntaxNode: SyntaxNodes.File, qualifiedNameToFile: Map<string, SemanticNodes.File>): SemanticNodes.File
    {
        this.importedFiles.clear();
        this.variables.clear();
        this.fields.clear();
        this.functions.clear();
        this.variableStacks = [this.variables];

        const result = this.connectFile(fileSyntaxNode, qualifiedNameToFile);

        return result;
    }

    private pushVariable (variable: SemanticSymbols.VariableLike): void
    {
        const currentVariableStack = this.variableStacks[this.variableStacks.length - 1];

        currentVariableStack.set(variable.namespace.qualifiedName, variable);
    }

    private getVariable (qualifiedName: string): SemanticSymbols.VariableLike|null
    {
        for (const variableStack of this.variableStacks)
        {
            for (const variable of variableStack.values())
            {
                if (variable.namespace.qualifiedName == qualifiedName)
                {
                    return variable;
                }
            }
        }

        return null;
    }

    private connectFile (file: SyntaxNodes.File, qualifiedNameToFile: Map<string, SemanticNodes.File>): SemanticNodes.File
    {
        const importedModules: SemanticSymbols.Module[] = [];

        for (const importSyntaxNode of file.imports)
        {
            const importedFile = qualifiedNameToFile.get(importSyntaxNode.namespace.qualifiedName);

            if (importedFile === undefined)
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Module "${importSyntaxNode.namespace.qualifiedName}" not found.`,
                        Diagnostic.Codes.ModuleNotFoundError,
                        importSyntaxNode.keyword
                    )
                );
            }

            const duplicateFile = this.importedFiles.get(importSyntaxNode.namespace.moduleName);

            if (duplicateFile != undefined)
            {
                if (duplicateFile.module.equals(importedFile.module))
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Module "${importSyntaxNode.namespace.qualifiedName}" already imported.`,
                            Diagnostic.Codes.ModuleAlreadyImportedError,
                            importSyntaxNode.keyword
                        )
                    );

                }
                else
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Name conflict for import of "${duplicateFile.module.namespace.qualifiedName}" and `
                                + `"${importedFile.module.namespace.qualifiedName}". Use "as" to rename one of them.`,
                            Diagnostic.Codes.ImportNameConflictError,
                            importSyntaxNode.keyword
                        )
                    );
                }
            }
            else
            {
                this.importedFiles.set(importSyntaxNode.namespace.moduleName, importedFile);

                importedModules.push(importedFile.module);
            }
        }

        const classContext = this.connectModuleType(file);

        // Function declarations:
        for (const functionDeclaration of file.functions)
        {
            this.preconnectFunctionDeclaration(functionDeclaration, file.module.namespace, classContext);
        }

        // Global variables declarations:
        for (const variableNode of file.variables)
        {
            this.preconnectGlobalVariableDeclaration(variableNode, file.module.namespace, classContext);
        }

        // Field declarations:
        for (const fieldNode of file.fields)
        {
            this.preconnectFieldVariableDeclaration(fieldNode, file.module.namespace, classContext);
        }

        // TODO: Check for name conflicts between functions, variables and fields.

        // Module:
        const moduleSymbol = this.connectModule(file.module, classContext);
        const classModuleContext: ModuleContext = {
            module: moduleSymbol
        };

        // Global variables:
        const variableDeclarations: SemanticNodes.GlobalVariableDeclaration[] = [];
        for (const variableNode of file.variables)
        {
            const variableDeclaration = this.connectGlobalVariableDeclaration(variableNode, classModuleContext);
            variableDeclarations.push(variableDeclaration);
        }

        // Fields:
        const fieldDeclarations: SemanticNodes.FieldDeclaration[] = [];
        for (const fieldNode of file.fields)
        {
            const fieldDeclaration = this.connectFieldVariableDeclaration(fieldNode, classModuleContext);
            fieldDeclarations.push(fieldDeclaration);
        }

        // Function bodies:
        const functionDeclarations: SemanticNodes.FunctionDeclaration[] = [];
        for (const functionNode of file.functions)
        {
            const functionDeclaration = this.connectFunctionDeclaration(functionNode, classModuleContext);
            functionDeclarations.push(functionDeclaration);
        }

        return new SemanticNodes.File(
            file.fileName,
            moduleSymbol,
            importedModules,
            variableDeclarations,
            fieldDeclarations,
            functionDeclarations
        );
    }

    private connectModuleType (file: SyntaxNodes.File): ClassContext
    {
        const module = file.module;
        let result: ClassContext;

        if (module.isClass)
        {
            const parameters: SemanticSymbols.GenericTypeParameter[] = [];

            if (file.generics != null)
            {
                for (const genericParameter of file.generics.parameters.elements)
                {
                    const namespace = Namespace.constructFromNamespace(module.namespace, genericParameter.identifier.content);
                    // TODO: Implement constraints and constant parameters.
                    const parameter = new SemanticSymbols.GenericTypeParameter(namespace, null, false);
                    parameters.push(parameter);
                }
            }

            result = {
                genericType: new SemanticSymbols.GenericType(module.namespace, parameters),
            };
        }
        else
        {
            result = {
                genericType: null,
            };
        }

        return result;
    }

    private connectModule (module: SyntaxNodes.Module, context: ClassContext): SemanticSymbols.Module
    {
        const variableNameToSymbol = new Map(this.variables);
        const fieldNameToSymbol = new Map(this.fields);
        const functionNameToSymbol = new Map(this.functions);

        const isEntryPoint = module.isEntryPoint;

        return new SemanticSymbols.Module(
            module.namespace,
            context?.genericType ?? null,
            variableNameToSymbol,
            fieldNameToSymbol,
            functionNameToSymbol,
            isEntryPoint
        );
    }

    private preconnectFunctionDeclaration (
        functionDeclaration: SyntaxNodes.FunctionDeclaration,
        moduleNamespace: Namespace,
        context: ClassContext
    ): void
    {
        const namespace = Namespace.constructFromNamespace(moduleNamespace, functionDeclaration.identifier.content);
        const returnType = this.connectTypeClause(functionDeclaration.type, context) ?? BuildInTypes.noType;
        const parameters = this.connectParameters(functionDeclaration.parameters, moduleNamespace, context);
        const isHeader = functionDeclaration.isHeader;

        let thisReference: SemanticSymbols.FunctionParameter|null;
        if (functionDeclaration.isMethod)
        {
            if (context.genericType === null)
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        'Methods can only be declared in classes.',
                        Diagnostic.Codes.MethodInModuleWithoutClassError,
                        functionDeclaration.identifier
                    )
                );
            }

            const thisConcreteType = new SemanticSymbols.ConcreteType(context.genericType.namespace, context.genericType.parameters);

            thisReference = new SemanticSymbols.FunctionParameter(
                Namespace.constructFromNamespace(moduleNamespace, 'this'),
                thisConcreteType
            );
        }
        else
        {
            thisReference = null;
        }

        if (this.functions.has(namespace.qualifiedName))
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Duplicate declaration of function "${namespace.baseName}".`,
                    Diagnostic.Codes.DuplicateFunctionDeclarationError,
                    functionDeclaration.identifier
                )
            );
        }

        const functionSymbol = new SemanticSymbols.Function(namespace, returnType, parameters, thisReference, isHeader);

        this.functions.set(namespace.qualifiedName, functionSymbol);
    }

    private connectTypeClause (
        typeClause: SyntaxNodes.TypeClause|null,
        context: ClassContext|ModuleContext
    ): SemanticSymbols.ConcreteType|SemanticSymbols.GenericTypeParameter|null
    {
        if (typeClause === null)
        {
            return null;
        }
        else
        {
            return this.connectType(typeClause.type, context);
        }
    }

    private connectType (
        typeSyntaxNode: SyntaxNodes.Type,
        context: ClassContext|ModuleContext
    ): SemanticSymbols.ConcreteType|SemanticSymbols.GenericTypeParameter
    {
        const typeName = typeSyntaxNode.identifier.content;

        let type: SemanticSymbols.TypeLike|SemanticSymbols.GenericType|null = BuildInTypes.getTypeByName(typeName);

        if (type === null)
        {
            const importedClass = this.importedFiles.get(typeName);
            type = importedClass?.module.classType ?? null;

            if (type === null)
            {
                let classType: SemanticSymbols.GenericType|null = null;
                if ('genericType' in context) // TODO: This is ugly and unsafe Typescript magic.
                {
                    classType = context.genericType;
                }
                else
                {
                    classType = context.module.classType;
                }

                if (classType != null)
                {
                    for (const parameter of classType.parameters)
                    {
                        if (parameter.namespace.baseName === typeName)
                        {
                            type = parameter;
                        }
                    }
                }

                if (type === null)
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Unknown type "${typeName}"`,
                            Diagnostic.Codes.UnknownTypeError,
                            typeSyntaxNode.identifier
                        )
                    );
                }
            }
        }

        const theType = type; // HACK: This is a workaround to make the type checker happy. Why is this necessary?

        const isGenericType = theType.kind === SemanticSymbolKind.GenericType;
        if (isGenericType && (theType.parameters.length !== typeSyntaxNode.arguments.elements.length))
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Wrong argument count for generic type "${theType.namespace.baseName}"`,
                    Diagnostic.Codes.WrongGenericArgumentCountError, // TODO: Rename to "parameter".
                    typeSyntaxNode.identifier
                )
            );
        }
        else if (!isGenericType && (typeSyntaxNode.arguments.elements.length > 0))
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `The type "${theType.namespace.baseName}" is not generic and thus cannot be used as such.`,
                    Diagnostic.Codes.NonGenericTypeIsUsedAsGenericTypeError,
                    typeSyntaxNode.identifier
                )
            );
        }

        if (!isGenericType)
        {
            return theType;
        }

        const concreteParameters: SemanticSymbols.TypeLike[] = [];
        for (let i = 0; i < theType.parameters.length; i++)
        {
            const argument = typeSyntaxNode.arguments.elements[i];

            if (theType.parameters[i].isConstant)
            {
                if (argument.kind != SyntaxKind.LiteralExpression)
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Generic argument "${theType.parameters[i].namespace.baseName}" must be a literal.`,
                            Diagnostic.Codes.GenericArgumentMustBeLiteralError, // TODO: Rename to "parameter".
                            typeSyntaxNode.identifier // TODO: Would be better to have the token of the parameter here.
                        )
                    );
                }

                const literalType = BuildInTypes.getTypeByTokenKind(argument.literal.kind);
                if (literalType === null)
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            // TODO: This is the same error as in connectLiteralExpression. Could this be unified?
                            `Unexpected literal "${argument.literal.content}" of type "${argument.kind}".`,
                            Diagnostic.Codes.UnexpectedLiteralExpressionSyntaxKindError,
                            argument.literal
                        )
                    );
                }

                // FIXME: Implement literal parameters.
                throw new Error('Connector error: Literal parameters are not implemented.');
            }
            else
            {
                if (argument.kind != SyntaxKind.Type)
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Generic argument "${theType.parameters[i].namespace.baseName}" must be a type.`,
                            Diagnostic.Codes.GenericArgumentMustBeTypeError, // TODO: Rename to "parameter".
                            typeSyntaxNode.identifier // TODO: Would be better to have the token of the parameter here.
                        )
                    );
                }

                const typeParameterType = this.connectType(argument, context);
                concreteParameters.push(typeParameterType);
            }
        }

        return new SemanticSymbols.ConcreteType(theType.namespace, concreteParameters);
    }

    private connectParameters (
        parameters: ElementsList<SyntaxNodes.FunctionParameter>,
        moduleNamespace: Namespace,
        context: ClassContext
    ): SemanticSymbols.FunctionParameter[]
    {
        const parameterSymbols: SemanticSymbols.FunctionParameter[] = [];

        const names = new Set<string>();

        for (const parameter of parameters.elements)
        {
            const namespace = Namespace.constructFromNamespace(moduleNamespace, parameter.identifier.content);

            if (names.has(namespace.qualifiedName))
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Duplicate parameter name "${namespace.baseName}"`,
                        Diagnostic.Codes.DuplicateParameterNameError,
                        parameter.identifier
                    )
                );
            }

            names.add(namespace.qualifiedName);

            const type = this.connectTypeClause(parameter.type, context);

            if (type === null)
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        'Parameters must have a type clause given.',
                        Diagnostic.Codes.ParameterWithoutTypeClauseError,
                        parameter.identifier
                    )
                );
            }


            const parameterSymbol = new SemanticSymbols.FunctionParameter(namespace, type);

            parameterSymbols.push(parameterSymbol);
        }

        return parameterSymbols;
    }

    private preconnectGlobalVariableDeclaration (
        variableDeclaration: SyntaxNodes.GlobalVariableDeclaration,
        moduleNamespace: Namespace,
        context: ClassContext
    ): void
    {
        const namespace = Namespace.constructFromNamespace(moduleNamespace, variableDeclaration.identifier.content);

        const type = this.connectTypeClause(variableDeclaration.type, context);
        if (type === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `The module variable "${namespace.baseName}" is missing a type clause.`,
                    Diagnostic.Codes.GlobalVariableDeclarationIsMissingTypeClauseError,
                    variableDeclaration.identifier
                )
            );
        }

        const isReadonly = variableDeclaration.isConstant;

        const variable = new SemanticSymbols.Variable(namespace, type, isReadonly);

        if (this.getVariable(namespace.qualifiedName) !== null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Duplicate declaration of variable "${namespace.baseName}".`,
                    Diagnostic.Codes.DuplicateVariableDeclarationError,
                    variableDeclaration.identifier
                )
            );
        }

        this.variables.set(variable.namespace.qualifiedName, variable);
    }

    private connectGlobalVariableDeclaration (
        variableDeclaration: SyntaxNodes.GlobalVariableDeclaration,
        context: ModuleContext
    ): SemanticNodes.GlobalVariableDeclaration
    {
        const namespace = Namespace.constructFromNamespace(context.module.namespace, variableDeclaration.identifier.content);

        const variable = this.getVariable(namespace.qualifiedName);
        if (variable === null)
        {
            throw new Error('Connector error: Global variable symbol not found.');
        }
        else if (variable.kind !== SemanticSymbolKind.Variable)
        {
            throw new Error('Connector error: Global variable symbol is not a variable.');
        }

        const initialisier = variableDeclaration.initialiser === null
            ? null
            : this.connectExpression(variableDeclaration.initialiser, context);

        if (initialisier !== null && !initialisier.type.equals(variable.type))
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `The type of the initialiser for the module variable "${namespace.baseName}" does not match the type clause.`,
                    Diagnostic.Codes.InitialiserTypeDoesNotMatchGlobalVariableTypeClauseError,
                    variableDeclaration.identifier
                )
            );
        }

        return new SemanticNodes.GlobalVariableDeclaration(variable, initialisier);
    }

    private preconnectFieldVariableDeclaration (
        fieldDeclaration: SyntaxNodes.FieldVariableDeclaration,
        moduleNamespace: Namespace,
        context: ClassContext
    ): void
    {
        const namespace = Namespace.constructFromNamespace(moduleNamespace, fieldDeclaration.identifier.content);

        const type = this.connectTypeClause(fieldDeclaration.type, context);
        if (type === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `The field "${namespace.baseName}" is missing a type clause.`,
                    Diagnostic.Codes.FieldDeclarationIsMissingTypeClauseError,
                    fieldDeclaration.identifier
                )
            );
        }

        const isReadonly = fieldDeclaration.variableModifier === null;

        if (this.fields.has(namespace.qualifiedName))
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Duplicate declaration of field "${namespace.baseName}".`,
                    Diagnostic.Codes.DuplicateVariableDeclarationError,
                    fieldDeclaration.identifier
                )
            );
        }
        const fieldSymbol = new SemanticSymbols.Field(namespace, type, isReadonly);

        this.fields.set(namespace.qualifiedName, fieldSymbol);
    }

    private connectFieldVariableDeclaration (
        fieldDeclaration: SyntaxNodes.FieldVariableDeclaration,
        context: ModuleContext
    ): SemanticNodes.FieldDeclaration
    {
        if (context.module.classType === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    'Fields can only be declared in classes.',
                    Diagnostic.Codes.FieldInModuleWithoutClassError,
                    fieldDeclaration.identifier
                )
            );
        }

        const namespace = Namespace.constructFromNamespace(context.module.namespace, fieldDeclaration.identifier.content);

        const field = this.fields.get(namespace.qualifiedName);
        if (field === undefined)
        {
            // NOTE: The field symbol must exist because we added it previously based on the same field declaration.
            throw new Error('Connector error: Field symbol not found.');
        }

        const initialisier = fieldDeclaration.initialiser === null ? null : this.connectExpression(fieldDeclaration.initialiser, context);

        if (initialisier !== null && !initialisier.type.equals(field.type))
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `The type of the initialiser for the field "${namespace.baseName}" does not match the type clause.`,
                    Diagnostic.Codes.InitialiserTypeDoesNotMatchFieldDeclarationTypeClauseError,
                    fieldDeclaration.identifier
                )
            );
        }

        return new SemanticNodes.FieldDeclaration(field, initialisier);
    }

    private connectFunctionDeclaration (
        functionDeclaration: SyntaxNodes.FunctionDeclaration,
        context: ModuleContext
    ): SemanticNodes.FunctionDeclaration
    {
        const namespace = Namespace.constructFromNamespace(context.module.namespace, functionDeclaration.identifier.content);
        const functionSymbol = this.functions.get(namespace.qualifiedName);
        if (functionSymbol === undefined)
        {
            // NOTE: The function symbol must exist because we added it previously based on the same function declarations.
            throw new Error('Connector error: Function symbol not found.');
        }

        if ((functionSymbol.thisReference !== null) && (context.module.classType === null))
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    'Methods can only be declared in classes.',
                    Diagnostic.Codes.MethodInModuleWithoutClassError,
                    functionDeclaration.identifier
                )
            );
        }

        // Push a new list of variables to the variable stack:
        const variables = new Map<string, SemanticSymbols.Variable>();
        this.variableStacks.push(variables);

        // Push all parameters to the variable stack:
        for (const parameter of functionSymbol.parameters)
        {
            this.pushVariable(parameter);
        }

        const connectorContext: FunctionContext = {
            ...context,
            function: functionSymbol
        };

        let section: SemanticNodes.Section|null = null;
        if (functionDeclaration.body !== null)
        {
            section = this.connectSection(functionDeclaration.body, connectorContext);
        }

        // Remove the list of variables from the variable stack:
        this.variableStacks.pop();

        return new SemanticNodes.FunctionDeclaration(functionSymbol, section);
    }

    private connectSection (sectionSyntaxNode: SyntaxNodes.Section, context: FunctionContext): SemanticNodes.Section
    {
        const statementNodes: SemanticNodes.Statement[] = [];

        // Push a new list of variables to the variable stack:
        const variables = new Map<string, SemanticSymbols.Variable>();
        this.variableStacks.push(variables);

        for (const statement of sectionSyntaxNode.statements)
        {
            const statementNode = this.connectStatement(statement, context);

            statementNodes.push(statementNode);
        }

        // Remove the list of variables from the variable stack:
        this.variableStacks.pop();

        return new SemanticNodes.Section(statementNodes);
    }

    private connectStatement (statement: SyntaxNodes.Statement, context: FunctionContext): SemanticNodes.Statement
    {
        switch (statement.kind)
        {
            case SyntaxKind.AccessExpression:
            {
                const accessExpression = this.connectAccessExpression(statement, context);

                if (accessExpression.kind === SemanticKind.CallExpression)
                {
                    return accessExpression;
                }
                else
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Expression "${accessExpression.kind}" is not allowed as a statement.`,
                            Diagnostic.Codes.ExpressionNotAllowedAsStatementError,
                            statement.member.token
                        )
                    );
                }
                break;
            }
            case SyntaxKind.Assignment:
                return this.connectAssignment(statement, context);
            case SyntaxKind.CallExpression:
                return this.connectCallExpression(statement, context);
            case SyntaxKind.Section:
                return this.connectSection(statement, context);
            case SyntaxKind.LocalVariableDeclaration:
                return this.connectLocalVariableDeclaration(statement, context);
            case SyntaxKind.ReturnStatement:
                return this.connectReturnStatement(statement, context);
            case SyntaxKind.IfStatement:
                return this.connectIfStatement(statement, context);
            case SyntaxKind.WhileStatement:
                return this.connectWhileStatement(statement, context);
        }
    }

    private connectLocalVariableDeclaration (
        variableDeclaration: SyntaxNodes.LocalVariableDeclaration,
        context: FunctionContext
    ): SemanticNodes.LocalVariableDeclaration
    {
        const namespace = Namespace.constructFromNamespace(context.module.namespace, variableDeclaration.identifier.content);
        const initialisier = variableDeclaration.initialiser === null
            ? null
            : this.connectExpression(variableDeclaration.initialiser, context);
        let type: SemanticSymbols.TypeLike|null = this.connectTypeClause(variableDeclaration.type, context);

        if (type === null)
        {
            if (initialisier === null)
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `The variable "${namespace.baseName}" must either have a type clause or an initialiser.`,
                        Diagnostic.Codes.VariableWithoutTypeClauseAndInitialiserError,
                        variableDeclaration.identifier
                    )
                );
            }
            else
            {
                type = initialisier.type;
            }
        }

        const isReadonly = variableDeclaration.variableModifier === null;

        // TODO: Check if the type clause and the initialiser type match.


        if (this.getVariable(namespace.qualifiedName) !== null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Duplicate declaration of variable "${namespace.baseName}".`,
                    Diagnostic.Codes.DuplicateVariableDeclarationError,
                    variableDeclaration.identifier
                )
            );
        }

        const variable = new SemanticSymbols.Variable(namespace, type, isReadonly);

        this.pushVariable(variable);

        return new SemanticNodes.LocalVariableDeclaration(variable, initialisier);
    }

    private connectReturnStatement (
        returnStatement: SyntaxNodes.ReturnStatement,
        context: FunctionContext
    ): SemanticNodes.ReturnStatement
    {
        let expression: SemanticNodes.Expression|null = null;

        if (returnStatement.expression !== null)
        {
            expression = this.connectExpression(returnStatement.expression, context);
        }

        if (context.function.returnType.equals(BuildInTypes.noType))
        {
            if (expression !== null)
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        'A function without a return type must return nothing.',
                        Diagnostic.Codes.NotEmptyReturnInFunctionWithoutReturnTypeError,
                        returnStatement.keyword
                    )
                );
            }
        }
        else
        {
            if (expression === null)
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        'A function with a return type must not return nothing.',
                        Diagnostic.Codes.EmptyReturnInFunctionWithReturnTypeError,
                        returnStatement.keyword
                    )
                );
            }
            else if (!expression.type.equals(context.function.returnType))
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        'The return value type must match the function return type.',
                        Diagnostic.Codes.ReturnTypeDoesNotMatchFunctionReturnTypeError,
                        returnStatement.keyword
                    )
                );
            }
        }

        return new SemanticNodes.ReturnStatement(expression);
    }

    private connectIfStatement (ifStatement: SyntaxNodes.IfStatement, context: FunctionContext): SemanticNodes.IfStatement
    {
        const condition = this.connectExpression(ifStatement.condition, context);

        if (!condition.type.equals(BuildInTypes.boolean))
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    'The return type of the condition in an if statement must be Boolean.',
                    Diagnostic.Codes.UnexpectedNonBooleanExpressionInIfStatementError,
                    ifStatement.condition.token
                )
            );
        }

        const section = this.connectSection(ifStatement.section, context);
        let elseClause: SemanticNodes.ElseClause|null = null;

        if (ifStatement.elseClause !== null)
        {
            elseClause = this.connectElseClause(ifStatement.elseClause, context);
        }

        return new SemanticNodes.IfStatement(condition, section, elseClause);
    }

    private connectElseClause (elseClause: SyntaxNodes.ElseClause, context: FunctionContext): SemanticNodes.ElseClause
    {
        let followUp: SemanticNodes.Section|SemanticNodes.IfStatement;

        if (elseClause.followUp.kind == SyntaxKind.Section)
        {
            followUp = this.connectSection(elseClause.followUp, context);
        }
        else
        {
            followUp = this.connectIfStatement(elseClause.followUp, context);
        }

        return new SemanticNodes.ElseClause(followUp);
    }

    private connectWhileStatement (whileStatement: SyntaxNodes.WhileStatement, context: FunctionContext): SemanticNodes.WhileStatement
    {
        const condition = this.connectExpression(whileStatement.condition, context);

        if (!condition.type.equals(BuildInTypes.boolean))
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    'The return type of the condition in an while statement must be Boolean.',
                    Diagnostic.Codes.UnexpectedNonBooleanExpressionInWhileStatementError,
                    whileStatement.condition.token
                )
            );
        }

        const section = this.connectSection(whileStatement.section, context);

        return new SemanticNodes.WhileStatement(condition, section);
    }

    private connectAssignment (assignment: SyntaxNodes.Assignment, context: FunctionContext): SemanticNodes.Assignment
    {
        const namespace = Namespace.constructFromNamespace(context.module.namespace, assignment.identifier.content);

        let variableOrFieldExpression: SemanticNodes.FieldExpression|SemanticNodes.VariableExpression;

        const variable = this.getVariable(namespace.qualifiedName);

        if (variable !== null)
        {
            if (variable.kind == SemanticSymbolKind.FunctionParameter)
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Cannot assign to parameter "${namespace.baseName}"`,
                        Diagnostic.Codes.ParameterAssignmentError,
                        assignment.identifier
                    )
                );
            }

            if (variable.isReadonly)
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `"${namespace.baseName}" is readonly, an assignment is not allowed.`,
                        Diagnostic.Codes.ReadonlyAssignmentError,
                        assignment.identifier
                    )
                );
            }

            variableOrFieldExpression = new SemanticNodes.VariableExpression(variable);
        }
        else
        {
            const field = this.fields.get(namespace.qualifiedName);

            if (field !== undefined)
            {
                if (field.isReadonly)
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `"${namespace.baseName}" is readonly, an assignment is not allowed.`,
                            Diagnostic.Codes.ReadonlyAssignmentError,
                            assignment.identifier
                        )
                    );
                }

                if (context.function.thisReference === null)
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Cannot access field "${namespace.baseName}" inside a function. This is only possible inside methods.`,
                            Diagnostic.Codes.FieldAccessInsideFunctionError,
                            assignment.identifier
                        )
                    );
                }

                const thisExpression = new SemanticNodes.VariableExpression(context.function.thisReference);

                variableOrFieldExpression = new SemanticNodes.FieldExpression(field, thisExpression);
            }
            else
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Unknown variable "${namespace.baseName}"`,
                        Diagnostic.Codes.UnknownVariableError,
                        assignment.identifier
                    )
                );
            }
        }

        const expression = this.connectExpression(assignment.expression, context);

        return new SemanticNodes.Assignment(variableOrFieldExpression, expression);
    }

    private connectExpression (expression: SyntaxNodes.Expression, context: FunctionContext|ModuleContext): SemanticNodes.Expression
    {
        switch (expression.kind)
        {
            case SyntaxKind.AccessExpression:
                return this.connectAccessExpression(expression, context);
            case SyntaxKind.BinaryExpression:
                return this.connectBinaryExpression(expression, context);
            case SyntaxKind.BracketedExpression:
                return this.connectBracketedExpression(expression, context);
            case SyntaxKind.CallExpression:
                return this.connectCallExpression(expression, context);
            case SyntaxKind.InstantiationExpression:
                return this.connectInstantiationExpression(expression, context);
            case SyntaxKind.LiteralExpression:
                return this.connectLiteralExpression(expression);
            case SyntaxKind.UnaryExpression:
                return this.connectUnaryExpression(expression, context);
            case SyntaxKind.IdentifierExpression:
                return this.connectIdentifierExpression(expression, context);
        }
    }

    private connectLiteralExpression (expression: SyntaxNodes.LiteralExpression): SemanticNodes.LiteralExpression
    {
        const value = expression.literal.content;
        const type = BuildInTypes.getTypeByTokenKind(expression.literal.kind);

        if (type === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Unexpected literal "${expression.literal.content}" of type "${expression.kind}".`,
                    Diagnostic.Codes.UnexpectedLiteralExpressionSyntaxKindError,
                    expression.literal
                )
            );
        }
        else if (type.kind === SemanticSymbolKind.GenericType)
        {
            throw new Error('Connector error: Generic literals, how should that work?');
        }

        return new SemanticNodes.LiteralExpression(value, type);
    }

    private connectInstantiationExpression (
        expression: SyntaxNodes.InstantiationExpression,
        context: FunctionContext|ModuleContext
    ): SemanticNodes.InstantiationExpression
    {
        const type = this.connectType(expression.type, context);

        const elements: SemanticNodes.Expression[] = [];
        for (const element of expression.arguments.elements)
        {
            const connectedExpression = this.connectExpression(element, context);
            elements.push(connectedExpression);

            // TODO: As soon as there is a constructor, we must check the arguments' types here.
        }

        return new SemanticNodes.InstantiationExpression(type, elements);
    }

    private connectIdentifierExpression (
        expression: SyntaxNodes.IdentifierExpression,
        context: FunctionContext|ModuleContext
    ): SemanticNodes.VariableExpression|SemanticNodes.FieldExpression|SemanticNodes.ModuleExpression
    {
        const namespace = Namespace.constructFromNamespace(context.module.namespace, expression.identifier.content);

        const variableExpression = this.tryConnectIdentifierAsVariableExpression(namespace);

        if (variableExpression !== null)
        {
            return variableExpression;
        }
        else
        {
            const fieldExpression = this.tryConnectIdentifierAsFieldExpression(expression, namespace, context);

            if (fieldExpression !== null)
            {
                return fieldExpression;
            }
            else
            {
                const moduleExpression = this.tryConnectIdentifierAsModuleExpression(expression);

                if (moduleExpression !== null)
                {
                    return moduleExpression;
                }
                else
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Unknown identifier "${namespace.baseName}"`,
                            Diagnostic.Codes.UnknownIdentifierError,
                            expression.identifier
                        )
                    );
                }
            }
        }
    }

    private tryConnectIdentifierAsVariableExpression (namespace: Namespace): SemanticNodes.VariableExpression|null
    {
        const variable = this.getVariable(namespace.qualifiedName);

        if (variable !== null)
        {
            return new SemanticNodes.VariableExpression(variable);
        }
        else
        {
            return null;
        }
    }

    private tryConnectIdentifierAsFieldExpression (
        expression: SyntaxNodes.IdentifierExpression,
        namespace: Namespace,
        context: FunctionContext|ModuleContext
    ): SemanticNodes.FieldExpression|null
    {
        const field = this.fields.get(namespace.qualifiedName);

        if (field !== undefined)
        {
            if (!('function' in context)) // TODO: This is ugly and unsafe Typescript magic.
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Cannot access field "${namespace.baseName}" outside of a method.`,
                        Diagnostic.Codes.FieldAccessOutsideMethodError,
                        expression.identifier
                    )
                );
            }
            else if (context.function.thisReference === null)
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Cannot access field "${namespace.baseName}" inside a function. This is only possible inside methods.`,
                        Diagnostic.Codes.FieldAccessInsideFunctionError,
                        expression.identifier
                    )
                );
            }

            const thisExpression = new SemanticNodes.VariableExpression(context.function.thisReference);

            return new SemanticNodes.FieldExpression(field, thisExpression);
        }
        else
        {
            return null;
        }
    }

    private tryConnectIdentifierAsModuleExpression (expression: SyntaxNodes.IdentifierExpression): SemanticNodes.ModuleExpression|null
    {
        const importedFile = this.importedFiles.get(expression.identifier.content);

        if (importedFile !== undefined)
        {
            return new SemanticNodes.ModuleExpression(importedFile.module);
        }

        return null;
    }

    private connectCallExpression (
        expression: SyntaxNodes.CallExpression,
        context: FunctionContext|ModuleContext,
        inModule: SemanticSymbols.Module|null = null,
        thisReference: SemanticNodes.Expression|null = null
    ): SemanticNodes.CallExpression
    {
        const thisModule = inModule ?? context.module;

        const namespace = Namespace.constructFromNamespace(thisModule.namespace, expression.identifier.content);

        const functionSymbol = thisModule.functionNameToSymbol.get(namespace.qualifiedName);
        if (functionSymbol === undefined)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Unknown function "${namespace.baseName}"`,
                    Diagnostic.Codes.UnknownFunctionError,
                    expression.identifier
                )
            );
        }

        const callArguments: SemanticNodes.Expression[] = [];

        for (const argumentExpression of expression.arguments.elements)
        {
            const callArgument = this.connectExpression(argumentExpression, context);
            callArguments.push(callArgument);
        }

        if (functionSymbol.parameters.length !== callArguments.length)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Wrong argument count for function "${namespace.baseName}"`,
                    Diagnostic.Codes.WrongArgumentCountError,
                    expression.identifier
                )
            );
        }

        for (let i = 0; i < callArguments.length; i++)
        {
            if (!callArguments[i].type.equals(functionSymbol.parameters[i].type))
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Wrong type for argument "${functionSymbol.parameters[i].namespace.baseName}".`,
                        Diagnostic.Codes.WrongArgumentTypeError,
                        expression.identifier
                    )
                );
            }
        }

        // TODO: This let-if construct needs to be improved now that thisReference is an expression and not a symbol.
        let thisExpression: SemanticNodes.Expression|null = null;
        if (thisReference !== null)
        {
            thisExpression = thisReference;
        }
        else
        {
            // TODO: This if-construct should be improved. It is a bit ugly and could be incorrect.

            if (functionSymbol.thisReference !== null)
            {
                if (!('function' in context)) // TODO: This is ugly and unsafe Typescript magic.
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Cannot access a method "${namespace.baseName}" outside of another method.`,
                            Diagnostic.Codes.MethodAccessOutsideMethodError,
                            expression.identifier
                        )
                    );
                }
                else if (context.function.thisReference === null)
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Cannot access a method "${namespace.baseName}" inside a function. This is only possible inside other methods.`,
                            Diagnostic.Codes.MethodAccessInsideFunctionError,
                            expression.identifier
                        )
                    );
                }

                thisExpression = new SemanticNodes.VariableExpression(context.function.thisReference);
            }
        }

        return new SemanticNodes.CallExpression(functionSymbol, callArguments, thisExpression);
    }

    private connectAccessExpression (
        expression: SyntaxNodes.AccessExpression,
        context: ModuleContext
    ): SemanticNodes.CallExpression|SemanticNodes.FieldExpression|SemanticNodes.VariableExpression
    {
        const primaryExpression = this.connectExpression(expression.primaryExpression, context);

        if (primaryExpression.kind == SemanticKind.ModuleExpression)
        {
            // TODO: This is the only place where ModulExpressions are valid. We need to prevent them from being used elsewhere.

            return this.connectModuleAccessExpression(expression, primaryExpression, context);
        }
        else
        {
            return this.connectObjectAccessExpression(expression, primaryExpression, context);
        }
    }

    private connectModuleAccessExpression (
        expression: SyntaxNodes.AccessExpression,
        primaryExpression: SemanticNodes.ModuleExpression,
        context: ModuleContext
    ): SemanticNodes.CallExpression|SemanticNodes.VariableExpression
    {
        const memberNamespace = Namespace.constructFromNamespace(
            primaryExpression.module.namespace,
            expression.member.identifier.content
        );

        if (expression.member.kind == SyntaxKind.CallExpression)
        {
            // Function call

            const functionSymbol = primaryExpression.module.functionNameToSymbol.get(memberNamespace.qualifiedName);

            if (functionSymbol !== undefined)
            {
                if (functionSymbol.thisReference === null)
                {
                    const callExpression = this.connectCallExpression(expression.member, context, primaryExpression.module);
                    return callExpression;
                }
                else
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Cannot access method "${expression.member.identifier.content}" by module name.`
                                + ` A class instance is needed.`,
                            Diagnostic.Codes.MethodAccessByModuleNameError,
                            expression.member.identifier
                        )
                    );

                }
            }
            else
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Unknown function "${expression.member.identifier.content}" in module`
                            + ` "${primaryExpression.module.namespace.moduleName}"`,
                        Diagnostic.Codes.UnknownFunctionError,
                        expression.member.identifier
                    )
                );
            }
        }
        else
        {
            // Variable access

            const variable = primaryExpression.module.variableNameToSymbol.get(memberNamespace.qualifiedName);

            if (variable === undefined)
            {
                const field = primaryExpression.module.fieldNameToSymbol.get(memberNamespace.qualifiedName);
                if (field !== undefined)
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Cannot access field "${expression.member.identifier.content}" by module name.`
                                + ` A class instance is needed.`,
                            Diagnostic.Codes.FieldAccessByModuleNameError,
                            expression.member.identifier
                        )
                    );
                }
                else
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Unknown variable "${expression.member.identifier.content}" in module`
                                + ` "${primaryExpression.module.namespace.moduleName}"`,
                            Diagnostic.Codes.UnknownVariableError,
                            expression.member.identifier
                        )
                    );
                }
            }

            return new SemanticNodes.VariableExpression(variable);
        }
    }

    private connectObjectAccessExpression (
        expression: SyntaxNodes.AccessExpression,
        primaryExpression: SemanticNodes.Expression,
        context: ModuleContext
    ): SemanticNodes.CallExpression|SemanticNodes.FieldExpression|SemanticNodes.VariableExpression
    {
        const importedFile = this.importedFiles.get(primaryExpression.type.namespace.baseName);
        // TODO: Should we look for the class type by symbols instead of the module name here?
        if (importedFile === undefined)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Cannot access object of type "${primaryExpression.type.namespace.baseName}" because it has no module.`,
                    Diagnostic.Codes.AccessOfObjectOfTypeWithUnknownModuleError,
                    expression.dot
                )
            );
        }
        const module = importedFile.module;

        const memberNamespace = Namespace.constructFromNamespace(
            module.namespace,
            expression.member.identifier.content
        );

        if (expression.member.kind == SyntaxKind.CallExpression)
        {
            // Function call
            return this.connectCallExpression(expression.member, context, module, primaryExpression);
        }
        else
        {
            // Variable/field access

            const field = module.fieldNameToSymbol.get(memberNamespace.qualifiedName);

            if (field !== undefined)
            {
                return new SemanticNodes.FieldExpression(field, primaryExpression);
            }
            else
            {
                const variable = module.variableNameToSymbol.get(memberNamespace.qualifiedName);

                if (variable !== undefined)
                {
                    return new SemanticNodes.VariableExpression(variable);
                }
                else
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Unknown identifier "${expression.member.identifier.content}" in object of type`
                            + ` "${module.namespace.baseName}"`,
                            Diagnostic.Codes.UnknownIdentifierInObjectAccessError,
                            expression.member.identifier
                        )
                    );
                }
            }
        }
    }

    private connectBracketedExpression (expression: SyntaxNodes.BracketedExpression, context: ModuleContext): SemanticNodes.Expression
    {
        return this.connectExpression(expression.expression, context);
    }

    private connectUnaryExpression (expression: SyntaxNodes.UnaryExpression, context: ModuleContext): SemanticNodes.UnaryExpression
    {
        const operand = this.connectExpression(expression.operand, context);

        const operator = BuildInOperators.getUnaryOperator(expression.operator.kind, operand.type);

        if (operator === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Unknown unary operator "${expression.operator.content}"`,
                    Diagnostic.Codes.UnknownUnaryOperatorError,
                    expression.operator
                )
            );
        }

        return new SemanticNodes.UnaryExpression(operator, operand);
    }

    private connectBinaryExpression (expression: SyntaxNodes.BinaryExpression, context: ModuleContext): SemanticNodes.BinaryExpression
    {
        const leftOperand = this.connectExpression(expression.leftSide, context);
        const rightOperand = this.connectExpression(expression.rightSide, context);

        const operator = BuildInOperators.getBinaryOperator(expression.operator.kind, leftOperand.type, rightOperand.type);

        if (operator === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Unknown binary operator "${expression.operator.content}" for "${leftOperand.type.namespace.baseName}"`
                    + ` with "${rightOperand.type.namespace.baseName}"`,
                    Diagnostic.Codes.UnknownBinaryOperatorError,
                    expression.operator
                )
            );
        }

        return new SemanticNodes.BinaryExpression(operator, leftOperand, rightOperand);
    }
}
