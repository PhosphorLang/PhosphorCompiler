import 'io';
import 'string';

function main ()
{
    writeLine('Number a:');
    var a := stringToInt(readLine());
    writeLine('Number b:');
    var b := stringToInt(readLine());

    var additionResult := a + b;
    writeLine('Addition result:');
    writeLine(intToString(additionResult));

    var subtractionResult := a - b;
    writeLine('Subtraction result:');
    writeLine(intToString(subtractionResult));

    var multiplicationResult := a * b;
    writeLine('Multiplication result:');
    writeLine(intToString(multiplicationResult));

    var divisionResult := a / b;
    writeLine('Division result:');
    writeLine(intToString(divisionResult));

    var moduloResult := a % b;
    writeLine('Modulo result:');
    writeLine(intToString(moduloResult));
}
