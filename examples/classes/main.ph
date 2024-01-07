import ClassesExample.MyClass;

module ClassesExample.Main;

function main ()
{
    MyClass.sayHelloFromFunction();

    let myClass := new MyClass();
    myClass.sayHelloFromMethod();
}
