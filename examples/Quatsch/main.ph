module MyArray.Main;

import Standard.Io;
import MyArray.Array;

function main ()
{
    let myArray := new Array();

    myArray.concatenate('                                                                                                         ');

    while true
    {
        let input := Io.readLine();

        let inputArray := new Array();
        inputArray.concatenate(input);

        let variable counter := 1;
        while counter < inputArray.getLength()
        {
            let variable value := inputArray.get(counter);

            myArray.set(counter, value);

            counter := counter + 1;
        }

        Io.writeLine(myArray.getData());
    }
}
