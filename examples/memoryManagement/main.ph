module MemoryManagementExample;

import Standard.Io;

function main ()
{
    let myArray := new Array[String](3);
    myArray.set(1, 'Initialisation succeeded.');

    Io.writeLine(myArray.get(1));

    free myArray;

    Io.writeLine('Segmentation fault should follow...');

    Io.writeLine(myArray.get(1));
}
