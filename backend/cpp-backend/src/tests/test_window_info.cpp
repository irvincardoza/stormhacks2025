#include <iostream>
#include "../../include/tracker.hpp"

int main()
{
    auto [app, title] = getActiveWindow();
    std::cout << "App: " << app << "\n"
              << "Title: " << title << std::endl;
    return 0;
}
