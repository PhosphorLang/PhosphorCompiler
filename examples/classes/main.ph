import ClassesExample.MyClass;

module ClassesExample.Main;

function main ()
{
    MyClass.sayHelloFromFunction();

    let myClass := new MyClass();

    myClass.sayHelloFromMethod();

    myClass.setHelloField('Still hello from a method!');
    myClass.sayHelloFromMethod();
}
