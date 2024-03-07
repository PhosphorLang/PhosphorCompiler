class MyClass;

field fieldConstant: String := 'fieldConstant';
field variable fieldVariable: String := 'fieldVariable';

method setField (value: String)
{
    fieldVariable := value;
}

method getField (): String
{
    return fieldVariable;
}

method getConstant (): String
{
    return fieldConstant;
}
