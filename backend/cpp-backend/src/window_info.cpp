// Cross-platform active window info

#include "../include/tracker.hpp"

#include <string>
#include <utility>
#include <filesystem>

#ifdef _WIN32
#include <windows.h>
#include <psapi.h>

std::pair<std::string, std::string> getActiveWindow()
{
    HWND hwnd = GetForegroundWindow();
    if (!hwnd)
        return {"", ""};

    // --- Window title ---
    char title[256] = {0};
    GetWindowTextA(hwnd, title, sizeof(title));

    // --- Executable name ---
    DWORD pid = 0;
    GetWindowThreadProcessId(hwnd, &pid);
    HANDLE process = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, pid);

    char exePath[MAX_PATH] = "unknown";
    if (process)
    {
        GetModuleFileNameExA(process, nullptr, exePath, MAX_PATH);
        CloseHandle(process);
    }

    std::string appName = std::filesystem::path(exePath).filename().string();
    std::string winTitle(title);
    size_t lastDash = winTitle.rfind(" - ");
    if (lastDash != std::string::npos)
    {
        appName = winTitle.substr(lastDash + 3); // everything after last " - "
        winTitle = winTitle.substr(0, lastDash); // everything before last " - "
    }
    else
    {
        appName = std::filesystem::path(exePath).filename().string(); // fallback
    }

    return {appName, winTitle};
}

#elif defined(__APPLE__)
#include <CoreGraphics/CGWindow.h>
#include <CoreFoundation/CoreFoundation.h>

static std::string cfStringToStd(CFStringRef s)
{
    if (!s) return std::string();
    char buffer[1024];
    if (CFStringGetCString(s, buffer, sizeof(buffer), kCFStringEncodingUTF8))
        return std::string(buffer);
    return std::string();
}

std::pair<std::string, std::string> getActiveWindow()
{
    std::string appName;
    std::string winTitle;

    CFArrayRef windowInfo = CGWindowListCopyWindowInfo(
        kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements,
        kCGNullWindowID);

    if (!windowInfo)
        return {appName, winTitle};

    CFIndex count = CFArrayGetCount(windowInfo);
    for (CFIndex i = 0; i < count; ++i)
    {
        CFDictionaryRef dict = (CFDictionaryRef)CFArrayGetValueAtIndex(windowInfo, i);
        if (!dict) continue;

        // Skip non-standard layers (e.g., menu bar, dock)
        int layer = 0;
        CFNumberRef layerRef = (CFNumberRef)CFDictionaryGetValue(dict, kCGWindowLayer);
        if (layerRef)
            CFNumberGetValue(layerRef, kCFNumberIntType, &layer);
        if (layer != 0)
            continue;

        CFStringRef ownerName = (CFStringRef)CFDictionaryGetValue(dict, kCGWindowOwnerName);
        CFStringRef name = (CFStringRef)CFDictionaryGetValue(dict, kCGWindowName);

        appName = cfStringToStd(ownerName);
        winTitle = cfStringToStd(name);

        // We pick the first frontmost layer-0 window
        break;
    }

    CFRelease(windowInfo);
    return {appName, winTitle};
}

#else
std::pair<std::string, std::string> getActiveWindow()
{
    return {"", ""};
}
#endif
