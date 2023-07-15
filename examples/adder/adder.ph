module Adder;

import Standard.Io;
import Standard.Conversion;

function main ()
{
    Io.writeLine('First summand:');
    var summandA := Conversion.stringToInt(Io.readLine());

    Io.writeLine('Second summand:');
    var summandB := Conversion.stringToInt(Io.readLine());

    var sum := summandA + summandB;

    Io.writeLine('Sum:');
    Io.writeLine(Conversion.intToString(sum));
}
