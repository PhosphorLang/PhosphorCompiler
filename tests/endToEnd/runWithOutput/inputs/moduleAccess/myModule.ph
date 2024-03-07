class MyModule;

constant myModuleConstant: String := 'myModuleConstant';
variable myModuleVariable: String := 'myModuleVariable';

function setVariable (value: String)
{
    myModuleVariable := value;
}

function getVariable (): String
{
    return myModuleVariable;
}

function getConstant (): String
{
    return myModuleConstant;
}
