class MyClass;

field fieldConstant := 'fieldConstant';
field variable fieldVariable := 'fieldVariable';

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
