import 'io';

function main ()
{
    var counter := 0;
    var continueLoop := true;

    while continueLoop
    {
        writeLine('Counted!');

        counter := counter + 1;

        if counter = 4
        {
            continueLoop := false;
        }
    }
}
