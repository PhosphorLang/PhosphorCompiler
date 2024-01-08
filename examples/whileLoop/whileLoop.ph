module WhileLoop;

import Standard.Io;

function main ()
{
    let variable counter := 0;
    let variable continueLoop := true;

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
