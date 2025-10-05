cmake_minimum_required(VERSION 3.16)
project(tracker LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_executable(tracker
    src/main.cpp
    src/tracker.cpp
    src/idle.cpp
    src/window_info.cpp
)

if(APPLE)
    # CoreGraphics provides CGWindow APIs and event source idle time
    target_link_libraries(tracker
        "-framework CoreGraphics"
        "-framework CoreFoundation"
        "-framework ApplicationServices"
    )
endif()

