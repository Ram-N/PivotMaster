# PivotMaster

**PivotMaster** is a simple web-based 2D puzzle game where the player moves a heavy square (representing a chair) by **pivoting it around one of its corners**. The goal is to move the chair from its starting position to a target location and orientation using **as few moves as possible**.

## Core Gameplay Concept

- The game is viewed **top-down** (2D canvas).
- The chair is represented by a **square with four visible corners**.
- The player **clicks on one of the corners** to select it as the **pivot point**.
- **Concentric circles** appear, showing possible swing paths for the chair.
- The player **hovers** along these paths and gets a **real-time preview (ghost square)** of the potential new position.
- On **clicking a target point**, the chair **animates its rotation** to that position.
- The **move counter increments** only after the rotation completes.
- The game **keeps a trail of all previous chair positions** (shown as faint outlines).

## Current Features (as of June 26, 2025)

- Click-based **pivot point selection**.
- **Visual pivot circles** for guidance.
- **Live ghost preview** following mouse hover.
- **Animated chair rotation** to new position.
- **Accurate move counter**.
- **Persistent history trail** showing all past chair positions.

## Technology Used

- **HTML5 Canvas**
- **Vanilla JavaScript**
- **Basic CSS + HTML**

## Directory Structure
```
pivotmaster/
├── index.html
├── style.css
├── script.js
└── README.md

```