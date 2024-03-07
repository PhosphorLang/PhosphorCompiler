import Standard.Io;
import VariableExample.MyClass;

module VariableExample.Main;

function main ()
{
    Io.writeLine(MyClass.doFunctionThings());

    let myClass := new MyClass();

    Io.writeLine(myClass.doMethodThings());
}
