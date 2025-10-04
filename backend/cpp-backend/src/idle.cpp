#include <windows.h>

unsigned long getIdleSeconds()
{
    LASTINPUTINFO lii = {0};
    lii.cbSize = sizeof(LASTINPUTINFO);
    if (!GetLastInputInfo(&lii))
        return 0;

    DWORD tickCount = GetTickCount();
    return (tickCount - lii.dwTime) / 1000;
}