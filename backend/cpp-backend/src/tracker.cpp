#include <iostream>
#include <fstream>
#include <chrono>
#include <thread>
#include <iomanip>
#include <sstream>
#include <filesystem>
#include "../include/tracker.hpp"

void runTrackerLoop()
{
    // Ensure logs directory exists
    std::filesystem::create_directories("logs");
    std::ofstream logFile("../../data-backend/activity.jsonl", std::ios::app);

    if (!logFile.is_open())
    {
        std::cerr << "Error: Unable to open logs/activity.jsonl\n";
        return;
    }

    std::cout << "Tracker running... Press Ctrl + C to stop.\n";

    while (true)
    {
        // --- Timestamp (ISO 8601) ---
        auto now = std::chrono::system_clock::now();
        std::time_t t = std::chrono::system_clock::to_time_t(now);
        std::tm tm{};
        localtime_s(&tm, &t);

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

        logFile.flush();                                       // ensure immediate write
        std::this_thread::sleep_for(std::chrono::seconds(60)); // 1 minute interval
    }
}
