module GuessingGame;

import Standard.Io;
import Standard.Random;
import Standard.Conversion;

function main ()
{
    Random.randomise();

    let number := Random.getRandom(100) + 1;

    Io.writeLine('I have picked a number between 1 and 100. Guess it!');

    let stillGuessing := true;
    let tryCount := 0;

    while stillGuessing
    {
        let input := Io.readLine();

        let inputNumber := Conversion.stringToInt(input);

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

    let score := Conversion.intToString(tryCount);

    Io.writeLine('Your score:');
    Io.writeLine(score);
}
