import { useState } from "react";
import { useSettingsStore } from "../../stores/settingsStore";
import { useRelationshipStore, MOODS } from "../../stores/relationshipStore";

const SettingsPanel = ({ isOpen, onClose }) => {
  const settings = useSettingsStore();
  const { mood, loveMeter, angerMeter, resetMood } = useRelationshipStore();
  const [activeTab, setActiveTab] = useState("ai");

  if (!isOpen) return null;

  const tabs = [
    { key: "ai", label: "🤖 AI" },
    { key: "voice", label: "🔊 Voice" },
    { key: "display", label: "🖥️ Display" },
    { key: "reminder", label: "⏰ Reminder" },
    { key: "dance", label: "💃 Dance" },
    { key: "mood", label: "💜 Mood" },
  ];

  return (
    <div
      style={{
        width: "380px",
        maxHeight: "560px",
        background: "rgba(15, 15, 30, 0.97)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: "1px solid rgba(167, 139, 250, 0.2)",
        boxShadow: "0 8px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(167, 139, 250, 0.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        animation: "slideIn 0.3s ease-out",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#fff", fontSize: "16px", fontWeight: "600" }}>
          ⚙️ Zara Settings
        </span>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "none",
            color: "#888",
            fontSize: "16px",
            cursor: "pointer",
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          overflowX: "auto",
          flexShrink: 0,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 12px",
              background:
                activeTab === tab.key ? "rgba(167, 139, 250, 0.15)" : "transparent",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid #a78bfa" : "2px solid transparent",
              color: activeTab === tab.key ? "#a78bfa" : "#666",
              fontSize: "11px",
              fontWeight: activeTab === tab.key ? "600" : "400",
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
        {activeTab === "ai" && <AITab settings={settings} />}
        {activeTab === "voice" && <VoiceTab settings={settings} />}
        {activeTab === "display" && <DisplayTab settings={settings} />}
        {activeTab === "reminder" && <ReminderTab settings={settings} />}
        {activeTab === "dance" && <DanceTab settings={settings} />}
        {activeTab === "mood" && <MoodTab mood={mood} loveMeter={loveMeter} angerMeter={angerMeter} resetMood={resetMood} />}
      </div>
    </div>
  );
};

