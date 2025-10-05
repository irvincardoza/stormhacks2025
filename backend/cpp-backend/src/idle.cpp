// Cross-platform idle time implementation

#include "../include/tracker.hpp"

#ifdef _WIN32
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

#elif defined(__APPLE__)
#include <ApplicationServices/ApplicationServices.h>

unsigned long getIdleSeconds()
{
    // Returns seconds since last input event for the current session
    double secs = CGEventSourceSecondsSinceLastEventType(
        kCGEventSourceStateCombinedSessionState, kCGAnyInputEventType);
    if (secs < 0) secs = 0;
    return static_cast<unsigned long>(secs);
}

#else
unsigned long getIdleSeconds()
{
    // Unsupported platform fallback
    return 0;
}
#endif
