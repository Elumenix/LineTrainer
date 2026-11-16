# Line Trainer

A browser-based practice tool for learning to judge where a line is heading. Built for beginner artists working on perspective drawing.

https://github.com/user-attachments/assets/36bccd3a-3b6a-4909-b5e9-70571b53f2aa

## Why this exists

When you start learning perspective, it's hard to predict where a line will end up from two points or from its angle, and following it by eye tends to drift. Line Trainer gives you quick, repeatable practice at that, with immediate visual feedback showing how close you were.

## Modes

**Box mode**
Based on the "Y" construction from [Drawabox](https://drawabox.com/): you're given the three lines that make up the corner of a box closest to the viewer, each of variable length with at least 90° between each pair of arms. Place the three corners, then the back corner. The app then extends your lines so you can see whether they converge on a consistent vanishing point.

**Line extension mode**
A short line is drawn with a marker on each end, showing which end is the start and which is the continuation. Click where you think the line would pass further along the canvas. The app then draws the true extension so you can see how far off you were.

## Tech

- TypeScript and HTML canvas, no framework
- Vite for the build
- GitHub Actions deploys to GitHub Pages on every push

Most of the logic is geometry: generating valid random starting conditions, computing line extensions and vanishing points, and mapping canvas input to those calculations.

## Running locally

    npm install
    npm run dev

## Project structure

    src/
    ├── main.ts          # Entry point
    ├── state.ts         # Application state
    ├── canvas/          # Canvas setup and rendering (all geometry lives here)
    ├── input/           # Mouse handling
    └── ui/              # Button handling
    .github/workflows/   # Deploy to GitHub Pages

All randomness and geometry (generating valid starting Ys and lines, computing extensions and vanishing points) live in `canvas/renderer.ts`. Input, UI, and state code only send it generic draw and reset requests, apart from handling specific mouse input.


