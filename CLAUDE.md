# CLAUDE.md

## Tech Stack

- Plain HTML, CSS, and JavaScript only.
- No frameworks or libraries (no React, Vue, Tailwind, jQuery, etc.).
- No build step: files are opened or served exactly as written.

## Project Structure

```
/
├── CLAUDE.md              # This file: instructions for Claude
├── index.html             # Portal homepage: header, intro, grid of tool cards
├── css/style.css          # Shared styles and light/dark colour variables
├── js/theme.js            # Shared light/dark theme toggle
└── tools/
    └── robot-arm/         # 2-link robot arm tool
        ├── index.html     # Tool page: settings, drawing, working-out
        ├── arm.css        # Layout and drawing styles for this tool
        └── arm.js         # Maths, SVG drawing, step-by-step working-out
```

As files are added, keep this section up to date.

## Key Requirements

1. Every page must be responsive and work on desktop, tablet, and phone.
2. Users can toggle between a light and a dark theme. The default is the light theme.
3. Text must stay easy to read, with good contrast, in both the light and the dark theme.

## Rules for Claude

- Explain technical terms in plain language.
- Ask before making big changes.
- When something is unclear, ask rather than guess.

## Feature Plan

A web portal where robotics students try out small interactive web tools.

### Portal structure

- **Homepage** (`/index.html`): site name, theme toggle, a short intro, and a grid of tool cards (title + one-line description).
- **Opening a tool:** clicking a card opens that tool's own page.
- **Getting back:** every tool page has the same header as the homepage. The site name links home, and a "← All tools" link sits above the tool.
- **Adding a tool later:** create a folder `/tools/<tool-name>/` with its own `index.html` (plus any JS/CSS it needs), then add one card for it on the homepage. Shared styles and the theme toggle live in `/css/` and `/js/` and are reused by every page.

### Phases

**Phase 1: Portal + first tool**
- [x] Homepage with one tool card, shared header, light/dark theme toggle.
- [x] 2-link robot arm tool (`/tools/robot-arm/`):
  - In: two arm lengths in cm and two joint angles (sliders + number boxes). θ1 is measured from the x-axis, θ2 from link 1.
  - Out: tip position (x, y), a live drawing of the arm, and step-by-step working-out written for high-school students.

**Phase 2: More tools**
- Add further robotics tools one at a time, each following the folder pattern above. Which tools is still to be decided.

**Phase 3: Grow the portal**
- Once there are enough tools, consider grouping them by topic or adding search. To be decided.
