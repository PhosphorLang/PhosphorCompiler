export enum DiagnosticCodes
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
    UnexpectedExpressionSyntaxKindError = 'E1019',
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
    CannotFindImportFileError = 'E1034',
    UnterminatedBlockCommentError = 'E1035',
    // Warnings:
    ExperimentalPlatformWarning = 'W1001',
    // Infos:
}
