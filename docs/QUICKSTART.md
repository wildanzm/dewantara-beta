# 🚀 Quick Start Guide - DEWANTARA Gamification

## ✅ What's Been Implemented (Step 1)

### 📦 New Files Created:

**Context Layer:**

- ✅ `frontend/src/context/GameContext.js` - Global state manager with localStorage

**Data Layer:**

- ✅ `frontend/src/data/levels.js` - Level configurations (5 levels, A-Z letters)

**UI Components:**

- ✅ `frontend/src/components/gamification/AdventureMap.js` - Main map UI
- ✅ `frontend/src/components/gamification/LevelNode.js` - Level cards
- ✅ `frontend/src/components/gamification/FeedbackOverlay.js` - Win screen
- ✅ `frontend/src/components/gamification/ProgressBar.js` - Progress indicator
- ✅ `frontend/src/components/gamification/index.js` - Barrel exports
- ✅ All corresponding CSS files

**Demo/Testing:**

- ✅ `frontend/src/pages/GamificationDemoPage.js` - Interactive demo page

**Integration:**

- ✅ `frontend/src/App.js` - Wrapped with GameProvider

---

## 🧪 Testing Your Implementation

### Step 1: Start the Development Server

```bash
cd frontend
npm start
# or
bun run dev
```

### Step 2: Visit the Demo Page

Navigate to: **http://localhost:3000/demo-gamification**

### Step 3: Test the Features

On the demo page, you can:

1. **View Current Stats:**
    - XP, Stars, Streak, Progress percentage

2. **Test Level Completion:**
    - Click "Complete Level X" buttons
    - Watch the FeedbackOverlay animation
    - See stats update in real-time

3. **Test Persistence:**
    - Complete some levels
    - Refresh the page
    - Verify data persists (check localStorage in DevTools)

4. **Test the Adventure Map:**
    - See locked vs unlocked levels
    - Click on unlocked levels (will show alert for now)
    - Observe star display on completed levels

5. **Test Reset:**
    - Click "Reset Progress" to start fresh

---

## 🔍 Verifying LocalStorage

### Open Browser DevTools (F12):

1. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
2. Find **Local Storage** → **http://localhost:3000**
3. Look for key: `dewantara_user_progress`
4. You should see JSON data like:

```json
{
  "xp": 150,
  "streak": 1,
  "lastLoginDate": "2026-01-19",
  "levelProgress": {
    "level-1": {
      "stars": 3,
      "isUnlocked": true,
      "isCompleted": true,
      "bestTime": 42,
      "attempts": 1
    },
    ...
  }
}
```

---

## 📊 Component Usage Examples

### 1. Using GameContext in Any Component

```jsx
import { useGame } from "../context/GameContext";

function MyComponent() {
	const { xp, streak, getTotalStars, completeLevel } = useGame();

	return (
		<div>
			<p>XP: {xp}</p>
			<p>Stars: {getTotalStars()}/15</p>
			<button onClick={() => completeLevel("level-1", 3, 45)}>Complete Level 1</button>
		</div>
	);
}
```

### 2. Rendering the Adventure Map

```jsx
import { AdventureMap } from "../components/gamification";

function BelajarPage() {
	return (
		<div>
			<h1>Petualangan Belajar</h1>
			<AdventureMap />
		</div>
	);
}
```

### 3. Showing Feedback on Win

```jsx
import { FeedbackOverlay } from "../components/gamification";
import { useState } from "react";

function LevelGameplay() {
	const [showWin, setShowWin] = useState(false);

	const handleWin = () => {
		setShowWin(true);
	};

	return (
		<>
			{/* Your gameplay here */}
			<FeedbackOverlay isVisible={showWin} stars={3} xpEarned={150} completionTime={42} onClose={() => setShowWin(false)} />
		</>
	);
}
```

### 4. Adding Progress Bar to Navbar

