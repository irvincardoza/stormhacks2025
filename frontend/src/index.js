const { app, Tray, Menu, nativeImage, BrowserWindow, ipcMain, Notification, systemPreferences } = require('electron');
const path = require('node:path');
const Database = require('better-sqlite3'); // Import database driver

// --- Global Variables (Initialize later) ---
let store; 
let db;
let tray = null;
let mainWindow = null;
let inputWindow = null;
let isTracking = false;
let timerId = null;
let currentIntervalMinutes;
let currentSoundEnabled;
let trackingInterval;
let isQuitting = false; // Flag to allow windows to close on quit
// -----------------------------------------

// Helper to broadcast tracking state to the main window
function broadcastTrackingStateChange() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    console.log(`Broadcasting tracking state change to renderer. New state: ${isTracking}`);
    mainWindow.webContents.send('tracking:state-changed', isTracking);
  }
}

// --- Database Setup Function ---
function setupDatabase() {
    const dbPath = path.join(app.getPath('userData'), 'tracklet.db');
    try {
        db = new Database(dbPath, { /* verbose: console.log */ });
        console.log(`Database connected at: ${dbPath}`);
        const createTableStmt = `
            CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            activity TEXT NOT NULL
            )
        `;
        db.exec(createTableStmt);
        console.log('\'Logs\' table checked/created.');
    } catch (error) {
        console.error('Database connection error:', error);
        db = null;
    }
}
// ---------------------------

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    // Close DB connection before quitting if it was opened
    // Note: db might not be initialized yet here, but check is safe
    if (db) db.close(); 
    app.quit();
}

// --- Initialize Function (Async) ---
async function initializeApp() {
    // Dynamically import electron-store
    const { default: Store } = await import('electron-store');

    // Initialize Settings Store
    store = new Store({
        defaults: {
            intervalMinutes: 30,
            soundEnabled: true,
        }
    });
    console.log('Settings store initialized.');

    // Load settings from store
    currentIntervalMinutes = store.get('intervalMinutes');
    currentSoundEnabled = store.get('soundEnabled');
    trackingInterval = currentIntervalMinutes * 60 * 1000; 
    console.log(`Initial settings loaded: Interval=${currentIntervalMinutes}min, Sound=${currentSoundEnabled}`);

    // Setup Database
    setupDatabase();

    // Setup IPC Handlers (now that store is initialized)
    setupIpcHandlers();

    // Setup Tray Icon
    setupTray();
}
// ---------------------------------

// --- Function Definitions (Moved here, no changes inside them) ---
const createWindow = () => {
  // If window exists, show and focus it instead of creating a new one
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }
  
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Recommended for security
      nodeIntegration: false, // Recommended for security
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Optional: Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
    updateMenu(); // Update menu to show 'Show Dashboard' again
  });

  // Handle window hide events (minimize, etc.)
  mainWindow.on('hide', () => {
    updateMenu(); // Update menu to enable 'Show Dashboard'
  });

  // Handle window show events (restore, etc.)
  mainWindow.on('show', () => {
    updateMenu(); // Update menu to disable 'Show Dashboard'
  });

  updateMenu(); // Update menu to disable 'Show Dashboard'
};

function showInputWindow() {
  if (!inputWindow || inputWindow.isDestroyed()) {
    createInputWindow(); // Creates and assigns to global `inputWindow`
  }
  inputWindow.showInactive(); // appear without stealing focus
  // Ask renderer to reset its UI state
  inputWindow.webContents.send('reset-input');
}

const createInputWindow = () => {
  // Create the browser window.
  inputWindow = new BrowserWindow({
    width: 450, // Keep width; outer wrapper now has padding to create margin
    height: 300, // Increased height for better bottom spacing
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    frame: false, // No window frame
    show: false, // Don't show until ready
    skipTaskbar: true,
    transparent: true, // Enable transparency
    vibrancy: 'under-window', // macOS vibrancy effect for a blurred background
    webPreferences: {
      preload: path.join(__dirname, 'inputPreload.js'), // Separate preload for this window
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Make sure it can appear above fullscreen apps / other spaces
  inputWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  inputWindow.loadFile(path.join(__dirname, 'input.html'));

  // Instead of closing, we hide the window. This prevents destroying and
  // re-creating it, which is the source of the memory leak.
  inputWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      inputWindow.hide();
      // Hide the whole app so no other window pops to front
      if (BrowserWindow.getAllWindows().filter(w => w.isVisible()).length === 0) {
        app.hide();
      }
    }
  });
};

