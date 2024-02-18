class MyArray.Array;

import Standard.String;

field variable data: String := '0';

method getData (): String
{
    return data;
}

method get (index: Int): String
{
    return String.getIndex(data, index);
}

method set (index: Int, value: String)
{
    data := String.setIndex(data, index, value);
}

method concatenate (other: String)
{
    data := String.concatenate(data, other);
}

method increment (count: Int)
{
    let variable counter := count;

    while counter > 0
    {
        data := String.concatenate(data, '0');
        counter := counter - 1;
    }
}

method getLength (): Int
{
    return String.getLength(data);
}