```jsx
// In Navbar.js
import { ProgressBar } from "../components/gamification";

function Navbar() {
	return (
		<nav>
			{/* Existing navbar content */}
			<ProgressBar />
		</nav>
	);
}
```

---

## 🎯 Next Steps for Full Integration

### Phase 2: Modify BelajarPage

1. **Replace current UI with AdventureMap:**

    ```jsx
    // BelajarPage.js
    import { AdventureMap } from "../components/gamification";

    return <AdventureMap />;
    ```

2. **Add level-specific route:**
    ```jsx
    // In App.js
    <Route path="/belajar/:levelId" element={<LevelGameplayPage />} />
    ```

### Phase 3: Create LevelGameplayPage

This page should:

- Extract `levelId` from route params
- Load level data from `levels.js`
- Display target letter to learn
- Use existing VideoDisplay + WebSocket detection
- Track when user holds correct sign for 2 seconds
- Trigger win logic and show FeedbackOverlay
- Call `completeLevel()` from GameContext

### Phase 4: Enhance Camera Detection Logic

Modify the existing detection to:

```jsx
const [targetLetter, setTargetLetter] = useState("A");
const [holdTimer, setHoldTimer] = useState(0);
const [currentLetterIndex, setCurrentLetterIndex] = useState(0);

// In onmessage handler:
if (prediction === targetLetter && confidence > 0.8) {
	setHoldTimer((prev) => prev + 0.4); // Increment by interval time

	if (holdTimer >= 2.0) {
		// SUCCESS! Move to next letter
		handleLetterComplete();
	}
} else {
	setHoldTimer(0); // Reset if wrong
}
```

---

## 🐛 Troubleshooting

### Issue: "useGame must be used within GameProvider"

**Solution:** Make sure `GameProvider` wraps your component tree in App.js

### Issue: Data not persisting

**Solution:**

- Check browser console for localStorage errors
- Verify you're not in incognito/private mode
- Check localStorage quota (shouldn't be an issue with this small data)

### Issue: Components not rendering

**Solution:**

- Verify all imports are correct
- Check for CSS conflicts
- Open browser console for errors

### Issue: Animations not working

**Solution:**

- Check if CSS files are imported
- Verify no conflicting CSS from parent components

---

## 📱 Mobile Responsiveness

All components are mobile-responsive:

- Adventure Map: Vertical scroll optimized for mobile
- Level Nodes: Stack vertically on mobile
- Feedback Overlay: Scales down gracefully
- Progress Bar: Compact on small screens

Test on different screen sizes using browser DevTools (F12 → Device Toolbar).

---

## 🎨 Customization Tips

### Change Colors:

Edit `levels.js` - each level has a `color` property:

```javascript
{
  id: 'level-1',
  color: '#4CAF50', // Change this!
  ...
}
```

### Adjust XP Rewards:

In `GameContext.js`:

```javascript
const xpReward = stars * 50; // Change multiplier here
```

### Modify Star Calculation:

In `levels.js`:

```javascript
export const calculateStars = (completionTime, mistakes = 0) => {
	// Customize thresholds here
	if (mistakes === 0 && completionTime < 30) return 3;
	if (mistakes <= 2 && completionTime < 60) return 2;
	return 1;
};
```

---

## 🎉 Success Checklist

- ✅ GameContext loads without errors
- ✅ Demo page displays correctly
- ✅ Can complete levels and see stats update
- ✅ Data persists after page refresh
- ✅ FeedbackOverlay shows confetti animation
- ✅ Adventure Map displays 5 levels
- ✅ Level 1 is unlocked by default
- ✅ Other levels are locked initially
- ✅ Completing Level 1 unlocks Level 2

---

## 📞 Need Help?

Check the comprehensive documentation in:

- `GAMIFICATION_README.md` - Full API reference
- Browser console logs - GameContext logs all actions
- React DevTools - Inspect GameContext state

---

**Status:** 🎉 Step 1 Complete and Ready to Test!  
**Demo URL:** http://localhost:3000/demo-gamification
