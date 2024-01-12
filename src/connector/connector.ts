import * as Diagnostic from '../diagnostic';
import * as SemanticNodes from './semanticNodes';
import * as SemanticSymbols from './semanticSymbols';
import * as SyntaxNodes from '../parser/syntaxNodes';
import { FunctionContext, ModuleContext } from './connectorContext';
import { BuildInOperators } from '../definitions/buildInOperators';
import { BuildInTypes } from '../definitions/buildInTypes';
import { ElementsList } from '../parser/elementsList';
import { Namespace } from '../parser/namespace';
import { SemanticSymbolKind } from './semanticSymbolKind';
import { SyntaxKind } from '../parser/syntaxKind';

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
        this.functions = new Map();
        this.variableStacks = [this.variables];
    }

    public run (fileSyntaxNode: SyntaxNodes.File, qualifiedNameToFile: Map<string, SemanticNodes.File>): SemanticNodes.File
    {
        this.importedFiles.clear();
        this.variables.clear();
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

        // Function declarations:
        for (const functionDeclaration of file.functions)
        {
            this.preconnectFunctionDeclaration(functionDeclaration, file.module.namespace);
        }

        // Global variables declarations:
        for (const variableNode of file.variables)
        {
            this.preconnectGlobalVariableDeclaration(variableNode, file.module.namespace);
        }

        // Field declarations:
        for (const fieldNode of file.fields)
        {
            this.preconnectFieldVariableDeclaration(fieldNode, file.module.namespace);
        }

        // Module:
        const moduleSymbol = this.connectModule(file.module);
        const moduleContext: ModuleContext = {
            module: moduleSymbol
        };

        // Global variables:
        const variableDeclarations: SemanticNodes.GlobalVariableDeclaration[] = [];
        for (const variableNode of file.variables)
        {
            const variableDeclaration = this.connectGlobalVariableDeclaration(variableNode, moduleContext);
            variableDeclarations.push(variableDeclaration);
        }

        // Fields:
        const fieldDeclarations: SemanticNodes.FieldDeclaration[] = [];
        for (const fieldNode of file.fields)
        {
            const fieldDeclaration = this.connectFieldVariableDeclaration(fieldNode, moduleContext);
            fieldDeclarations.push(fieldDeclaration);
        }

        // Function bodies:
        const functionDeclarations: SemanticNodes.FunctionDeclaration[] = [];
        for (const functionNode of file.functions)
        {
            const functionDeclaration = this.connectFunctionDeclaration(functionNode, moduleContext);
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

    private connectModule (module: SyntaxNodes.Module): SemanticSymbols.Module
    {
        let classType: SemanticSymbols.GenericType|null = null;
        if (module.isClass)
        {
            classType = new SemanticSymbols.GenericType(module.namespace, []); // TODO: Implement generic classes.
        }

        const variableNameToSymbol = new Map(this.variables);
        const functionNameToSymbol = new Map(this.functions);

        const isEntryPoint = module.isEntryPoint;

        return new SemanticSymbols.Module(
            module.namespace,
            classType,
            variableNameToSymbol,
            functionNameToSymbol,
            isEntryPoint
        );
    }

    private preconnectFunctionDeclaration (functionDeclaration: SyntaxNodes.FunctionDeclaration, moduleNamespace: Namespace): void
    {
        const namespace = Namespace.constructFromNamespace(moduleNamespace, functionDeclaration.identifier.content);
        const returnType = this.connectTypeClause(functionDeclaration.type) ?? BuildInTypes.noType;
        const parameters = this.connectParameters(functionDeclaration.parameters, moduleNamespace);
        const isMethod = functionDeclaration.isMethod;
        const isHeader = functionDeclaration.isHeader;

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

        const functionSymbol = new SemanticSymbols.Function(namespace, returnType, parameters, isMethod, isHeader);

        this.functions.set(namespace.qualifiedName, functionSymbol);
    }

    private connectTypeClause (typeClause: SyntaxNodes.TypeClause|null): SemanticSymbols.ConcreteType|null
    {
        if (typeClause === null)
        {
            return null;
        }
        else
        {
            return this.connectType(typeClause.type);
        }
    }

    private connectType (typeSyntaxNode: SyntaxNodes.Type): SemanticSymbols.ConcreteType
    {
        const typeName = typeSyntaxNode.identifier.content;

        let type = BuildInTypes.getTypeByName(typeName);

        if (type === null)
        {
            const importedClass = this.importedFiles.get(typeName);
            type = importedClass?.module.classType ?? null;

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

        if (type.kind === SemanticSymbolKind.ConcreteType)
        {
            return type;
        }

        const genericType = type;
        // TODO: Check if it really a SemanticSymbolKind.GenericType here.

        if (genericType.parameters.length !== typeSyntaxNode.arguments.elements.length)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Wrong argument count for generic type "${genericType.namespace.baseName}"`,
                    Diagnostic.Codes.WrongGenericArgumentCountError,
                    typeSyntaxNode.identifier
                )
            );
        }

        const concreteArguments: SemanticSymbols.ConcreteParameter[] = [];
        for (let i = 0; i < genericType.parameters.length; i++)
        {
            const argument = typeSyntaxNode.arguments.elements[i];

            if (genericType.parameters[i].isLiteral)
            {
                if (argument.kind != SyntaxKind.LiteralExpression)
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Generic argument "${genericType.parameters[i].namespace.baseName}" must be a literal.`,
                            Diagnostic.Codes.GenericArgumentMustBeLiteralError,
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

                const literalConcreteParameter = new SemanticSymbols.LiteralConcreteParameter(
                    genericType.parameters[i].namespace,
                    argument.literal.content,
                    literalType
                );
                concreteArguments.push(literalConcreteParameter);
            }
            else
            {
                if (argument.kind != SyntaxKind.Type)
                {
                    this.diagnostic.throw(
                        new Diagnostic.Error(
                            `Generic argument "${genericType.parameters[i].namespace.baseName}" must be a type.`,
                            Diagnostic.Codes.GenericArgumentMustBeTypeError,
                            typeSyntaxNode.identifier // TODO: Would be better to have the token of the parameter here.
                        )
                    );
                }

                const typeArgumentType = this.connectType(argument);
                const typeConcreteParameter = new SemanticSymbols.TypeConcreteParameter(
                    genericType.parameters[i].namespace,
                    typeArgumentType
                );
                concreteArguments.push(typeConcreteParameter);
            }
        }

        return new SemanticSymbols.ConcreteType(genericType.namespace, concreteArguments);
    }

    private connectParameters (
        parameters: ElementsList<SyntaxNodes.FunctionParameter>,
        moduleNamespace: Namespace
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

            const type = this.connectTypeClause(parameter.type);

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
        moduleNamespace: Namespace
    ): void
    {
        const namespace = Namespace.constructFromNamespace(moduleNamespace, variableDeclaration.identifier.content);

        const type = this.connectTypeClause(variableDeclaration.type);
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
        moduleNamespace: Namespace
    ): void
    {
        const namespace = Namespace.constructFromNamespace(moduleNamespace, fieldDeclaration.identifier.content);

        const type = this.connectTypeClause(fieldDeclaration.type);
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

        const field = new SemanticSymbols.Field(namespace, type, isReadonly);

        if (this.getVariable(namespace.qualifiedName) !== null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Duplicate declaration of field "${namespace.baseName}".`,
                    // TODO: This would also produce an error if a variable shares the name with a field, which should be reported as such.
                    Diagnostic.Codes.DuplicateVariableDeclarationError,
                    fieldDeclaration.identifier
                )
            );
        }

        this.pushVariable(field); // FIXME: Is doing this here correct? Where should the field be added to?
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

        const field = this.getVariable(namespace.qualifiedName);
        if (field === null)
        {
            throw new Error('Connector error: Field symbol not found.');
        }
        else if (field.kind !== SemanticSymbolKind.Field)
        {
            throw new Error('Connector error: Field symbol is not a field.');
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

        if (functionSymbol.isMethod && (context.module.classType === null))
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
            module: context.module,
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
                return this.connectAccessExpression(statement, context);
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
        context: ModuleContext
    ): SemanticNodes.LocalVariableDeclaration
    {
        const namespace = Namespace.constructFromNamespace(context.module.namespace, variableDeclaration.identifier.content);
        const initialisier = variableDeclaration.initialiser === null
            ? null
            : this.connectExpression(variableDeclaration.initialiser, context);
        let type = this.connectTypeClause(variableDeclaration.type);

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

        if (!condition.type.equals(BuildInTypes.bool))
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    'The return type of the condition in an if statement must be Bool.',
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

        if (!condition.type.equals(BuildInTypes.bool))
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    'The return type of the condition in an while statement must be Bool.',
                    Diagnostic.Codes.UnexpectedNonBooleanExpressionInWhileStatementError,
                    whileStatement.condition.token
                )
            );
        }

        const section = this.connectSection(whileStatement.section, context);

        return new SemanticNodes.WhileStatement(condition, section);
    }

    private connectAssignment (assignment: SyntaxNodes.Assignment, context: ModuleContext): SemanticNodes.Assignment
    {
        const namespace = Namespace.constructFromNamespace(context.module.namespace, assignment.identifier.content);

        const variable = this.getVariable(namespace.qualifiedName);

        if (variable === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Unknown variable "${namespace.baseName}"`,
                    Diagnostic.Codes.UnknownVariableError,
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

        const expression = this.connectExpression(assignment.expression, context);

        return new SemanticNodes.Assignment(variable, expression);
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
            case SyntaxKind.VariableExpression:
                return this.connectVariableExpression(expression, context);
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

        return new SemanticNodes.LiteralExpression(value, type);
    }

    private connectInstantiationExpression (
        expression: SyntaxNodes.InstantiationExpression,
        context: ModuleContext
    ): SemanticNodes.InstantiationExpression
    {
        const type = this.connectType(expression.type);

        const elements: SemanticNodes.Expression[] = [];
        for (const element of expression.arguments.elements)
        {
            const connectedExpression = this.connectExpression(element, context);
            elements.push(connectedExpression);

            // TODO: As soon as there is a constructor, we must check the arguments' types here.
        }

        return new SemanticNodes.InstantiationExpression(type, elements);
    }

    private connectVariableExpression (
        expression: SyntaxNodes.VariableExpression,
        context: FunctionContext|ModuleContext
    ): SemanticNodes.VariableExpression
    {
        const namespace = Namespace.constructFromNamespace(context.module.namespace, expression.identifier.content);
        const variable = this.getVariable(namespace.qualifiedName);

        if (variable === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Unknown variable "${namespace.baseName}"`,
                    Diagnostic.Codes.UnknownVariableError,
                    expression.identifier
                )
            );
        }

        if (variable.kind == SemanticSymbolKind.Field)
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
            else if (!context.function.isMethod)
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Cannot access field "${namespace.baseName}" inside a function. This is only possible inside methods.`,
                        Diagnostic.Codes.FieldAccessInsideFunctionError,
                        expression.identifier
                    )
                );
            }
        }

        return new SemanticNodes.VariableExpression(variable);
    }

    private connectCallExpression (
        expression: SyntaxNodes.CallExpression,
        context: ModuleContext,
        inModule: SemanticSymbols.Module|null = null,
        thisReference: SemanticSymbols.VariableLike|null = null
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

        let thisExpression: SemanticNodes.VariableExpression|null = null;
        if (thisReference !== null)
        {
            thisExpression = new SemanticNodes.VariableExpression(thisReference);
        }

        return new SemanticNodes.CallExpression(functionSymbol, thisModule, callArguments, thisExpression);
    }

    private connectAccessExpression (
        expression: SyntaxNodes.AccessExpression,
        context: ModuleContext
    ): SemanticNodes.CallExpression
    {
        const namespace = Namespace.constructFromNamespace(context.module.namespace, expression.identifier.content);

        const foundVariable = this.getVariable(namespace.qualifiedName);

        if (foundVariable === null)
        {
            return this.connectModuleAccessExpression(expression, context);
        }
        else
        {
            return this.connectObjectAccessExpression(expression, context, foundVariable);
        }
    }

    private connectModuleAccessExpression (expression: SyntaxNodes.AccessExpression, context: ModuleContext): SemanticNodes.CallExpression
    {
        const importedFile = this.importedFiles.get(expression.identifier.content);

        if (importedFile === undefined)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Unknown module "${expression.identifier.content}"`,
                    Diagnostic.Codes.UnknownModuleError,
                    expression.identifier
                )
            );
        }
        else
        {
            const calledFunctionNamespace = Namespace.constructFromNamespace(
                importedFile.module.namespace,
                expression.functionCall.identifier.content
            );

            if (!importedFile.module.functionNameToSymbol.has(calledFunctionNamespace.qualifiedName))
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Unknown function "${calledFunctionNamespace.baseName}" in module "${importedFile.module.namespace.moduleName}"`,
                        Diagnostic.Codes.UnknownFunctionError,
                        expression.functionCall.identifier
                    )
                );
            }
            else
            {
                return this.connectCallExpression(expression.functionCall, context, importedFile.module);
            }
        }
    }

    private connectObjectAccessExpression (
        expression: SyntaxNodes.AccessExpression,
        context: ModuleContext,
        objectToAccess?: SemanticSymbols.VariableLike
    ): SemanticNodes.CallExpression
    {
        const namespace = Namespace.constructFromNamespace(context.module.namespace, expression.identifier.content);

        const objectVariable = objectToAccess ?? this.getVariable(namespace.qualifiedName);
        if (objectVariable === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Unknown variable "${namespace.baseName}"`,
                    Diagnostic.Codes.UnknownVariableError,
                    expression.identifier
                )
            );
        }

        const importedFile = this.importedFiles.get(objectVariable.type.namespace.baseName);
        // TODO: Should we look for the class type by symbols instead of the module name here?
        if (importedFile === undefined)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Cannot access "${namespace.baseName}" of unkown type "${objectVariable.type.namespace.baseName}"`,
                    Diagnostic.Codes.AccessOfUnknownTypeError,
                    expression.identifier
                )
            );
        }

        return this.connectCallExpression(expression.functionCall, context, importedFile.module, objectVariable);
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
