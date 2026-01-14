# FitTrack Pro 💪

A beautiful, mobile-first fitness tracking app to manage your gym routine and diet plan.

## Features

- 📱 **Mobile-Optimized**: Designed for easy use on your phone at the gym
- 🏋️ **Gym Routine Tracker**: View your daily workout routine with dropdown categories
- 🥗 **Diet Planner**: Track your daily meals with macros and calories
- 🌙 **Dark Theme**: Easy on the eyes with a modern dark design
- ⚡ **Fast & Lightweight**: Pure HTML, CSS, and JavaScript - no frameworks needed

## How to Use

1. Select **GYM** or **DIET** from the main tabs
2. Choose the day you want to view
3. Click on any category/meal to expand the dropdown
4. Track your exercises or meals for the day

## Deployment

### GitHub Pages

1. Push this repository to GitHub
2. Go to **Settings** → **Pages**
3. Under "Source", select **main** branch and **/ (root)** folder
4. Click **Save**
5. Your site will be live at `https://yourusername.github.io/fitness-app/`

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in this directory
3. Follow the prompts
4. Your site will be deployed automatically

### Local Development

You can use any static file server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve .

# Using VS Code Live Server extension
# Just right-click index.html and select "Open with Live Server"
```

Then open `http://localhost:8000` in your browser.

## Customizing Your Data

### Gym Routine
Edit `data/gym-routine.json` to update your workout plan.

### Diet Plan
Edit `data/diet-plan.json` to update your meal plan.

## File Structure

```
fitness-app/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── app.js              # Application logic
├── data/
│   ├── gym-routine.json    # Your gym workout data
│   └── diet-plan.json      # Your diet plan data
└── README.md           # This file
```

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables, gradients, and animations
- **Vanilla JavaScript** - No dependencies required

---

Made with ❤️ for your fitness journey