function recordLog(activity) {
  if (!db) {
    console.error('Cannot add log: Database not available.');
    return { success: false, error: 'Database connection failed.' };
  }
  if (!activity || activity.trim().length === 0) {
      // Don't log empty entries silently when triggered internally
      console.warn('Attempted to log empty activity.');
      return { success: false, error: 'Activity cannot be empty.' };
  }

  console.log('Main process: Recording log activity:', activity);
  try {
    const stmt = db.prepare('INSERT INTO logs (activity) VALUES (?)');
    const info = stmt.run(activity.trim());
    const newLogId = info.lastInsertRowid;
    console.log('Log added successfully via recordLog, ID:', newLogId);

    // Fetch the newly added log to send its details (including timestamp)
    const fetchStmt = db.prepare('SELECT id, timestamp, activity FROM logs WHERE id = ?');
    const newLog = fetchStmt.get(newLogId);

    // Notify renderer if the dashboard window is open
    if (mainWindow && newLog) {
       console.log('Sending logs:updated to dashboard window');
       mainWindow.webContents.send('logs:updated', newLog);
    }
    return { success: true, id: newLogId };
  } catch (error) {
    console.error('Failed to add log via recordLog:', error);
    return { success: false, error: error.message };
  }
}

function startTracking() {
  // 1. Clear any existing timer FIRST to prevent duplicates
  if (timerId) {
    console.log('Clearing previous timer before starting/restarting...');
    clearInterval(timerId);
    timerId = null;
  }

  // 2. Set state to tracking (if not already set)
  // This flag mainly controls the menu item label
  if (!isTracking) {
      console.log('Setting tracking state to true.');
      isTracking = true;
      broadcastTrackingStateChange();
  }

  // 3. Start the new timer using the current interval settings
  console.log(`Starting/Restarting tracking timer with interval: ${currentIntervalMinutes} minutes (${trackingInterval}ms)...`);
  timerId = setInterval(() => {
    console.log('Timer fired: Triggering notification.');

    if (process.platform === 'darwin') {
        // macOS: Show a persistent in-app input window instead of relying on the
        // system notification, which may auto-dismiss depending on user settings.
        console.log('macOS detected – opening persistent input window.');
        showInputWindow();
    } else {
        // Windows / Linux – use system notification with "never" timeout.
        const notification = new Notification({
            title: 'Tracklet',
            body: 'What are you working on right now?',
            silent: !currentSoundEnabled,
            timeoutType: 'never'
        });

        notification.on('click', () => {
            console.log('Notification clicked.');
            showInputWindow();
        });

        notification.show();
    }

  }, trackingInterval);

  // 4. Update the menu to reflect the active state
  updateMenu();
}

function pauseTracking() {
  if (!isTracking || !timerId) return;
  console.log('Pausing tracking...');
  isTracking = false;
  clearInterval(timerId);
  timerId = null;
  broadcastTrackingStateChange();
  updateMenu();
}

function updateMenu() {
  if (!tray) return; // Don't try to update if tray doesn't exist

  const contextMenuTemplate = [
    {
      label: 'Show Dashboard',
      click: () => {
        createWindow();
      },
      enabled: !mainWindow || mainWindow.isDestroyed() || !mainWindow.isVisible() // Enable if no window, destroyed, or hidden
    },
    { type: 'separator' },
    {
      label: isTracking ? 'Pause Tracking' : 'Start Tracking',
      click: () => {
        if (isTracking) {
          pauseTracking();
        } else {
          startTracking();
        }
      },
    },
    { type: 'separator' },
    { label: 'Quit Tracklet', click: () => app.quit() },
  ];

  const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);
  tray.setContextMenu(contextMenu);
}

