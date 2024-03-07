module Fibonacci;

import Standard.Io;
import Standard.Conversion;

function calculateFibonacci (n: Integer): Integer
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
    let input := Io.readLine();

    let inputNumber := Conversion.stringToInt(input);

    let result := calculateFibonacci(inputNumber);

    let resultString := Conversion.intToString(result);

    Io.writeLine('Output number:');
    Io.writeLine(resultString);
}
