# Vocabulary Floating Widget

A beautiful floating vocabulary widget that displays vocabulary words from your Flutter app with auto-rotation, always-on-top functionality, and smooth animations. Features Hack Não brand colors and enhanced navigation controls.

## Features

- 🌟 **Always on Top**: Stay visible while you work
- 🔄 **Auto Rotation**: Changes vocabulary every 5 minutes
- 🎯 **Draggable & Resizable**: Position anywhere on screen
- 📱 **Minimizable**: Collapse to a small floating icon
- 🎨 **Hack Não Design**: Official Hack Não blue and orange colors
- 📊 **Progress Tracking**: Visual timer and progress bar
- 🔍 **Live Updates**: Automatically syncs with Flutter app data
- ⚡ **Enhanced Navigation**: Large, prominent next/back buttons with animations
- 🎮 **Demo Mode**: Includes sample vocabulary for testing

## Installation

1. **Prerequisites**
   - Node.js (version 16 or higher)
   - NPM or Yarn

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Development Mode**
   ```bash
   npm run dev
   ```

4. **Production Build**
   ```bash
   npm start
   ```

5. **Create Installer**
   ```bash
   npm run build
   ```

## Data Source

The widget automatically reads vocabulary data from your Flutter app's storage:
```
C:\Users\[username]\AppData\Roaming\com.example\english_vocab_app\shared_preferences.json
```

## Controls

### Header Controls
- 📌 **Pin Button**: Toggle always-on-top behavior  
- ➖ **Minimize**: Collapse to floating icon
- ✕ **Close**: Exit the application

### Enhanced Navigation Controls
- ◀ **Previous**: Go to previous vocabulary (large orange button with animation)
- ▶ **Next**: Go to next vocabulary (large orange button with animation)
- ⏸️ **Pause**: Pause/resume auto-rotation

## Color Scheme

The app uses the official **Hack Não** brand colors:
- **Primary Blue**: #1e3a8a (Main background)
- **Accent Orange**: #f97316 (Buttons, borders, highlights)
- **Clean Design**: No gradients, solid professional colors

## Usage

1. Launch the widget
2. Position it anywhere on your screen
3. The widget will automatically:
   - Load vocabulary from your Flutter app
   - Display word, pronunciation, meaning, and memory tips
   - Rotate to next word every 5 minutes
   - Update when new vocabulary is added

## Customization

### Timer Settings
Edit `renderer/script.js` to change rotation interval:
```javascript
this.rotationInterval = 5 * 60 * 1000; // 5 minutes (in milliseconds)
```

### Styling
Modify `renderer/styles.css` to customize appearance:
- Colors and gradients
- Fonts and sizing
- Animations and effects

## Technical Details

- **Framework**: Electron
- **UI**: HTML5 + CSS3 + Vanilla JavaScript
- **File Watching**: Chokidar for real-time data sync
- **Window Management**: Frameless, transparent, always-on-top
- **Memory Usage**: ~50-80MB
- **Platform**: Windows (primary), macOS, Linux compatible

## File Structure

```
vocabulary-floating-widget/
├── main.js                 # Electron main process
├── package.json           # Dependencies and scripts
├── renderer/
│   ├── index.html         # Widget UI structure
│   ├── styles.css         # Styling and animations
│   └── script.js          # Widget logic and functionality
├── assets/
│   └── icon.ico          # Application icon
└── README.md             # This file
```

## Troubleshooting

### Widget shows "No vocabulary data found"
- Ensure your Flutter app has vocabulary data
- Check the file path in main.js matches your system
- Verify JSON file exists and is readable

### Widget not staying on top
- Click the pin button (📌) to enable always-on-top
- Check if other apps have higher priority

### Performance issues
- Close unused applications
- Reduce rotation frequency
- Minimize other Electron apps

## Development

### Debug Mode
```bash
npm run dev
```
This opens DevTools for debugging.

### Building for Distribution
```bash
npm run build
```
Creates installer in `dist/` folder.

### Adding Features
1. Modify UI in `renderer/index.html`
2. Add styling in `renderer/styles.css`
3. Implement logic in `renderer/script.js`
4. Handle IPC in `main.js` if needed

## License

MIT License - Feel free to modify and distribute.

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

---

**Enjoy learning vocabulary with your floating widget!** 📚✨
