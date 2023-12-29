module Math;

import Standard.Io;
import Standard.Conversion;

function main ()
{
    Io.writeLine('Number a:');
    let a := Conversion.stringToInt(Io.readLine());
    Io.writeLine('Number b:');
    let b := Conversion.stringToInt(Io.readLine());

    let additionResult := a + b;
    Io.writeLine('Addition result:');
    Io.writeLine(Conversion.intToString(additionResult));

    let subtractionResult := a - b;
    Io.writeLine('Subtraction result:');
    Io.writeLine(Conversion.intToString(subtractionResult));

    let multiplicationResult := a * b;
    Io.writeLine('Multiplication result:');
    Io.writeLine(Conversion.intToString(multiplicationResult));

    let divisionResult := a / b;
    Io.writeLine('Division result:');
    Io.writeLine(Conversion.intToString(divisionResult));

    let moduloResult := a % b;
    Io.writeLine('Modulo result:');
    Io.writeLine(Conversion.intToString(moduloResult));
}
