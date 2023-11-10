import * as Diagnostic from '../diagnostic';
import * as SemanticNodes from './semanticNodes';
import * as SemanticSymbols from './semanticSymbols';
import * as SyntaxNodes from '../parser/syntaxNodes';
import { BuildInOperators } from '../definitions/buildInOperators';
import { BuildInTypes } from '../definitions/buildInTypes';
import { FunctionParametersList } from '../parser/lists/functionParametersList';
import { SemanticNode } from './semanticNodes';
import { SyntaxKind } from '../parser/syntaxKind';
import { SyntaxNode } from '../parser/syntaxNodes';

export class Connector
{
    private readonly diagnostic: Diagnostic.Diagnostic;

    /**
     * A map of files (by their local module name).
     * This is filled with already connected files that are imported in the current one.
     */
    private importedFiles: Map<string, SemanticNodes.File>;
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
    private variableStacks: Map<string, SemanticSymbols.Variable>[];

    private currentModule: SemanticSymbols.Module|null;
    private currentFunction: SemanticSymbols.Function|null;

    constructor (diagnostic: Diagnostic.Diagnostic)
    {
        this.diagnostic = diagnostic;

        this.importedFiles = new Map();
        this.functions = new Map();
        this.variableStacks = [];
        this.currentModule = null;
        this.currentFunction = null;
    }

    public run (fileSyntaxNode: SyntaxNodes.File, qualifiedNameToFile: Map<string, SemanticNodes.File>): SemanticNodes.File
    {
        this.importedFiles.clear();
        this.functions.clear();
        this.variableStacks = [];
        this.currentModule = null;
        this.currentFunction = null;

        const result = this.connectFile(fileSyntaxNode, qualifiedNameToFile);

        return result;
    }

    private pushVariable (variable: SemanticSymbols.Variable): void
    {
        const currentVariableStack = this.variableStacks[this.variableStacks.length - 1];

        currentVariableStack.set(variable.name, variable);
    }

