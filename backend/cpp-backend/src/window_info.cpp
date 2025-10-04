#include <windows.h>
#include <psapi.h>
#include <string>
#include <utility>

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

    return {std::string(exePath), std::string(title)};
}