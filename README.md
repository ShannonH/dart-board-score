# Dart Board Score Keeper

A web-based dart scoring application for iPad Safari that supports Cricket and x01 games.

## Features

- **Two Game Modes:**
  - Cricket (15-20 + Bull)
  - x01 (301, 501, 701)

- **Two Input Methods:**
  - Interactive dartboard (tap on segments)
  - Button-based input with multiplier selection

- **Multi-Player Support:**
  - Up to 4 players
  - Customizable player names

- **Score Tracking:**
  - Real-time scoreboard
  - Turn history
  - Undo functionality

## Live Demo

Visit: [https://shannonh.github.io/dart-board-score/](https://shannonh.github.io/dart-board-score/)

## Usage

1. Select game type (x01 or Cricket)
2. Choose starting score (for x01 games)
3. Select number of players (1-4)
4. Enter player names
5. Click "Start Game"
6. Use either the dartboard or button interface to record scores
7. Switch between input modes using the "Switch Input" button

## Deployment

This app is configured for GitHub Pages deployment:

1. The app is built with pure HTML, CSS, and JavaScript (no build step required)
2. GitHub Pages is configured to serve from the root directory
3. Access the app at: `https://[username].github.io/dart-board-score/`

## Local Development

Simply open `index.html` in a web browser:

```bash
open index.html
```

Or use a local web server:

```bash
python -m http.server 8000
# Then visit http://localhost:8000
```

## iPad Optimization

- Designed for iPad Safari with touch-friendly interface
- Responsive design works on various screen sizes
- No scrolling required during gameplay
- Large, tappable buttons and dartboard segments