#include "../include/tracker.hpp"

#include <cctype>
#include <cstdlib>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string_view>
#include <system_error>
#include <type_traits>

namespace {

std::string escapeJson(std::string_view input)
{
    std::string output;
    output.reserve(input.size());

    for (unsigned char ch : input)
    {
        switch (ch)
        {
        case "\""[0]:
            output += "\\\"";
            break;
        case "\\"[0]:
            output += "\\\\";
            break;
        case '\b':
            output += "\\b";
            break;
        case '\f':
            output += "\\f";
            break;
        case '\n':
            output += "\\n";
            break;
        case '\r':
            output += "\\r";
            break;
        case '\t':
            output += "\\t";
            break;
        default:
            if (ch < 0x20)
            {
                std::ostringstream oss;
                oss << "\\u" << std::hex << std::uppercase << std::setw(4) << std::setfill('0')
                    << static_cast<int>(ch);
                output += oss.str();
            }
            else
            {
                output.push_back(static_cast<char>(ch));
            }
            break;
        }
    }

    return output;
}

std::string formatTimestamp(std::chrono::system_clock::time_point when)
{
    const std::time_t raw = std::chrono::system_clock::to_time_t(when);
    std::tm tm{};
#ifdef _WIN32
    localtime_s(&tm, &raw);
#else
    localtime_r(&raw, &tm);
#endif

    std::ostringstream oss;
    oss << std::put_time(&tm, "%Y-%m-%dT%H:%M:%S");
    return oss.str();
}

} // namespace

namespace tracker {

ActivityLogger::ActivityLogger(std::vector<Target> targets)
    : targets_(std::move(targets))
{
}

ActivityLogger::ActivityLogger(ActivityLogger&& other) noexcept
    : targets_(std::move(other.targets_))
    , resolvedPath_(std::move(other.resolvedPath_))
    , stream_(std::move(other.stream_))
{
}

ActivityLogger& ActivityLogger::operator=(ActivityLogger&& other) noexcept
{
    if (this != &other)
    {
        if (stream_.is_open())
        {
            stream_.close();
        }
        stream_.clear();

        targets_ = std::move(other.targets_);
        resolvedPath_ = std::move(other.resolvedPath_);
        stream_ = std::move(other.stream_);
    }
    return *this;
}

ActivityLogger::~ActivityLogger()
{
    if (stream_.is_open())
    {
        stream_.flush();
        stream_.close();
    }
}

bool ActivityLogger::isOpen() const noexcept
{
    return stream_.is_open();
}

bool ActivityLogger::open()
{
    if (isOpen())
    {
        return true;
    }

    stream_.close();
    stream_.clear();

    for (const auto& target : targets_)
    {
        const bool opened = std::visit([this](const auto& candidate) -> bool {
            using Candidate = std::decay_t<decltype(candidate)>;
            if constexpr (std::is_same_v<Candidate, Path>)
            {
                return tryOpen(candidate);
            }
            else
            {
                for (const auto& path : candidate)
                {
                    if (tryOpen(path))
                    {
                        return true;
                    }
                }
                return false;
            }
        }, target);

        if (opened)
        {
            return true;
        }
    }

    return false;
}

bool ActivityLogger::tryOpen(const Path& candidate)
{
    if (candidate.empty())
    {
        return false;
    }

    std::filesystem::path resolved = candidate;

    if (const auto parent = resolved.parent_path(); !parent.empty())
    {
        std::error_code ec;
        std::filesystem::create_directories(parent, ec);
        if (ec)
        {
            return false;
        }
    }

    stream_.open(resolved, std::ios::app);
    if (!stream_.is_open())
    {
        stream_.clear();
        return false;
    }

    resolvedPath_ = std::move(resolved);
    return true;
}

void ActivityLogger::write(const ActivitySample& sample)
{
    if (!isOpen())
    {
        throw std::runtime_error("Attempted to write to activity log before opening stream");
    }

    stream_ << sample.toJsonLine() << '\n';
    stream_.flush();
}

const ActivityLogger::Path& ActivityLogger::resolvedPath() const noexcept
{
    return resolvedPath_;
}

std::string ActivitySample::toJsonLine() const
{
    std::ostringstream oss;
    oss << "{\"timestamp\":\"" << formatTimestamp(timestamp)
        << "\",\"app_name\":\"" << escapeJson(appName)
        << "\",\"window_title\":\"" << escapeJson(windowTitle)
        << "\",\"idle_seconds\":" << idle.count()
        << "}";
    return oss.str();
}

void runTrackerLoop()
{
    std::vector<ActivityLogger::Target> targets;
    if (const char* envPath = std::getenv("TRACKER_ACTIVITY_PATH"); envPath && *envPath)
    {
        targets.emplace_back(ActivityLogger::Path{envPath});
    }

    targets.emplace_back(ActivityLogger::PathList{
        ActivityLogger::Path{"../../data-backend/activity.jsonl"},
        ActivityLogger::Path{"../data-backend/activity.jsonl"},
        ActivityLogger::Path{"activity.jsonl"}
    });

    ActivityLogger logger{std::move(targets)};
    if (!logger.open())
    {
        std::cerr << "Error: Unable to open activity log. Set TRACKER_ACTIVITY_PATH or run from backend/cpp-backend/(src|build).\n";
        return;
    }

    auto windowProvider = []() -> WindowSnapshot {
        auto [app, title] = getActiveWindow();
        return WindowSnapshot{std::move(app), std::move(title)};
    };

    auto idleProvider = []() -> std::chrono::seconds {
        return std::chrono::seconds{getIdleSeconds()};
    };

    Tracker tracker{windowProvider, idleProvider, std::move(logger)};

    std::cout << "Tracker running... Press Ctrl + C to stop.\n";
    try
    {
        tracker.run();
    }
    catch (const std::exception& ex)
    {
        std::cerr << "Tracker stopped due to error: " << ex.what() << '\n';
    }
}

} // namespace tracker
