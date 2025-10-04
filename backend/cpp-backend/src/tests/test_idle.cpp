#include <iostream>
#include "../../include/tracker.hpp"
#include <synchapi.h>

int main()
{
    while (true)
    {
        unsigned long idle = getIdleSeconds();
        std::cout << "Idle seconds: " << idle << "\r";
        Sleep(500);
    }
}