    private getVariable (name: string): SemanticSymbols.Variable|null
    {
        for (const variableStack of this.variableStacks)
        {
            for (const variable of variableStack.values())
            {
                if (variable.name == name)
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

            const duplicateFile = this.importedFiles.get(importSyntaxNode.namespace.name);

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
                            `Name conflict for import of "${duplicateFile.module.qualifiedName}" and `
                                + `"${importedFile.module.qualifiedName}". Use "as" to rename one of them.`,
                            Diagnostic.Codes.ImportNameConflictError,
                            importSyntaxNode.keyword
                        )
                    );
                }
            }
            else
            {
                this.importedFiles.set(importSyntaxNode.namespace.name, importedFile);

                importedModules.push(importedFile.module);
            }
        }

        // Function declarations:
        for (const functionDeclaration of file.functions)
        {
            const functionSymbol = this.connectFunctionDeclaration(functionDeclaration);

            this.functions.set(functionSymbol.name, functionSymbol);
        }

        // Module:
        const moduleSymbol = this.connectModule(file.module);
        this.currentModule = moduleSymbol;

        // Function bodies:
        const functionNodes: SemanticNodes.FunctionDeclaration[] = [];
        for (const functionDeclaration of file.functions)
        {
            const functionNode = this.connectFunction(functionDeclaration);

            functionNodes.push(functionNode);
        }

        this.currentModule = null;

        return new SemanticNodes.File(file.fileName, moduleSymbol, importedModules, functionNodes);
    }

    private connectModule (module: SyntaxNodes.Module): SemanticSymbols.Module
    {
        const name = module.namespace.name;
        const pathName = module.namespace.pathName;
        const qualifiedName = module.namespace.qualifiedName;

        const functionsNameToSymbol = new Map(this.functions);

        const isEntryPoint = module.isEntryPoint;

        return new SemanticSymbols.Module(name, pathName, qualifiedName, functionsNameToSymbol, isEntryPoint);
    }

    private connectFunctionDeclaration (functionDeclaration: SyntaxNodes.FunctionDeclaration): SemanticSymbols.Function
    {
        const name = functionDeclaration.identifier.content;
        const returnType = this.connectType(functionDeclaration.type) ?? BuildInTypes.noType;
        const parameters = this.connectParameters(functionDeclaration.parameters);
        const isHeader = functionDeclaration.isHeader;

        return new SemanticSymbols.Function(name, returnType, parameters, isHeader);
    }

    private connectType (typeClause: SyntaxNodes.TypeClause|null): SemanticSymbols.Type|null
    {
        if (typeClause === null)
        {
            return null;
        }
        else
        {
            const type = BuildInTypes.getTypeByName(typeClause.identifier.content);

            if (type === null)
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Unknown type "${typeClause.identifier.content}"`,
                        Diagnostic.Codes.UnknownTypeError,
                        typeClause.identifier
                    )
                );
            }

            return type;
        }
    }

    private connectParameters (parameters: FunctionParametersList): SemanticSymbols.Parameter[]
    {
        const parameterSymbols: SemanticSymbols.Parameter[] = [];

        const names = new Set<string>();

        for (const parameter of parameters.parameters)
        {
            const name = parameter.identifier.content;

            if (names.has(name))
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Duplicate parameter name "${name}"`,
                        Diagnostic.Codes.DuplicateParameterNameError,
                        parameter.identifier
                    )
                );
            }

            names.add(name);

            const type = this.connectType(parameter.type);

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

            const parameterSymbol = new SemanticSymbols.Parameter(name, type);

            parameterSymbols.push(parameterSymbol);
        }

        return parameterSymbols;
    }

    private connectFunction (functionDeclaration: SyntaxNodes.FunctionDeclaration): SemanticNodes.FunctionDeclaration
    {
        const functionSymbol = this.functions.get(functionDeclaration.identifier.content) as SemanticSymbols.Function;
        // The function symbol must exist because we added it previously based on the same function declarations.

        this.currentFunction = functionSymbol;

        // Push a new list of variables to the variable stack:
        const variables = new Map<string, SemanticSymbols.Variable>();
        this.variableStacks.push(variables);

        // Push all parameters to the variable stack:
        for (const parameter of functionSymbol.parameters)
        {
            this.pushVariable(parameter);
        }

        let section: SemanticNodes.Section|null = null;
        if (functionDeclaration.body !== null)
        {
            section = this.connectSection(functionDeclaration.body);
        }

        // Remove the list of variables from the variable stack:
        this.variableStacks.pop();

        this.currentFunction = null;

        return new SemanticNodes.FunctionDeclaration(functionSymbol, section);
    }

    private connectSection (sectionSyntaxNode: SyntaxNodes.Section): SemanticNodes.Section
    {
        const statementNodes: SemanticNode[] = [];

        // Push a new list of variables to the variable stack:
        const variables = new Map<string, SemanticSymbols.Variable>();
        this.variableStacks.push(variables);

        for (const statement of sectionSyntaxNode.statements)
        {
            const statementNode = this.connectStatement(statement);

            statementNodes.push(statementNode);
        }

        // Remove the list of variables from the variable stack:
        this.variableStacks.pop();

        return new SemanticNodes.Section(statementNodes);
    }

    private connectStatement (statement: SyntaxNode): SemanticNode
    {
        switch (statement.kind)
        {
            case SyntaxKind.Section:
                return this.connectSection(statement as SyntaxNodes.Section);
            case SyntaxKind.VariableDeclaration:
                return this.connectVariableDeclaration(statement as SyntaxNodes.VariableDeclaration);
            case SyntaxKind.ReturnStatement:
                return this.connectReturnStatement(statement as SyntaxNodes.ReturnStatement);
            case SyntaxKind.IfStatement:
                return this.connectIfStatement(statement as SyntaxNodes.IfStatement);
            case SyntaxKind.WhileStatement:
                return this.connectWhileStatement(statement as SyntaxNodes.WhileStatement);
            case SyntaxKind.Assignment:
                return this.connectAssignment(statement as SyntaxNodes.Assignment);
            default:
                return this.connectExpression(statement as SyntaxNodes.Expression);
        }
    }

    private connectVariableDeclaration (variableDeclaration: SyntaxNodes.VariableDeclaration): SemanticNodes.VariableDeclaration
    {
        const name = variableDeclaration.identifier.content;
        const initialisier = variableDeclaration.initialiser === null ? null : this.connectExpression(variableDeclaration.initialiser);
        let type = this.connectType(variableDeclaration.type);

        if (type === null)
        {
            if (initialisier === null)
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `The variable "${name}" must either have a type clause or an initialiser.`,
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

        const variable = new SemanticSymbols.Variable(name, type, false);

        if (this.getVariable(name) !== null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Duplicate declaration of variable "${name}".`,
                    Diagnostic.Codes.DuplicateVariableDeclarationError,
                    variableDeclaration.identifier
                )
            );
        }

        this.pushVariable(variable);

        return new SemanticNodes.VariableDeclaration(variable, initialisier);
    }

    private connectReturnStatement (returnStatement: SyntaxNodes.ReturnStatement): SemanticNodes.ReturnStatement
    {
        if (this.currentFunction === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    'Return statements must be placed inside a function body.',
                    Diagnostic.Codes.ReturnStatementOutsideFunctionBodyError,
                    returnStatement.keyword
                )
            );
        }

        let expression: SemanticNodes.Expression|null = null;

        if (returnStatement.expression !== null)
        {
            expression = this.connectExpression(returnStatement.expression);
        }

        if (this.currentFunction.returnType.equals(BuildInTypes.noType))
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
            else if (!expression.type.equals(this.currentFunction.returnType))
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

    private connectIfStatement (ifStatement: SyntaxNodes.IfStatement): SemanticNodes.IfStatement
    {
        const condition = this.connectExpression(ifStatement.condition);

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

        const section = this.connectSection(ifStatement.section);
        let elseClause: SemanticNodes.ElseClause|null = null;

        if (ifStatement.elseClause !== null)
        {
            elseClause = this.connectElseClause(ifStatement.elseClause);
        }

        return new SemanticNodes.IfStatement(condition, section, elseClause);
    }

    private connectElseClause (elseClause: SyntaxNodes.ElseClause): SemanticNodes.ElseClause
    {
        let followUp: SemanticNodes.Section|SemanticNodes.IfStatement;

        if (elseClause.followUp.kind == SyntaxKind.Section)
        {
            followUp = this.connectSection(elseClause.followUp as SyntaxNodes.Section);
        }
        else
        {
            followUp = this.connectIfStatement(elseClause.followUp as SyntaxNodes.IfStatement);
        }

        return new SemanticNodes.ElseClause(followUp);
    }

    private connectWhileStatement (whileStatement: SyntaxNodes.WhileStatement): SemanticNodes.WhileStatement
    {
        const condition = this.connectExpression(whileStatement.condition);

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

        const section = this.connectSection(whileStatement.section);

        return new SemanticNodes.WhileStatement(condition, section);
    }

    private connectAssignment (assignment: SyntaxNodes.Assignment): SemanticNodes.Assignment
    {
        const name = assignment.identifier.content;

        const variable = this.getVariable(name);

        if (variable === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Unknown variable "${name}"`,
                    Diagnostic.Codes.UnknownVariableError,
                    assignment.identifier
                )
            );
        }

        if (variable.isReadonly)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `"${name}" is readonly, an assignment is not allowed.`,
                    Diagnostic.Codes.ReadonlyAssignmentError,
                    assignment.identifier
                )
            );
        }

        const expression = this.connectExpression(assignment.expression);

        return new SemanticNodes.Assignment(variable, expression);
    }

    private connectExpression (expression: SyntaxNodes.Expression): SemanticNodes.Expression
    {
        switch (expression.kind)
        {
            case SyntaxKind.LiteralExpression:
                return this.connectLiteralExpression(expression as SyntaxNodes.LiteralExpression);
            case SyntaxKind.VectorLiteralExpression:
                return this.connectVectorLiteralExpression(expression as SyntaxNodes.VectorLiteralExpression);
            case SyntaxKind.VariableExpression:
                return this.connectVariableExpression(expression as SyntaxNodes.VariableExpression);
            case SyntaxKind.CallExpression:
                return this.connectCallExpression(expression as SyntaxNodes.CallExpression);
            case SyntaxKind.AccessExpression:
                return this.connectAccessExpression(expression as SyntaxNodes.AccessExpression);
            case SyntaxKind.ParenthesizedExpression:
                return this.connectParenthesizedExpression(expression as SyntaxNodes.ParenthesizedExpression);
            case SyntaxKind.UnaryExpression:
                return this.connectUnaryExpression(expression as SyntaxNodes.UnaryExpression);
            case SyntaxKind.BinaryExpression:
                return this.connectBinaryExpression(expression as SyntaxNodes.BinaryExpression);
            case SyntaxKind.File:
            case SyntaxKind.Section:
            case SyntaxKind.Namespace:
            case SyntaxKind.Module:
            case SyntaxKind.Import:
            case SyntaxKind.FunctionDeclaration:
            case SyntaxKind.FunctionParameter:
            case SyntaxKind.TypeClause:
            case SyntaxKind.VariableDeclaration:
            case SyntaxKind.Assignment:
            case SyntaxKind.IfStatement:
            case SyntaxKind.ElseClause:
            case SyntaxKind.WhileStatement:
            case SyntaxKind.ReturnStatement:
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Unexpected syntax of kind "${expression.kind}".`,
                        Diagnostic.Codes.UnexpectedExpressionSyntaxKindError,
                        expression.token
                    )
                );
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

    private connectVectorLiteralExpression (expression: SyntaxNodes.VectorLiteralExpression): SemanticNodes.VectorLiteralExpression
    {
        const elements: SemanticNodes.Expression[] = [];

        for (const element of expression.elements.elements)
        {
            const connectedExpression = this.connectExpression(element);
            elements.push(connectedExpression);
        }

        if (elements.length == 0)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    'A vector literal must contain at least one element.',
                    Diagnostic.Codes.EmptyVectorLiteralError,
                    expression.token
                )
            );
        }
        else
        {
            const elementsType = elements[0].type;

            if (elements.length > 1)
            {
                for (let i = 1; i < elements.length; i++)
                {
                    if (!elements[i].type.equals(elementsType))
                    {
                        this.diagnostic.throw(
                            new Diagnostic.Error(
                                `Vector literal of type "${elementsType.name}" contains incompatible expression of type`
                                + ` "${elements[i].type.name}" at index ${i}.`,
                                Diagnostic.Codes.VectorLiteralContainsExpressionsOfDifferentTypesError,
                                expression.elements.elements[i].token
                            )
                        );
                    }
                }
            }

            const vectorType = new SemanticSymbols.VectorType(elementsType, elements.length);

            return new SemanticNodes.VectorLiteralExpression(elements, vectorType);
        }
    }

    private connectVariableExpression (expression: SyntaxNodes.VariableExpression): SemanticNodes.VariableExpression
    {
        const name = expression.identifier.content;

        const variable = this.getVariable(name);

        if (variable === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Unknown variable "${name}"`,
                    Diagnostic.Codes.UnknownVariableError,
                    expression.identifier
                )
            );
        }

        return new SemanticNodes.VariableExpression(variable);
    }

    private connectCallExpression (
        expression: SyntaxNodes.CallExpression,
        inModule: SemanticSymbols.Module|null = null
    ): SemanticNodes.CallExpression
    {
        let functionSymbol: SemanticSymbols.Function|undefined;
        if (inModule === null)
        {
            functionSymbol = this.functions.get(expression.identifier.content);
        }
        else
        {
            functionSymbol = inModule.functionsNameToSymbol.get(expression.identifier.content);
        }

        if (functionSymbol === undefined)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Unknown function "${expression.identifier.content}"`,
                    Diagnostic.Codes.UnknownFunctionError,
                    expression.identifier
                )
            );
        }

        const module = inModule ?? this.currentModule;

        if (module === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Cannot call function "${expression.identifier.content}" outside of a module.`,
                    Diagnostic.Codes.CallOutsideModuleError,
                    expression.identifier
                )
            );
        }

        const callArguments: SemanticNodes.Expression[] = [];

        for (const argumentExpression of expression.arguments.elements)
        {
            const callArgument = this.connectExpression(argumentExpression);
            callArguments.push(callArgument);
        }

        if (functionSymbol.parameters.length !== callArguments.length)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Wrong argument count for function "${expression.identifier.content}"`,
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
                        `Wrong type for argument "${functionSymbol.parameters[i].name}".`,
                        Diagnostic.Codes.WrongArgumentTypeError,
                        expression.identifier
                    )
                );
            }
        }

        return new SemanticNodes.CallExpression(functionSymbol, module, callArguments);
    }

    private connectAccessExpression (expression: SyntaxNodes.AccessExpression): SemanticNodes.CallExpression
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
            if (!importedFile.module.functionsNameToSymbol.has(expression.functionCall.identifier.content))
            {
                this.diagnostic.throw(
                    new Diagnostic.Error(
                        `Unknown function "${expression.functionCall.identifier.content}" in module "${importedFile.module.name}"`,
                        Diagnostic.Codes.UnknownFunctionError,
                        expression.functionCall.identifier
                    )
                );
            }
            else
            {
                return this.connectCallExpression(expression.functionCall, importedFile.module);
            }
        }
    }

    private connectParenthesizedExpression (expression: SyntaxNodes.ParenthesizedExpression): SemanticNodes.Expression
    {
        return this.connectExpression(expression.expression);
    }

    private connectUnaryExpression (expression: SyntaxNodes.UnaryExpression): SemanticNodes.UnaryExpression
    {
        const operand = this.connectExpression(expression.operand);

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

    private connectBinaryExpression (expression: SyntaxNodes.BinaryExpression): SemanticNodes.BinaryExpression
    {
        const leftOperand = this.connectExpression(expression.leftSide);
        const rightOperand = this.connectExpression(expression.rightSide);

        const operator = BuildInOperators.getBinaryOperator(expression.operator.kind, leftOperand.type, rightOperand.type);

        if (operator === null)
        {
            this.diagnostic.throw(
                new Diagnostic.Error(
                    `Unknown binary operator "${expression.operator.content}" for "${leftOperand.type.name}" with "${rightOperand.type.name}"`,
                    Diagnostic.Codes.UnknownBinaryOperatorError,
                    expression.operator
                )
            );
        }

        return new SemanticNodes.BinaryExpression(operator, leftOperand, rightOperand);
    }
}
