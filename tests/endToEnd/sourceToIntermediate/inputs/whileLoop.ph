module WhileLoop;

function getMax (): Integer
{
    return 4;
}

function testWhileLoop (): Boolean
{
    let variable counter := 0;

    while counter < getMax()
    {
        counter := counter + 1;
    }

    return true;
}

function main ()
{
    testWhileLoop();
}
