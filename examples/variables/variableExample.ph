class VariableExample.MyClass;

constant moduleConstant: String := 'moduleConstant';
variable moduleVariable: String := 'moduleVariable';

field fieldConstant: String := 'fieldConstant';
field variable fieldVariable: String := 'fieldVariable';

function doFunctionThings (): String
{
    let localConstant := moduleVariable;

    return localConstant;
}

method doMethodThings (): String
{
    let variable localVariable := fieldVariable;
    localVariable := fieldConstant;

    return localVariable;
}