// --- Setup IPC Handlers Function ---
function setupIpcHandlers() {
    ipcMain.handle('settings:get', async () => {
        console.log('Main process: Received settings:get request');
        if (!store) return { intervalMinutes: 30, soundEnabled: true }; // Fallback if store not ready
        return {
            intervalMinutes: store.get('intervalMinutes'),
            soundEnabled: store.get('soundEnabled'),
        };
    });

    ipcMain.handle('settings:save', async (event, settings) => {
        console.log('Main process: Received settings:save request with:', settings);
        if (!store) return { success: false, error: 'Settings store not initialized.' }; // Guard

        try {
            const requestedInterval = parseFloat(settings.intervalMinutes);
            const newInterval = !isNaN(requestedInterval) && requestedInterval >= 0.5 ? requestedInterval : 0.5;
            const newSoundEnabled = !!settings.soundEnabled;

            store.set('intervalMinutes', newInterval);
            store.set('soundEnabled', newSoundEnabled);
            console.log('Settings saved to store.');

            currentIntervalMinutes = newInterval;
            currentSoundEnabled = newSoundEnabled;
            trackingInterval = currentIntervalMinutes * 60 * 1000; 

            console.log(`In-memory settings updated: Interval=${currentIntervalMinutes}min, Sound=${currentSoundEnabled}, IntervalMs=${trackingInterval}`);

            if (isTracking) {
                console.log('Restarting tracking timer with new interval...');
                startTracking(); 
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to save settings:', error);
            return { success: false, error: error.message };
        }
    });

    // --- NEW IPC HANDLERS FOR TRACKING ---
    ipcMain.handle('tracking:start', () => {
        console.log('Main process: Received tracking:start request from renderer.');
        startTracking();
        return true;
    });

    ipcMain.handle('tracking:pause', () => {
        console.log('Main process: Received tracking:pause request from renderer.');
        pauseTracking();
        return true;
    });

    ipcMain.handle('tracking:getStatus', () => {
        console.log(`Main process: Providing tracking status to renderer: ${isTracking}`);
        return isTracking;
    });
    // --- END NEW HANDLERS ---

    ipcMain.handle('log:add', async (event, activity) => {
        return recordLog(activity); // Uses global recordLog
    });

    ipcMain.handle('logs:get', async () => {
        if (!db) {
            console.error('Cannot get logs: Database not available.');
            return []; 
        }
        try {
            console.log('Main process: Received logs:get request');
            const stmt = db.prepare('SELECT id, timestamp, activity FROM logs ORDER BY timestamp DESC');
            const logs = stmt.all();
            console.log(`Returning ${logs.length} logs.`);
            return logs; 
        } catch (error) {
            console.error('Failed to fetch logs:', error);
            return []; 
        }
    });

    ipcMain.on('input:close', () => {
        console.log('Received input:close request.')
        if (inputWindow) {
            inputWindow.hide();
        }
    });
}
// --------------------------------

// --- Setup Tray Function ---
function setupTray() {
    console.log('Creating 1x1 PNG data URL nativeImage...');
    const minimalIconDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const icon = nativeImage.createFromDataURL(minimalIconDataURL);
    if (process.platform === 'darwin') {
        icon.isTemplateImage = true; 
    }
    console.log('1x1 PNG nativeImage created.');

    try {
        console.log('Attempting to create Tray...');
        tray = new Tray(icon);
        console.log('Tray created successfully.');
        tray.setToolTip('Tracklet - Time Tracker');
        console.log('Tooltip set.');
        updateMenu(); // Initial menu setup
        console.log('Initial context menu set.');
    } catch (error) {
        console.error('Error creating tray or setting menu:', error);
    }
}
// -------------------------


// --- App Lifecycle Events ---
app.whenReady().then(async () => {
    console.log('App is ready. Initializing...');
    await initializeApp(); // Run the async initialization
    console.log('Initialization complete.');

    // Optional: Create the main window on startup?
    // createWindow();

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null || mainWindow.isDestroyed()) {
            createWindow();
        } else {
            mainWindow.show();
        }
    });
});

app.on('window-all-closed', (e) => {
    if (process.platform === 'darwin') {
        app.dock?.hide();
    }
    // Don't quit
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
    if (db) {
        db.close();
        console.log('Database connection closed.');
    }
});
// ---------------------------

// --- Deprecated Code/Placeholders (Keep for reference or remove) ---
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

// --- Placeholder Icon Creation ---
// You should replace 'iconTemplate.png' with your actual icon file.
// For testing, create a simple 16x16 png in src/assets/iconTemplate.png
// Example: A small black square.
// If you don't have an image tool handy, you can skip creating the file for now,
// but Electron might show a default icon or no icon.
// Make sure to create an `assets` folder inside `src`.
