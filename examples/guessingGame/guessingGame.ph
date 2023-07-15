module GuessingGame;

import Standard.Io;
import Standard.Random;
import Standard.Conversion;

function main ()
{
    Random.randomise();

    var number := Random.getRandom(100) + 1;

    Io.writeLine('I have picked a number between 1 and 100. Guess it!');

    var stillGuessing := true;
    var tryCount := 0;

    while stillGuessing
    {
        var input := Io.readLine();

        var inputNumber := Conversion.stringToInt(input);

        tryCount := tryCount + 1;

        if number = inputNumber
        {
            Io.writeLine('Correct!');

            stillGuessing := false;
        }
        else if number < inputNumber
        {
            Io.writeLine('Too big! Next try!');
        }
        else
        {
            Io.writeLine('Too small! Next try!');
        }
    }

    var score := Conversion.intToString(tryCount);

    Io.writeLine('Your score:');
    Io.writeLine(score);
}
