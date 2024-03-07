import Standard.Io;
import MyClass;

module FieldAccess;

function main ()
{
    let myClass := new MyClass();

    Io.writeLine(myClass.getConstant());
    Io.writeLine(myClass.getField());

    myClass.setField('changedField');
    Io.writeLine(myClass.getField());
}
