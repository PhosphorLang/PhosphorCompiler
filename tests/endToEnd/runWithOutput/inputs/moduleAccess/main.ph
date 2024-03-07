import Standard.Io;
import MyModule;

module ModuleAccess;

constant myMainConstant: String := 'myMainConstant';
variable myMainVariable: String := 'myMainVariable';

function main ()
{
    Io.writeLine(myMainConstant);
    Io.writeLine(myMainVariable);

    myMainVariable := 'myChangedMainVariable';
    Io.writeLine(myMainVariable);

    Io.writeLine(MyModule.getConstant());
    Io.writeLine(MyModule.getVariable());

    MyModule.setVariable('myChangedModuleVariable');
    Io.writeLine(MyModule.getVariable());
}
