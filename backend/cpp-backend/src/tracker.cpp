#include <iostream>
#include <fstream>
#include <chrono>
#include <thread>
#include <iomanip>
#include <sstream>
#include <filesystem>
#include <vector>
#include <cstdlib>
#include "../include/tracker.hpp"

void runTrackerLoop()
{
    // Ensure logs directory exists
    std::filesystem::create_directories("logs");
    // Resolve output file path (env override or common defaults)
    std::ofstream logFile;
    const char* envPath = std::getenv("TRACKER_ACTIVITY_PATH");
    if (envPath && *envPath)
    {
        logFile.open(envPath, std::ios::app);
    }
    if (!logFile.is_open())
    {
        const std::vector<std::string> candidates = {
            "../../data-backend/activity.jsonl", // run from src or build
            "../data-backend/activity.jsonl",    // run from cpp-backend
            "activity.jsonl"                      // fallback to CWD
        };
        for (const auto& p : candidates)
        {
            logFile.open(p, std::ios::app);
            if (logFile.is_open()) break;
        }
    }
    if (!logFile.is_open())
    {
        std::cerr << "Error: Unable to open activity log. Set TRACKER_ACTIVITY_PATH or run from backend/cpp-backend/(src|build).\n";
        return;
    }

    std::cout << "Tracker running... Press Ctrl + C to stop.\n";

    while (true)
    {
        // --- Timestamp (ISO 8601) ---
        auto now = std::chrono::system_clock::now();
        std::time_t t = std::chrono::system_clock::to_time_t(now);
        std::tm tm{};
#ifdef _WIN32
        localtime_s(&tm, &t);
#else
        localtime_r(&t, &tm);
#endif

        std::ostringstream ts;
        ts << std::put_time(&tm, "%Y-%m-%dT%H:%M:%S");

        // --- Collect system info ---
        auto [app, title] = getActiveWindow();
        unsigned long idle = getIdleSeconds();

        // --- Write JSON line ---
        logFile << "{\"timestamp\":\"" << ts.str()
                << "\",\"app_name\":\"" << app
                << "\",\"window_title\":\"" << title
                << "\",\"idle_seconds\":" << idle
                << "}" << std::endl;

        logFile.flush();                                      // ensure immediate write
        std::this_thread::sleep_for(std::chrono::seconds(5)); // 1 minute interval
    }
}
