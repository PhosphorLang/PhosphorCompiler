module Fibonacci;

import Standard.Io;
import Standard.Conversion;

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
    Io.writeLine('Input number:');
    var input := Io.readLine();

    var inputNumber := Conversion.stringToInt(input);

    var result := calculateFibonacci(inputNumber);

    var resultString := Conversion.intToString(result);

    Io.writeLine('Output number:');
    Io.writeLine(resultString);
}
