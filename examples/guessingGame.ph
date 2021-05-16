import 'io';
import 'random';
import 'string';

function main ()
{
    randomise();

    var number := getRandom(100) + 1;

    writeLine('I have picked a number between 1 and 100. Guess it!');

    var stillGuessing := true;
    var tryCount := 0;

    while stillGuessing
    {
        var input := readLine();

        var inputNumber := stringToInt(input);

        tryCount := tryCount + 1;

        if number = inputNumber
        {
            writeLine('Correct!');

            stillGuessing := false;
        }
        else if number < inputNumber
        {
            writeLine('Too big! Next try!');
        }
        else
        {
            writeLine('Too small! Next try!');
        }
    }

    var score := intToString(tryCount);

    writeLine('Your score:');
    writeLine(score);

    return;
}
