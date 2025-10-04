#pragma once
#include <string>
#include <utility>

std::pair<std::string, std::string> getActiveWindow();

unsigned long getIdleSeconds();

void runTrackerLoop();