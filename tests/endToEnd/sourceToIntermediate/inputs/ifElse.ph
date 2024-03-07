module IfElse;

function testIfElse (): Boolean
{
    if 2 = 2
    {
        return true;
    }

    if 4 = 3
    {
        return true;
    }
    else
    {
        return false;
    }

    if false
    {
        return false;
    }
    else if true
    {
        return true;
    }
    else
    {
        return false;
    }
}

function main ()
{
    testIfElse();
}
