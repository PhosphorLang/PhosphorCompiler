import 'io';
import 'string';

function main ()
{
    writeLine('First summand:');
    var summandA := stringToInt(readLine());

    writeLine('Second summand:');
    var summandB := stringToInt(readLine());

    var sum := summandA + summandB;

    writeLine('Sum:');
    writeLine(intToString(sum));
}
