export enum DiagnosticCodes // TODO: Should this be singular?
{
    // Errors:
    UnknownTokenError = 'E1001',
    UnterminatedStringError = 'E1002',
    InvalidTokenInFileScopeError = 'E1003',
    MissingTypeClauseInParameterDefinitionError = 'E1004',
    MissingSemicolonAfterStatementError = 'E1005',
    UnexpectedTokenAfterVariableDeclarationIdentifierError = 'E1006',
    UnknownExpressionError = 'E1007',
    UnknownTypeError = 'E1008',
    DuplicateParameterNameError = 'E1009',
    ParameterWithoutTypeClauseError = 'E1010',
    VariableWithoutTypeClauseAndInitialiserError = 'E1011',
    DuplicateVariableDeclarationError = 'E1012',
    ReturnStatementOutsideFunctionBodyError = 'E1013',
    NotEmptyReturnInFunctionWithoutReturnTypeError = 'E1014',
    EmptyReturnInFunctionWithReturnTypeError = 'E1015',
    ReturnTypeDoesNotMatchFunctionReturnTypeError = 'E1016',
    UnknownVariableError = 'E1017',
    ReadonlyAssignmentError = 'E1018',
    UnexpectedLiteralExpressionSyntaxKindError = 'E1020',
    UnknownFunctionError = 'E1021',
    WrongArgumentCountError = 'E1022',
    WrongArgumentTypeError = 'E1023',
    UnknownUnaryOperatorError = 'E1024',
    UnknownBinaryOperatorError = 'E1025',
    NoLowererImplementationForExpressionError = 'E1026',
    UnexpectedNonBooleanExpressionInIfStatementError = 'E1027',
    UnexpectedNonBooleanExpressionInWhileStatementError = 'E1028',
    UnknownFunctionModifierError = 'E1029',
    MissingSectionInIfStatementError = 'E1030',
    MissingSectionInElseClauseError = 'E1031',
    MissingSectionInWhileStatementError = 'E1032',
    MissingStandardLibraryCommandLineParameterError = 'E1033',
    UnterminatedBlockCommentError = 'E1035',
    UnexpectedTokenInNamespace = 'E1038',
    EmptyNamespaceError = 'E1039',
    MissingModuleNameError = 'E1040',
    DuplicateModuleNameError = 'E1041',
    ModuleNotFoundError = 'E1042',
    FileNotFoundError = 'E1043',
    ModuleAlreadyImportedError = 'E1044',
    ImportNameConflictError = 'E1045',
    UnknownModuleError = 'E1046',
    CallOutsideModuleError = 'E1047',
    InvalidTokenInTypeArgumentError = 'E1048',
    WrongGenericArgumentCountError = 'E1049',
    GenericArgumentMustBeTypeError = 'E1050',
    GenericArgumentMustBeLiteralError = 'E1051',
    UnexpectedTokenInInstantiationExpressionError = 'E1052',
    MethodInModuleWithoutClassError = 'E1053',
    AccessOfUnknownTypeError = 'E1054',
    UnexpectedTokenInVariableExpressionError = 'E1055',
    UnknownStatementError = 'E1056',
    UnexpectedTokenAfterFieldDeclarationIdentifierError = 'E1057',
    FieldInModuleWithoutClassError = 'E1058',
    FieldWithoutTypeClauseAndInitialiserError = 'E1059',
    DuplicateFieldDeclarationError = 'E1060',
    FieldAccessOutsideMethodError = 'E1061',
    FieldAccessInsideFunctionError = 'E1062',
    DuplicateFunctionDeclarationError = 'E1063',
    GlobalVariableDeclarationIsMissingTypeClauseError = 'E1064',
    InitialiserTypeDoesNotMatchGlobalVariableTypeClauseError = 'E1065',
    FieldDeclarationIsMissingTypeClauseError = 'E1066',
    InitialiserTypeDoesNotMatchFieldDeclarationTypeClauseError = 'E1067',
    ParameterAssignmentError = 'E1068',
    MethodAccessOutsideMethodError = 'E1069',
    MethodAccessInsideFunctionError = 'E1070',
    ExpressionNotAllowedAsStatementError = 'E1071',
    UnknownIdentifierError = 'E1072',
    FieldAccessByModuleNameError = 'E1073',
    MethodAccessByModuleNameError = 'E1074',
    AccessOfObjectOfTypeWithUnknownModuleError = 'E1075',
    UnknownIdentifierInObjectAccessError = 'E1076',
    // Warnings:
    ExperimentalPlatformWarning = 'W1001',
    // Infos:
}
