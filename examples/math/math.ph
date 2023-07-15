module Math;

import Standard.Io;
import Standard.Conversion;

function main ()
{
    Io.writeLine('Number a:');
    var a := Conversion.stringToInt(Io.readLine());
    Io.writeLine('Number b:');
    var b := Conversion.stringToInt(Io.readLine());

    var additionResult := a + b;
    Io.writeLine('Addition result:');
    Io.writeLine(Conversion.intToString(additionResult));

    var subtractionResult := a - b;
    Io.writeLine('Subtraction result:');
    Io.writeLine(Conversion.intToString(subtractionResult));

    var multiplicationResult := a * b;
    Io.writeLine('Multiplication result:');
    Io.writeLine(Conversion.intToString(multiplicationResult));

    var divisionResult := a / b;
    Io.writeLine('Division result:');
    Io.writeLine(Conversion.intToString(divisionResult));

    var moduloResult := a % b;
    Io.writeLine('Modulo result:');
    Io.writeLine(Conversion.intToString(moduloResult));
}
