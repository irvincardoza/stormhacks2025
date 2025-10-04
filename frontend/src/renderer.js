// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off and `contextIsolation` is turned on.
// Use the contextBridge API in `preload.js` to expose Node.js functionality
// to the renderer process.

console.log('Timeline Dashboard Renderer Loaded');

let allLogs = [];
let currentFilter = 'today';
let isTrackingActive = false; // This will be a synced copy of the main process state.

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize all components
    initializeClock();
    await initializeSettings();
    await loadTimelineData();
    setupEventListeners();
    setupRealTimeUpdates();
    await syncTrackingStatus(); // Get initial status
    setupTrackingListener();  // Listen for changes
    
    console.log('Timeline Dashboard initialized');
});

// Clock functionality
function initializeClock() {
    function updateClock() {
        const now = new Date();
        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const timeOptions = { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        };
        
        document.getElementById('current-date').textContent = 
            now.toLocaleDateString('en-US', dateOptions);
        document.getElementById('current-time').textContent = 
            now.toLocaleTimeString('en-US', timeOptions);
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

// --- Settings Constants and Functions ---
const INTERVAL_VALUES = [0.5, 1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]; // In minutes

function getIntervalIndex(minutes) {
    return INTERVAL_VALUES.reduce((closestIndex, currentVal, currentIndex) => {
        const closestVal = INTERVAL_VALUES[closestIndex];
        return Math.abs(currentVal - minutes) < Math.abs(closestVal - minutes) ? currentIndex : closestIndex;
    }, 0);
}

function formatIntervalDisplay(minutes) {
    if (minutes < 1) return `${minutes * 60} seconds`;
    if (minutes === 60) return '1 hour';
    if (minutes > 60) return `${minutes / 60} hours`;
    return `${minutes} min`;
}

// Settings functionality
async function initializeSettings() {
    const slider = document.getElementById('interval-slider');
    const intervalDisplay = document.getElementById('interval-value');
    const soundToggle = document.getElementById('sound');
    
    try {
        console.log('Loading settings...');
        const settings = await window.electronAPI.getSettings();
        
        if (settings) {
            const currentInterval = settings.intervalMinutes || 30;
            const sliderIndex = getIntervalIndex(currentInterval);
            slider.value = sliderIndex;
            intervalDisplay.textContent = formatIntervalDisplay(INTERVAL_VALUES[sliderIndex]);

            soundToggle.checked = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        slider.value = getIntervalIndex(30);
        intervalDisplay.textContent = formatIntervalDisplay(30);
        soundToggle.checked = true;
    }
}

// Timeline data loading
async function loadTimelineData() {
    try {
        console.log('Loading timeline data...');
        const logs = await window.electronAPI.getLogs();
        console.log('Received logs:', logs);
        
        allLogs = logs;
        updateStats();
        renderTimeline();
        
    } catch (error) {
        console.error('Error loading timeline data:', error);
        showEmptyTimeline();
    }
}

// Stats calculation
function updateStats() {
    const totalEntries = allLogs.length;
    const today = new Date().toDateString();
    const todayEntries = allLogs.filter(log => {
        const logDate = new Date(log.timestamp + 'Z').toDateString();
        return logDate === today;
    }).length;
    
    document.getElementById('total-entries').textContent = totalEntries;
    document.getElementById('today-entries').textContent = todayEntries;
}

// Timeline rendering with new layout
function renderTimeline() {
    const container = document.getElementById('timeline-container');
    
    const filteredLogs = getFilteredLogs();
    
    container.innerHTML = '';
    
    // Create timeline entries
    filteredLogs.forEach((log, index) => {
        const entry = createTimelineEntry(log, index, filteredLogs.length);
        container.appendChild(entry);
    });
}

function getFilteredLogs() {
    const now = new Date();
    
    switch (currentFilter) {
        case 'today':
            const today = now.toDateString();
            return allLogs.filter(log => {
                const logDate = new Date(log.timestamp + 'Z').toDateString();
                return logDate === today;
            });
            
        case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return allLogs.filter(log => {
                const logDate = new Date(log.timestamp + 'Z');
                return logDate >= weekAgo;
            });
            
        case 'month':
            const monthAgo = new Date(now);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return allLogs.filter(log => {
                const logDate = new Date(log.timestamp + 'Z');
                return logDate >= monthAgo;
            });
            
        default:
            return allLogs;
    }
}

function createTimelineEntry(log, index, totalEntries) {
    const entry = document.createElement('li');
    
    const time = formatTime(log.timestamp);
    const activity = log.activity || 'No activity recorded';
    
    entry.innerHTML = `
      <div class="timeline-start">${time}</div>
      <div class="timeline-middle">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="timeline-end timeline-box">${activity}</div>
    `;
    
    return entry;
}

function formatTime(timestamp) {
    try {
        const date = new Date(timestamp + 'Z');
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch (e) {
        console.error('Error formatting time:', timestamp, e);
        return 'Invalid Time';
    }
}

function formatDate(timestamp) {
    try {
        const date = new Date(timestamp + 'Z');
        const today = new Date().toDateString();
        const logDate = date.toDateString();
        
        if (logDate === today) {
            return '';
        }
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    } catch (e) {
        console.error('Error formatting date:', timestamp, e);
        return '';
    }
}

function categorizeActivity(activity) {
    const lowercaseActivity = activity.toLowerCase();
    
    if (lowercaseActivity.includes('code') || lowercaseActivity.includes('develop') || 
        lowercaseActivity.includes('program') || lowercaseActivity.includes('debug')) {
        return 'Development';
    }
    if (lowercaseActivity.includes('meet') || lowercaseActivity.includes('call') || 
        lowercaseActivity.includes('discussion')) {
        return 'Meeting';
    }
    if (lowercaseActivity.includes('learn') || lowercaseActivity.includes('study') || 
        lowercaseActivity.includes('research') || lowercaseActivity.includes('read')) {
        return 'Learning';
    }
    if (lowercaseActivity.includes('design') || lowercaseActivity.includes('ui') || 
        lowercaseActivity.includes('ux') || lowercaseActivity.includes('mockup')) {
        return 'Design';
    }
    if (lowercaseActivity.includes('plan') || lowercaseActivity.includes('organize') || 
        lowercaseActivity.includes('manage') || lowercaseActivity.includes('admin')) {
        return 'Planning';
    }
    
    return 'General';
}

function showEmptyTimeline() {
    document.getElementById('timeline-container').innerHTML = '';
    document.getElementById('empty-timeline').classList.remove('hidden');
}

// Event listeners setup
function setupEventListeners() {
    // Filter buttons
    const filterControl = document.querySelector('.filter-control');
    if (filterControl) {
        const segments = filterControl.querySelectorAll('.filter-segment');
        segments.forEach(segment => {
            segment.addEventListener('click', () => setFilter(segment.dataset.filter));
        });
    }
    
    // Main tracking button
    document.getElementById('main-tracking-btn').addEventListener('click', toggleMainTracking);
    
    // Settings
    const slider = document.getElementById('interval-slider');
    const intervalDisplay = document.getElementById('interval-value');
    slider.addEventListener('input', () => {
        const newIndex = slider.value;
        intervalDisplay.textContent = formatIntervalDisplay(INTERVAL_VALUES[newIndex]);
    });

    document.getElementById('save-settings').addEventListener('click', saveSettings);
}

function setFilter(filter) {
    if (currentFilter === filter) return;
    currentFilter = filter;
    
    // Update active button state
    const segments = document.querySelectorAll('.filter-segment');
    const activeSegment = document.querySelector(`.filter-segment[data-filter="${filter}"]`);
    
    segments.forEach(s => s.classList.remove('active'));
    
    if (activeSegment) {
        activeSegment.classList.add('active');
        
        // Move the highlight
        const highlight = document.querySelector('.filter-highlight');
        const controlRect = document.querySelector('.filter-control').getBoundingClientRect();
        const segmentRect = activeSegment.getBoundingClientRect();
        
        highlight.style.width = `${segmentRect.width}px`;
        highlight.style.left = `${segmentRect.left - controlRect.left}px`;
    }
    
    renderTimeline();
}

// Main tracking functionality
function updateTrackingButton(isTracking) {
    isTrackingActive = isTracking; // Update the local state
    const btn = document.getElementById('main-tracking-btn');
    const label = document.getElementById('tracking-btn-label');
    const sublabel = document.getElementById('tracking-btn-sublabel');

    if (isTracking) {
        btn.classList.remove('tracking-stopped');
        btn.classList.add('tracking-active');
        label.textContent = 'Stop Tracking';
        sublabel.textContent = 'Currently tracking your activity';
    } else {
        btn.classList.remove('tracking-active');
        btn.classList.add('tracking-stopped');
        label.textContent = 'Start Tracking';
        sublabel.textContent = 'Begin your productivity session';
    }
}

async function toggleMainTracking() {
    const btn = document.getElementById('main-tracking-btn');
    btn.disabled = true;

    try {
        if (isTrackingActive) {
            console.log('Renderer requesting to pause tracking...');
            await window.electronAPI.pauseTracking();
        } else {
            console.log('Renderer requesting to start tracking...');
            await window.electronAPI.startTracking();
        }
    } catch (error) {
        console.error('Failed to toggle tracking:', error);
        // If it fails, re-sync to be safe
        await syncTrackingStatus();
    } finally {
        btn.disabled = false;
    }
}

async function saveSettings() {
    const slider = document.getElementById('interval-slider');
    const soundToggle = document.getElementById('sound');
    
    const settings = {
        intervalMinutes: INTERVAL_VALUES[slider.value],
        soundEnabled: soundToggle.checked,
    };
    
    try {
        console.log('Saving settings:', settings);
        const result = await window.electronAPI.saveSettings(settings);
        
        if (result.success) {
            // Show success feedback
            const btn = document.getElementById('save-settings');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Saved!';
            
            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        } else {
            throw new Error(result.error || 'Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('Failed to save settings: ' + error.message);
    }
}

function startTracking() {
    // This is now handled by the event listener on the 'start-tracking-btn'
    // It calls toggleMainTracking directly.
}

// Real-time updates & sync
function setupTrackingListener() {
    window.electronAPI.onTrackingStateChange((isTracking) => {
        console.log('Received tracking state update from main:', isTracking);
        updateTrackingButton(isTracking);
    });
}

async function syncTrackingStatus() {
    try {
        const status = await window.electronAPI.getTrackingStatus();
        console.log('Initial tracking status from main:', status);
        updateTrackingButton(status);
    } catch (error) {
        console.error('Error getting initial tracking status:', error);
    }
}

function setupRealTimeUpdates() {
    console.log('Setting up real-time log updates...');
    
    window.electronAPI.onLogUpdate((newLog) => {
        console.log('Received new log update:', newLog);
        
        // Add to the beginning of our logs array
        allLogs.unshift(newLog);
        
        // Update stats and re-render timeline
        updateStats();
        renderTimeline();
        
        // Show a subtle notification
        showLogUpdateNotification(newLog);
    });
}

function showLogUpdateNotification(log) {
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-card border border-border rounded-lg p-4 shadow-lg z-50 transition-all transform translate-x-full';
    notification.innerHTML = `
        <div class="flex items-start space-x-3">
            <div class="w-2 h-2 bg-primary rounded-full mt-1 animate-pulse"></div>
            <div>
                <p class="text-sm font-medium">New activity logged</p>
                <p class="text-xs text-muted-foreground truncate max-w-48">${log.activity}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Entry management functions (for future implementation)
function editEntry(id) {
    console.log('Edit entry:', id);
    // TODO: Implement edit functionality
    alert('Edit functionality coming soon!');
}

function deleteEntry(id) {
    console.log('Delete entry:', id);
    // TODO: Implement delete functionality
    if (confirm('Are you sure you want to delete this entry?')) {
        alert('Delete functionality coming soon!');
    }
}

// Initialize with today filter active
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure everything is rendered for highlight calculation
    setTimeout(() => {
        setFilter('today');
    }, 50);
}); 