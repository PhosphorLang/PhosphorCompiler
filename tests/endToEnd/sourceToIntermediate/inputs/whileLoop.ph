module WhileLoop;

function getMax (): Int
{
    return 4;
}

function testWhileLoop (): Bool
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
