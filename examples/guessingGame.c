// This C programme serves as a comparison for the Phosphor implementation of the guessing game.
// It is intended to be as close to the Phosphor variant as possible.

#include <time.h>
#include <stdlib.h>
#include <stdio.h>

int main ()
{
    srand(time(NULL));

    int number = rand() % 100 + 1;

    printf("I have picked a number between 1 and 100. Guess it!\n");

    char stillGuessing = 1;
    int tryCount = 0;

    while (stillGuessing)
    {
        int inputNumber;
        scanf("%d", &inputNumber);

        tryCount = tryCount + 1;

        if (number == inputNumber)
        {
            printf("Correct!\n");

            stillGuessing = 0;
        }
        else if (number < inputNumber)
        {
            printf("Too big! Next try!\n");
        }
        else
        {
            printf("Too small! Next try!\n");
        }
    }

    printf("Your score:\n");
    printf("%d\n", tryCount);
}
