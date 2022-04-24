import 'io';
import 'string';

function calculateFibonacci (n: Int): Int
{
    if n < 2
    {
        return n;
    }
    else
    {
        return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
    }
}

function main ()
{
    writeLine('Input number:');
    var input := readLine();

    var inputNumber := stringToInt(input);

    var result := calculateFibonacci(inputNumber);

    var resultString := intToString(result);

    writeLine('Output number:');
    writeLine(resultString);
}
