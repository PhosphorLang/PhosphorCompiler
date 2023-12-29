module WhileLoop;

import Standard.Io;

function main ()
{
    let counter := 0;
    let continueLoop := true;

    while continueLoop
    {
        Io.writeLine('Counted!');

        counter := counter + 1;

        if counter = 4
        {
            continueLoop := false;
        }
    }
}
