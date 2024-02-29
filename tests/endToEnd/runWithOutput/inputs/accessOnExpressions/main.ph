import Standard.Io;
import AccessOnExpressions.MyClass;

module AccessOnExpressions.Main;

function main ()
{
    let variable myClass := new MyClass();

    let myField := myClass.getField();
    Io.writeLine(myField);

    Io.writeLine(myClass.getField());

    myClass.setField('setField');
    Io.writeLine(myClass.getField());

    myClass := new MyClass();

    let myFieldB := returnClass(myClass).getField();
    Io.writeLine(myFieldB);

    returnClass(myClass).setField('setField');
    Io.writeLine(returnClass(myClass).getField());
}

function returnClass (myClass: MyClass): MyClass
{
    return myClass;
}

