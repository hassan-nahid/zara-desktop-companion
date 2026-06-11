# Mate-Engine Bangla Setup Guide

## What's Included

I've created **2 new C# scripts** for Mate-Engine:

### 1. `BengaliTTSHandler.cs`
Adds **Bangla Text-to-Speech** to Mate-Engine's ChatBot. Uses Windows SAPI (built-in) with Google Cloud TTS as fallback.

### 2. `EyeExerciseReminder.cs`
**Eye exercise reminder system** - what you asked for. Triggers every X minutes (default 25), shows floating points on screen. Look at each point for Y seconds (default 20). Great for eye strain prevention.

---

## Step 1: Install Unity Editor

Since you don't have Unity, you need to install it first:

1. Download **Unity Hub** from: https://unity.com/download
2. Open Unity Hub → Go to **Installs** tab → Click **Install Editor**
3. Choose **Unity 2022.3 LTS** or **Unity 2023.3** (Mate-Engine uses Unity 2022+)
4. During installation, include these modules:
   - ✅ **Windows Build Support (IL2CPP)**
   - ✅ **Windows Build Support (Mono)**
   - (Optional) Visual Studio for C# editing

---

## Step 2: Open Mate-Engine Project

1. Download Mate-Engine source from GitHub:
   ```
   https://github.com/shinyflvre/Mate-Engine/archive/refs/heads/main.zip
   ```
2. Extract the ZIP
3. Open **Unity Hub** → **Projects** → **Add** → Select the extracted folder
4. Wait for Unity to import all assets (this takes 5-15 minutes)

---

## Step 3: Add Bangla TTS Support

### Copy the script:
1. Copy `BengaliTTSHandler.cs` to:
   ```
   Assets/MATE ENGINE - Scripts/BengaliTTSHandler.cs
   ```

### Attach to ChatBot:
1. In Unity, find the **ChatBot** GameObject (usually in the scene)
2. Select it → **Add Component** → Search for "Bengali TTS Handler"
3. Configure in Inspector:
   - ✅ Check `Enable Bengali TTS`
   - Set `TTS AudioSource` to the ChatBot's audio source

### Install Bangla Language Pack (for SAPI):
1. Windows: **Settings → Time & Language → Language**
2. Click **Add a language** → Search "Bangla"
3. Install **Bangla (Bangladesh)** or **Bangla (India)**
4. This gives Mate-Engine access to Windows built-in Bangla TTS voice

### Optional: Google Cloud TTS (better voice quality)
1. Go to https://cloud.google.com/text-to-speech
2. Create a project → Enable Text-to-Speech API
3. Create an API key
4. Paste the key into `Google TTS API Key` field
5. Set voice name to `bn-IN-Wavenet-A` (best Bangla voice)

---

## Step 4: Add Eye Exercise Reminder

### Copy the script:
1. Copy `EyeExerciseReminder.cs` to:
   ```
   Assets/MATE ENGINE - Scripts/EyeExerciseReminder.cs
   ```

### Setup in Unity:
1. Right-click in Hierarchy → **UI → Canvas** (name it "ReminderCanvas")
2. Select the Canvas → **Add Component** → "Eye Exercise Reminder"
3. Configure settings:
   - `Reminder Interval Minutes` = 25 (every 25 min)
   - `Point Hold Seconds` = 20 (look at each point for 20s)
   - `Point Count` = 8 (8 points total = ~2.6 min exercise)
4. Optionally add sound effects to `Reminder Start Sound`, `Point Change Sound`

### Access from Existing Menu:
To add a toggle button in Mate-Engine settings:
1. Open `MenuActions.cs` (in Scripts/Settings/)
2. Add this code at the bottom inside the class:
   ```csharp
   public void ToggleEyeReminder(bool enabled)
   {
       var reminder = FindObjectOfType<EyeExerciseReminder>();
       if (reminder != null) reminder.SetReminderEnabled(enabled);
   }
   ```

---

## Step 5: Build the App

1. **File → Build Settings**
2. Make sure **Scene** is added (the main Mate-Engine scene)
3. Click **Build**
4. Choose a folder → Wait for build
5. Run `MateEngine.exe`

---

## Quick Reference: Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **Eye Reminder Interval** | 25 min | How often reminder pops up |
| **Point Hold Time** | 20 sec | How long to look at each point |
| **Point Count** | 8 | Number of points to track |
| **TTS Speed** | 0 | -10 (slow) to +10 (fast) |
| **Enable Bengali TTS** | On | Toggle Bangla voice |

## Troubleshooting

**No Bangla voice in TTS:**
- Install Windows Bangla language pack (Step 3)
- Or use Google Cloud TTS fallback

**Eye reminder not triggering:**
- Check `Reminder Enabled` checkbox
- Default interval is 25 minutes - wait or click "Trigger Now" from code

**Script errors after adding:**
- Make sure `TextMeshPro` is installed (Window → TextMeshPro → Import TMP Essentials)
- Add `TMPro` namespace is included in script (already included)
