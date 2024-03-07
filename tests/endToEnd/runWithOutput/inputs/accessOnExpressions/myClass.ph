class AccessOnExpressions.MyClass;

field variable myField: String := 'myField';

method getField (): String
{
    return myField;
}

method setField (value: String)
{
    myField := value;
}
