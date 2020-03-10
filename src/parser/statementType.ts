enum StatementType
{
    None, // "value" or "valueA valueB" or ...
    UnaryLeft, // "operator value"
    UnaryRight, // "value operator"
    Binary, // "valueA operator valueB"
}

export default StatementType;
