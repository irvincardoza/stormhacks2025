#include <windows.h>
#include <psapi.h>
#include <string>
#include <utility>
#include <filesystem>
#include <string>

std::pair<std::string, std::string> getActiveWindow()
{
    HWND hwnd = GetForegroundWindow();
    if (!hwnd)
        return {"", ""};

    // --- Window title ---
    char title[256];
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