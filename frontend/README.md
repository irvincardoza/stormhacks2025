# Tracklet - Time Tracking Electron App

A sleek, cross-platform desktop application for tracking your daily activities and productivity. Tracklet runs in your system tray and gently reminds you to log what you're working on at regular intervals.

## ✨ Features

### Core Functionality
- **System Tray Integration**: Minimalist tray icon that stays out of your way
- **Periodic Reminders**: Configurable intervals (30 minutes default) to log activities
- **Quick Activity Logging**: Floating input window for instant activity logging
- **Activity Dashboard**: Beautiful timeline view of your productivity journey
- **Local Data Storage**: SQLite database for offline-first experience

### User Experience
- **Cross-Platform Support**: Seamless experience on macOS, Windows, and Linux
- **Dark Theme**: Modern, eye-friendly dark interface
- **Keyboard Shortcuts**: Quick access to common actions
- **Activity Suggestions**: Pre-filled activity buttons for common tasks
- **Statistics Overview**: Track total entries and daily progress

### Technical Features
- **Persistent Notifications**: macOS uses native input windows, other platforms use system notifications
- **Settings Management**: Customizable notification intervals and sound preferences
- **Real-time Updates**: Live dashboard updates when new activities are logged
- **Memory Efficient**: Optimized for continuous background operation

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Quick Start
1. **Clone and navigate to the project**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

The app will start and appear in your system tray. Click the tray icon to access the dashboard and controls.

## 📖 Usage

### Basic Operation
1. **Start Tracking**: Click "Start Tracking" in the tray menu or dashboard
2. **Log Activities**: When reminded, enter what you're working on in the floating window
3. **View Progress**: Open the dashboard to see your activity timeline and statistics
4. **Customize Settings**: Adjust notification intervals and sound preferences in settings

### Tray Menu Options
- **Show Dashboard**: Open the main activity timeline view
- **Start/Pause Tracking**: Control activity reminders
- **Quit Tracklet**: Exit the application

### Activity Logging
- **Manual Logging**: Click tray icon → Show Dashboard → Use the main interface
- **Reminder Logging**: Respond to periodic notifications with the floating input window
- **Quick Suggestions**: Use preset activity buttons (Coding, Meeting, Research, Planning)

## 🛠️ Development

### Project Structure
```
frontend/
├── src/
│   ├── index.js          # Main Electron process
│   ├── index.html        # Dashboard UI
│   ├── input.html        # Floating input window
│   ├── renderer.js       # Dashboard frontend logic
│   ├── inputRenderer.js  # Input window frontend logic
│   ├── preload.js        # Main window security preload
│   ├── inputPreload.js   # Input window security preload
│   ├── index.css         # Tailwind CSS styles
│   └── main.css          # Additional styles
├── build-css.js          # CSS build script
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

### Development Setup
1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start in development mode**:
   ```bash
   npm start
   ```

3. **Build CSS** (automatically runs with start):
   ```bash
   npm run build-css
   ```

### Available Scripts
- `npm start` - Start the application in development mode
- `npm run build-css` - Build and optimize CSS
- `npm run package` - Create distributable packages
- `npm run make` - Create platform-specific installers
- `npm run lint` - Run linting (placeholder)

### Building for Production
```bash
# Create distributable package
npm run package

# Create platform installer (Windows/Linux)
npm run make

# Create macOS .app bundle
npm run make
```

## ⚙️ Configuration

### Settings
- **Notification Interval**: 0.5 - 60 minutes (default: 30 minutes)
- **Sound Notifications**: Enable/disable audio alerts
- **Database Location**: Automatically managed in user data directory

### Data Storage
- Activity logs stored in SQLite database
- Settings persisted using electron-store
- Database location: `{userData}/tracklet.db`

## 🔧 Technologies Used

- **Electron**: Cross-platform desktop application framework
- **SQLite3**: Local database for activity storage
- **Tailwind CSS**: Modern utility-first CSS framework
- **Node.js**: JavaScript runtime for backend logic
- **HTML/CSS/JavaScript**: Frontend interface technologies

## 🎯 Key Components

### Main Process (`index.js`)
- Application lifecycle management
- System tray integration
- Database operations
- IPC communication handling

### Dashboard (`index.html` + `renderer.js`)
- Activity timeline visualization
- Statistics display
- Settings management interface

### Input Window (`input.html` + `inputRenderer.js`)
- Floating activity logging interface
- Quick suggestion buttons
- Cross-platform notification handling

## 🐛 Troubleshooting

### Common Issues
- **Tray icon not showing**: Ensure system supports tray icons
- **Notifications not appearing**: Check system notification settings
- **Database errors**: Check file permissions in user data directory

### Debug Mode
Uncomment the DevTools line in `index.js` to open developer tools:
```javascript
// mainWindow.webContents.openDevTools();
```

## 📝 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Rushik B.** - rushikbusiness@gmail.com

A productivity tool designed to help developers and knowledge workers track their daily activities without friction.

---

**Note**: This application stores all data locally and respects user privacy. No data is transmitted to external servers.
