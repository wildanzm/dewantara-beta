# 🎮 Quick Demo Guide - Phase 2

## 🚀 Start Everything

### Terminal 1: Backend

```bash
cd backend
python main.py
```

**Expected:** `Uvicorn running on http://127.0.0.1:8000`

### Terminal 2: Frontend

```bash
cd frontend
npm start
# or
bun run dev
```

**Expected:** Opens `http://localhost:3000`

---

## 📍 Navigate the App

### Step 1: Visit Belajar Page

**URL:** `http://localhost:3000/belajar`

**What you'll see:**

```
┌─────────────────────────────────────────────────┐
│  🗺️ Petualangan Belajar BISINDO                │
│  Pilih level untuk memulai petualangan...      │
├─────────────────────────────────────────────────┤
│  ⭐ 0/15    🔥 1 hari    ✨ 0 XP               │
├─────────────────────────────────────────────────┤
│                                                  │
│      🌴 Pulau Awal                              │
│      Huruf A - E                                │
│      [✓] Unlocked, clickable                   │
│                                                  │
│      🌲 Hutan Misteri                           │
│      Huruf F - J                                │
│      [🔒] Locked, greyed out                   │
│                                                  │
│      ... (3 more levels locked)                 │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Step 2: Click Level 1 (Pulau Awal)

**What happens:**

1. Navigates to `/play/level-1`
2. Shows loading popup
3. Requests camera permission
4. Connects to WebSocket
5. Shows "Kamera Aktif!" success

---

## 🎮 Gameplay Screen

```
┌─────────────────────────────────────────────────┐
│  ← Back to Map    🌴 Pulau Awal                │
│                   Huruf A - E                   │
├─────────────────────────────────────────────────┤
│  Progress Section                               │
│  ┌───────────────────────────────────────────┐ │
│  │ Huruf 1 dari 5                       20% │ │
│  │ ▓▓▓▓░░░░░░░░░░░░░░░░                     │ │
│  │ [A●] [B] [C] [D] [E]                     │ │
│  └───────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│  Target Letter Card                             │
│  ┌───────────────────────────────────────────┐ │
│  │ Tunjukkan Huruf:                          │ │
│  │         A                                 │ │
│  │ Pastikan tanganmu terlihat jelas          │ │
│  └───────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│  Video Display                                  │
│  ┌───────────────────────────────────────────┐ │
│  │  [Camera Feed]                            │ │
│  │  ┌─────────────┐    ┌─────┐              │ │
│  │  │ Posisikan   │    │  A  │ [Badge]      │ │
│  │  │ tangan di   │    │ 95% │              │ │
│  │  │ sini (guide)│    └─────┘              │ │
│  │  └─────────────┘                          │ │
│  │                                            │ │
│  │    [Progress Ring - filling up]           │ │
│  │           75%                              │ │
│  │         Tahan!                             │ │
│  └───────────────────────────────────────────┘ │
│  ● Kamera Aktif          Target: A            │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Test the Hold Logic

### Scenario 1: Correct Sign

1. Make sign for "A"
2. **Prediction badge turns GREEN**
3. Shows "A" with "95%" confidence
4. **Progress ring appears** (golden circle)
5. Ring fills: 25% → 50% → 75% → 100%
6. Takes exactly 2 seconds
7. **At 100%:** Confetti appears! 🎉
8. **After 2s:** Auto-advances to "B"

### Scenario 2: Wrong Sign

1. Make sign for "B" (but target is "A")
2. Badge shows "B" but stays BLUE (detecting)
3. No progress ring appears
4. Change to correct sign "A"
5. Badge turns GREEN
6. Progress ring starts filling

### Scenario 3: Low Confidence

1. Make unclear/partial sign
2. Badge shows "A" but confidence only 65%
3. No progress ring (needs > 80%)
4. Improve hand position
5. Confidence increases to 90%
6. Progress ring starts

---

## 📊 Complete a Full Level

### Letter by Letter:

**Letter A:**

- Make sign, hold 2s → ✓
- Progress: 20%, Trail: [A✓] [B●] [C] [D] [E]

**Letter B:**

- Make sign, hold 2s → ✓
- Progress: 40%, Trail: [A✓] [B✓] [C●] [D] [E]

**Letter C:**

- Make sign, hold 2s → ✓
- Progress: 60%, Trail: [A✓] [B✓] [C✓] [D●] [E]

**Letter D:**

