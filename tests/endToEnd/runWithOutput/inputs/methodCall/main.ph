import Standard.Io;
import MyClass;

module MethodCall;

function main ()
{
    let myClass := new MyClass();

    // Tests that methods can be called on objects:
    Io.writeLine(myClass.getText());
}
