module Adder;

import Standard.Io;
import Standard.Conversion;

function main ()
{
    Io.writeLine('First summand:');
    let summandA := Conversion.stringToInt(Io.readLine());

    Io.writeLine('Second summand:');
    let summandB := Conversion.stringToInt(Io.readLine());

    let sum := summandA + summandB;

    Io.writeLine('Sum:');
    Io.writeLine(Conversion.intToString(sum));
}
