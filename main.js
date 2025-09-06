const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

// -------------------------------------------------------------
// Environment / configuration loading
// - We allow overriding the vocabulary data file via environment
//   variable (VOCAB_PATH or VOCAB_JSON) or a local .env file.
// - This makes it explicit that this widget is a companion to the
//   english_vocab_app repository.
// -------------------------------------------------------------
try {
  const envFile = path.join(__dirname, '.env');
  if (fs.existsSync(envFile)) {
    const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      if (!line || line.trim().startsWith('#')) continue;
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m) {
        const key = m[1];
        let value = m[2].trim();
        // Strip optional surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    }
  }
} catch (e) {
  console.log('Failed to parse .env file:', e.message);
}

// Keep a global reference of the window object
let mainWindow;
let windowState = {
  x: 100,
  y: 100,
  width: 300, // reduced default width for compact layout
  height: 200,
  isMinimized: false,
  alwaysOnTop: true,
  normalWidth: 300,
  normalHeight: 200,
  normalX: 100,
  normalY: 100
};

// Default vocabulary data path (Flutter shared_preferences JSON from english_vocab_app)
const defaultVocabularyPath = path.join(require('os').homedir(), 'AppData', 'Roaming', 'com.example', 'english_vocab_app', 'shared_preferences.json');

function resolveVocabularyPath() {
  const override = process.env.VOCAB_PATH || process.env.VOCAB_JSON;
  if (override) {
    if (fs.existsSync(override)) {
      return override;
    } else {
      console.log('[vocab] Provided VOCAB_PATH does not exist:', override);
    }
  }
  return defaultVocabularyPath;
}

let vocabularyPath = resolveVocabularyPath();

function createWindow() {
  // Load saved window state
  loadWindowState();

  // Force a more compact width if previously larger than 320
  if (windowState.width > 320) {
    windowState.width = 300;
    windowState.normalWidth = 300;
  }

  // Always start at bottom-right of primary display (override saved position)
  try {
    const display = screen.getPrimaryDisplay();
    const work = display.workArea; // work area excludes taskbar
    const margin = 16;
    const w = windowState.width || 350;
    const h = windowState.height || 200;
    windowState.x = work.x + work.width - w - margin;
    windowState.y = work.y + work.height - h - margin;
  } catch (e) {
    // Fallback silently if screen info unavailable
  }

  // Create the browser window
  mainWindow = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
  minWidth: 240, // allow smaller manual resize
    minHeight: 150,
    frame: false,
    transparent: true,
    alwaysOnTop: windowState.alwaysOnTop,
    resizable: true,
    skipTaskbar: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  // Load the app
  mainWindow.loadFile('renderer/index.html');

  // Handle window events
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('moved', saveWindowState);
  mainWindow.on('resized', saveWindowState);

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // Watch vocabulary file for changes
  watchVocabularyFile();
}

function loadWindowState() {
  try {
    const stateFile = path.join(__dirname, 'window-state.json');
    if (fs.existsSync(stateFile)) {
      const savedState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      windowState = { ...windowState, ...savedState };
    }
  } catch (error) {
    console.log('Failed to load window state:', error);
  }
}

function saveWindowState() {
  if (!mainWindow) return;
  // Don't persist minimized size
  if (windowState.isMinimized) return;
  const bounds = mainWindow.getBounds();
  windowState = {
    ...windowState,
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    normalWidth: bounds.width,
    normalHeight: bounds.height
  };

  try {
    fs.writeFileSync(
      path.join(__dirname, 'window-state.json'),
      JSON.stringify(windowState, null, 2)
    );
  } catch (error) {
    console.log('Failed to save window state:', error);
  }
}

function watchVocabularyFile() {
  if (!vocabularyPath) return;
  if (fs.existsSync(vocabularyPath)) {
    const watcher = chokidar.watch(vocabularyPath, { ignoreInitial: true });
    watcher.on('change', () => {
      if (mainWindow) {
        mainWindow.webContents.send('vocabulary-updated');
      }
    });
  } else {
    console.log('[vocab] Vocabulary file not found at startup:', vocabularyPath);
  }
}

// App event handlers
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('get-vocabulary-data', async () => {
  try {
    // Re-resolve each request in case user created the file later or updated env
    vocabularyPath = resolveVocabularyPath();
    if (!fs.existsSync(vocabularyPath)) {
      return { success: false, data: null, error: 'Vocabulary file not found. Open english_vocab_app to generate shared_preferences.json.' };
    }

    const data = fs.readFileSync(vocabularyPath, 'utf8');
    const parsed = JSON.parse(data);

    const today = new Date().toISOString().split('T')[0];
    const todayKey = `flutter.vocabulary_data_${today}`;

    if (parsed[todayKey]) {
      const vocabularies = JSON.parse(parsed[todayKey]);
      return { success: true, data: vocabularies };
    }

    const dates = Object.keys(parsed)
      .filter(key => key.startsWith('flutter.vocabulary_data_'))
      .sort()
      .reverse();

    if (dates.length > 0) {
      const vocabularies = JSON.parse(parsed[dates[0]]);
      return { success: true, data: vocabularies };
    }

    return { success: false, data: null, error: 'No vocabulary data found in file.' };
  } catch (error) {
    return { success: false, data: null, error: error.message };
  }
});

ipcMain.handle('toggle-always-on-top', () => {
  if (mainWindow) {
    windowState.alwaysOnTop = !windowState.alwaysOnTop;
    mainWindow.setAlwaysOnTop(windowState.alwaysOnTop);
    saveWindowState();
    return windowState.alwaysOnTop;
  }
  return false;
});

ipcMain.handle('minimize-window', () => {
  if (!mainWindow) return false;

  if (!windowState.isMinimized) {
    // Store current normal bounds
    const bounds = mainWindow.getBounds();
    windowState.normalWidth = bounds.width;
    windowState.normalHeight = bounds.height;
    windowState.normalX = bounds.x;
    windowState.normalY = bounds.y;
    // Allow shrinking smaller than original min size
    mainWindow.setMinimumSize(60, 60);
    // Position to bottom-right of current display work area
    const display = screen.getDisplayMatching(bounds);
    const work = display.workArea; // excludes taskbar
    const targetSize = { w: 60, h: 60 };
    const margin = 16;
    const targetX = work.x + work.width - targetSize.w - margin;
    const targetY = work.y + work.height - targetSize.h - margin;
    mainWindow.setSize(targetSize.w, targetSize.h);
    mainWindow.setPosition(targetX, targetY);
    windowState.isMinimized = true;
  } else {
    // Restore min size and normal size
    mainWindow.setMinimumSize(280, 150);
    mainWindow.setSize(windowState.normalWidth || 350, windowState.normalHeight || 200);
    if (typeof windowState.normalX === 'number' && typeof windowState.normalY === 'number') {
      mainWindow.setPosition(windowState.normalX, windowState.normalY);
    }
    windowState.isMinimized = false;
  }
  // Save only position (size save skipped when minimized)
  saveWindowState();
  return windowState.isMinimized;
});

ipcMain.handle('close-app', () => {
  app.quit();
});