// ===== AI Tab =====
const AITab = ({ settings }) => (
  <SettingsForm>
    <SettingInput
      label="Gemini API Key"
      type="password"
      value={settings.geminiApiKey}
      onChange={settings.setGeminiApiKey}
      placeholder="Enter Gemini API Key"
    />
    <SettingSelect
      label="Model"
      value={settings.modelName}
      onChange={settings.setModelName}
      options={[
        { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
        { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
        { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
      ]}
    />
    <SettingSlider
      label="Temperature"
      value={settings.temperature}
      onChange={settings.setTemperature}
      min={0} max={2} step={0.1}
    />
  </SettingsForm>
);

// ===== Voice Tab =====
const VoiceTab = ({ settings }) => (
  <SettingsForm>
    <SettingSelect
      label="Voice Provider"
      value={settings.voiceProvider}
      onChange={settings.setVoiceProvider}
      options={[
        { value: "webspeech", label: "Browser (Free)" },
        { value: "elevenlabs", label: "ElevenLabs (Premium)" },
      ]}
    />
    {settings.voiceProvider === "elevenlabs" && (
      <>
        <SettingInput
          label="ElevenLabs API Key"
          type="password"
          value={settings.elevenlabsApiKey}
          onChange={settings.setElevenlabsApiKey}
          placeholder="xi-api key"
        />
        <SettingInput
          label="Voice ID"
          value={settings.voiceId}
          onChange={settings.setVoiceId}
          placeholder="Get from ElevenLabs dashboard"
        />
      </>
    )}
    <SettingToggle
      label="Sleep Mode"
      value={settings.sleepMode}
      onChange={settings.setSleepMode}
      description="Character sleeps when idle"
    />
    <SettingToggle
      label="Window Sitting"
      value={settings.windowSitting}
      onChange={settings.setWindowSitting}
      description="Sit on window edges"
    />
  </SettingsForm>
);

// ===== Display Tab =====
const DisplayTab = ({ settings }) => (
  <SettingsForm>
    <ToggleBlock
      label="🪄 Chibi Mode"
      value={settings.chibiMode}
      onChange={settings.setChibiMode}
      description="Mini character mode"
      color="#f472b6"
    />
    <ToggleBlock
      label="🖼️ Big Screen Mode"
      value={settings.bigScreenMode}
      onChange={settings.setBigScreenMode}
      description="Large character display"
      color="#a78bfa"
    />
    <ToggleBlock
      label="✨ Post Processing"
      value={settings.postProcessing}
      onChange={settings.setPostProcessing}
      description="Bloom + Ambient Occlusion effects"
      color="#34d399"
    />
    <ToggleBlock
      label="💤 Sleep Mode"
      value={settings.sleepMode}
      onChange={settings.setSleepMode}
      description="Auto-sleep after inactivity"
      color="#60a5fa"
    />
    <ToggleBlock
      label="🪟 Window Sitting"
      value={settings.windowSitting}
      onChange={settings.setWindowSitting}
      description="Sit on window/taskbar edges"
      color="#fbbf24"
    />
    <ToggleBlock
      label="🚀 Auto Start"
      value={settings.autoStart}
      onChange={settings.setAutoStart}
      description="Launch with Windows"
      color="#f472b6"
    />
    <SettingSelect
      label="Multi-Avatar Count"
      value={settings.multiAvatarCount.toString()}
      onChange={(v) => settings.setMultiAvatarCount(parseInt(v))}
      options={[
        { value: "1", label: "1 Avatar" },
        { value: "2", label: "2 Avatars" },
        { value: "3", label: "3 Avatars" },
      ]}
    />
    <div style={{ color: "#666", fontSize: "11px", textAlign: "center", marginTop: "8px" }}>
      🔄 Settings auto-save to localStorage
    </div>
  </SettingsForm>
);

// ===== Reminder Tab =====
const ReminderTab = ({ settings }) => {
  const triggerNow = () => {
    window.dispatchEvent(new CustomEvent("zara-trigger-reminder"));
  };

  return (
    <SettingsForm>
      <div style={{
        background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(244,114,182,0.1))",
        borderRadius: "12px", padding: "16px",
        border: "1px solid rgba(167,139,250,0.2)",
      }}>
        <div style={{ color: "#a78bfa", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
          👁️ Eye Exercise Reminder
        </div>
        <div style={{ color: "#888", fontSize: "11px", marginBottom: "12px", lineHeight: 1.5 }}>
          Reminds you to rest your eyes. Shows floating points on screen — look at each point for {settings.reminderPointInterval} seconds.
        </div>
      </div>

      <ToggleBlock
        label="⏰ Enable Reminder"
        value={settings.reminderEnabled}
        onChange={settings.setReminderEnabled}
        description="Periodic eye exercise reminders"
        color="#a78bfa"
      />

      <SettingSlider
        label={`Reminder Interval: ${settings.reminderInterval} minutes`}
        value={settings.reminderInterval}
        onChange={settings.setReminderInterval}
        min={5} max={60} step={5}
      />

      <SettingSlider
        label={`Point Hold Time: ${settings.reminderPointInterval} seconds`}
        value={settings.reminderPointInterval}
        onChange={settings.setReminderPointInterval}
        min={5} max={60} step={5}
      />

      <button
        onClick={triggerNow}
        style={{
          width: "100%",
          padding: "12px",
          background: "linear-gradient(135deg, #a78bfa, #f472b6)",
          border: "none",
          borderRadius: "10px",
          color: "#fff",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        🔄 Start Now
      </button>
    </SettingsForm>
  );
};

// ===== Dance Tab =====
const DanceTab = ({ settings }) => (
  <SettingsForm>
    <div style={{
      background: "linear-gradient(135deg, rgba(244,114,182,0.15), rgba(167,139,250,0.1))",
      borderRadius: "12px", padding: "16px",
      border: "1px solid rgba(244,114,182,0.2)",
    }}>
      <div style={{ color: "#f472b6", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
        💃 Dance to Music
      </div>
      <div style={{ color: "#888", fontSize: "11px", marginBottom: "12px", lineHeight: 1.5 }}>
        Zara dances to whatever music is playing! Uses microphone to detect beats.
      </div>
    </div>

    <ToggleBlock
      label="🎵 Dance Mode"
      value={settings.danceMode}
      onChange={settings.setDanceMode}
      description="Enable music-reactive dancing"
      color="#f472b6"
    />

    <SettingSlider
      label={`Reactivity: ${(settings.danceReactivity * 100).toFixed(0)}%`}
      value={settings.danceReactivity}
      onChange={settings.setDanceReactivity}
      min={0} max={1} step={0.1}
    />

    <div style={{
      background: "rgba(255,255,255,0.03)",
      borderRadius: "10px", padding: "12px",
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      <div style={{ color: "#888", fontSize: "11px", lineHeight: 1.5 }}>
        🎤 When enabled, Zara will listen through your microphone to detect music beats and dance along. Toggle off when not in use.
      </div>
    </div>
  </SettingsForm>
);

// ===== Mood Tab =====
const MoodTab = ({ mood, loveMeter, angerMeter, resetMood }) => (
  <SettingsForm>
    <div style={{
      background: "rgba(167, 139, 250, 0.1)",
      borderRadius: "12px",
      padding: "16px",
    }}>
      <div style={{ color: "#a78bfa", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>
        Current Mood Status
      </div>
      <MoodBar label="Mood" value={mood} />
      <MoodMeter label="Love ❤️" value={loveMeter} color="#f472b6" />
      <MoodMeter label="Anger 💢" value={angerMeter} color="#f87171" />
    </div>

    <button
      onClick={resetMood}
      style={{
        width: "100%",
        padding: "12px",
        background: "linear-gradient(135deg, #a78bfa, #f472b6)",
        border: "none",
        borderRadius: "10px",
        color: "#fff",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        marginTop: "8px",
      }}
    >
      🔄 Reset Mood
    </button>

    <div style={{
      background: "rgba(255,255,255,0.03)",
      borderRadius: "10px", padding: "12px",
      border: "1px solid rgba(255,255,255,0.08)",
      marginTop: "8px",
    }}>
      <div style={{ color: "#888", fontSize: "11px", lineHeight: 1.5 }}>
        {mood === MOODS.LOVE && "💕 Zara is in LOVE with you! Keep being sweet!"}
        {mood === MOODS.HAPPY && "😊 Zara is happy! Talk to her to keep her smiling."}
        {mood === MOODS.NEUTRAL && "😐 Zara is neutral. Say something to brighten her day!"}
        {mood === MOODS.IRRITATED && "😒 Zara is getting irritated. Better talk to her soon!"}
        {mood === MOODS.ANGRY && "😠 Zara is angry! Apologize or give her some space."}
        {mood === MOODS.FIGHTING && "💢 Zara is in fight mode! Wait for her to calm down."}
        {mood === MOODS.FORGIVING && "🥺 Zara is forgiving you. Be nice to her!"}
      </div>
    </div>
  </SettingsForm>
);

// ===== Sub-components =====

const SettingsForm = ({ children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
    {children}
  </div>
);

const SettingInput = ({ label, value, onChange, placeholder, type = "text" }) => (
  <div>
    <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "6px" }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "10px 14px",
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "10px",
        color: "#fff",
        fontSize: "13px",
        outline: "none",
        transition: "border-color 0.2s",
      }}
    />
  </div>
);

const SettingSelect = ({ label, value, onChange, options }) => (
  <div>
    <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "6px" }}>
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "10px 14px",
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "10px",
        color: "#fff",
        fontSize: "13px",
        outline: "none",
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const SettingSlider = ({ label, value, onChange, min, max, step }) => (
  <div>
    <label style={{ color: "#888", fontSize: "12px", display: "block", marginBottom: "6px" }}>
      {label}
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{ width: "100%", accentColor: "#a78bfa" }}
    />
  </div>
);

const SettingToggle = ({ label, value, onChange, description }) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
      <span style={{ color: "#ccc", fontSize: "12px" }}>{label}</span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: "44px", height: "24px",
          borderRadius: "12px",
          border: "none",
          background: value ? "#a78bfa" : "rgba(255,255,255,0.15)",
          cursor: "pointer",
          position: "relative",
          transition: "background 0.2s",
        }}
      >
        <div style={{
          width: "18px", height: "18px",
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: "3px",
          left: value ? "23px" : "3px",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }} />
      </button>
    </div>
    {description && (
      <div style={{ color: "#666", fontSize: "10px" }}>{description}</div>
    )}
  </div>
);

const ToggleBlock = ({ label, value, onChange, description, color }) => (
  <div style={{
    background: value ? `${color}10` : "rgba(255,255,255,0.02)",
    borderRadius: "10px",
    padding: "12px",
    border: `1px solid ${value ? color + "30" : "rgba(255,255,255,0.05)"}`,
    transition: "all 0.2s",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: value ? color : "#888", fontSize: "13px", fontWeight: value ? "600" : "400" }}>
        {label}
      </span>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: "44px", height: "24px",
          borderRadius: "12px",
          border: "none",
          background: value ? color : "rgba(255,255,255,0.15)",
          cursor: "pointer",
          position: "relative",
          transition: "all 0.2s",
        }}
      >
        <div style={{
          width: "18px", height: "18px",
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: "3px",
          left: value ? "23px" : "3px",
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }} />
      </button>
    </div>
    {description && (
      <div style={{ color: "#666", fontSize: "10px", marginTop: "4px" }}>{description}</div>
    )}
  </div>
);

const MoodBar = ({ label, value }) => {
  const moodEmojis = {
    love: "💕 Love",
    happy: "😊 Happy",
    neutral: "😐 Neutral",
    irritated: "😒 Irritated",
    angry: "😠 Angry",
    fighting: "💢 Fighting!",
    forgiving: "🥺 Forgiving",
  };
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
      <span style={{ color: "#ccc", fontSize: "12px" }}>{label}</span>
      <span style={{ color: "#fff", fontSize: "12px", fontWeight: "600" }}>
        {moodEmojis[value] || value}
      </span>
    </div>
  );
};

const MoodMeter = ({ label, value, color }) => (
  <div style={{ marginBottom: "8px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
      <span style={{ color: "#ccc", fontSize: "11px" }}>{label}</span>
      <span style={{ color: color, fontSize: "11px", fontWeight: "600" }}>{value}%</span>
    </div>
    <div
      style={{
        width: "100%",
        height: "4px",
        background: "rgba(255,255,255,0.1)",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          borderRadius: "4px",
          transition: "width 0.5s ease",
        }}
      />
    </div>
  </div>
);

export default SettingsPanel;
