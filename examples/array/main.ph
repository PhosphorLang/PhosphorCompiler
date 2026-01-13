import Standard.Conversion;
import Standard.Io;

module ArrayExample;

function main ()
{
    let myArray := new Array[Integer](3);
    myArray.set(0, 1);
    myArray.set(1, 2);
    myArray.set(2, 3);

    let length := myArray.length;
    let lengthString := Conversion.intToString(length);
    Io.writeLine('Array length:');
    Io.writeLine(lengthString);

    Io.writeLine('Array elements:');

    let variable index := 0;
    while index < 3
    {
        let gotElement := myArray.get(index);
        let gotString := Conversion.intToString(gotElement);
        Io.writeLine(gotString);
        index := index + 1;
    }
}