- Make sign, hold 2s → ✓
- Progress: 80%, Trail: [A✓] [B✓] [C✓] [D✓] [E●]

**Letter E (Final):**

- Make sign, hold 2s → ✓
- Progress: 100%
- **Level Complete Modal appears!**

---

## 🏆 Level Complete

```
┌─────────────────────────────────────────────────┐
│                    🎉                            │
│                                                  │
│            Level Selesai!                        │
│            Pulau Awal                            │
│                                                  │
│     [A] [B] [C] [D] [E]                         │
│     (all letters shown as badges)                │
│                                                  │
│  Luar biasa! Kamu telah menguasai               │
│  5 huruf BISINDO!                               │
│                                                  │
│     [Lanjut Petualangan →]                      │
│                                                  │
└─────────────────────────────────────────────────┘
```

Click button → Returns to `/belajar`

---

## 🗺️ Back to Map (Updated)

```
Adventure Map now shows:

🌴 Pulau Awal
   Huruf A - E
   ⭐⭐⭐ (3 stars earned!)
   [✓] Completed badge

🌲 Hutan Misteri
   Huruf F - J
   ☆☆☆
   [Unlocked! Colorful, clickable]

⛰️ Gunung Tantangan
   Huruf K - O
   [🔒 Still locked]
```

**Stats Updated:**

- XP: 0 → 150 (+150)
- Stars: 0/15 → 3/15
- Level 2: Unlocked ✓

---

## 🔍 Verify in DevTools

### Console Logs:

```
✅ User progress loaded from localStorage
✅ WebSocket connected
💾 Progress saved to localStorage
🎮 Level level-1 completed!
💾 Progress saved to localStorage
```

### localStorage:

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
			"bestTime": 45,
			"attempts": 1
		},
		"level-2": {
			"stars": 0,
			"isUnlocked": true,
			"isCompleted": false,
			"bestTime": null,
			"attempts": 0
		}
	}
}
```

---

## 📱 Test on Mobile

### Chrome DevTools:

1. Press F12
2. Click device icon (Ctrl+Shift+M)
3. Select "iPhone 12 Pro" or similar
4. Test the flow

**Expected:**

- ✅ Layout stacks vertically
- ✅ Target letter still large and readable
- ✅ Video fits screen width
- ✅ Progress ring visible and smooth
- ✅ Buttons are touch-friendly
- ✅ No horizontal scroll

---

## 🎥 Visual States to Observe

### VideoDisplay States:

**1. Initial (No prediction):**

- Grey camera feed
- Guide box visible (dashed)
- No badge
- Status: "Kamera Aktif"

**2. Detecting (wrong sign):**

- Badge appears: "B" with "85%"
- Badge is BLUE
- No progress ring
- Target shows: "A"

**3. Correct (holding):**

- Badge: "A" with "95%"
- Badge is GREEN and pulsing
- Progress ring appears
- Ring filling: 0% → 100%
- "Tahan!" text visible

**4. Success:**

- Confetti animation
- FeedbackOverlay modal
- Stars animate in
- XP shown: "+10"
- Auto-closes after 2s

---

## 🐛 Common Issues & Fixes

### Issue: Camera won't start

**Check:**

- Backend running on port 8000?
- Camera permission granted?
- Not in incognito mode?
- No other app using camera?

### Issue: WebSocket fails

**Check:**

- Backend console shows connection?
- URL is `ws://localhost:8000/ws`?
- Firewall not blocking?

### Issue: No prediction/confidence

**Check:**

- Backend AI model loaded?
- Frames being sent? (check Network tab)
- Hand visible in frame?

### Issue: Progress ring doesn't appear

**Check:**

- Prediction matches target?
- Confidence > 80%?
- Hand steady (not moving too much)?

---

## ✅ Success Checklist

After testing, you should have:

- ✅ Completed Level 1 (A-E)
- ✅ Earned 3 stars
- ✅ Gained 150 XP
- ✅ Unlocked Level 2
- ✅ Seen smooth animations
- ✅ Experienced hold detection
- ✅ Verified data persistence
- ✅ Tested mobile responsive

---

## 🎉 You're Ready!

The gamification system is fully functional!

**Next actions:**

1. Test all 5 levels
2. Try different star ratings (speed test)
3. Share with team for feedback
4. Deploy to staging environment

**Enjoy the journey!** 🚀

---

_Quick Demo Guide v2.0_  
_Created: January 19, 2026_
