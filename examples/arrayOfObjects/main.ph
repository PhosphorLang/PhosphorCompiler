import Standard.Conversion;
import Standard.Io;
import ArrayOfObjectsExample.MyClass;

module ArrayOfObjectsExample;

function main ()
{
    let myArray := new Array[MyClass](3);
    myArray.set(0, new MyClass());
    myArray.set(1, new MyClass());
    myArray.set(2, new MyClass());

    let firstObject := myArray.get(0);
    firstObject.setIndex(0);
    firstObject.setMessage('First element');
    let secondObject := myArray.get(1);
    secondObject.setIndex(1);
    secondObject.setMessage('Second element');
    let thirdObject := myArray.get(2);
    thirdObject.setIndex(2);
    thirdObject.setMessage('Third element');

    let length := myArray.length;
    let lengthString := Conversion.intToString(length);
    Io.writeLine('Array length:');
    Io.writeLine(lengthString);

    Io.writeLine('Array elements:');

    let variable index := 0;
    while index < 3
    {
        let theObject := myArray.get(index);

        let objectIndex := theObject.getIndex();
        let objectMessage := theObject.getMessage();

        let objectIndexString := Conversion.intToString(objectIndex);
        Io.writeLine(objectIndexString);
        Io.writeLine(objectMessage);

        index := index + 1;
    }
}
