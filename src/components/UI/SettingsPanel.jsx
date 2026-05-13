import { useState } from "react";
import { useSettingsStore } from "../../stores/settingsStore";
import { useRelationshipStore, MOODS } from "../../stores/relationshipStore";

const SettingsPanel = ({ isOpen, onClose }) => {
  const settings = useSettingsStore();
  const { mood, loveMeter, angerMeter, resetMood } = useRelationshipStore();
  const [activeTab, setActiveTab] = useState("ai");

  if (!isOpen) return null;

  return (
    <div
      style={{
        width: "340px",
        maxHeight: "500px",
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
          ⚙️ Settings
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
        }}
      >
        {["ai", "voice", "mood"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "12px",
              background:
                activeTab === tab ? "rgba(167, 139, 250, 0.15)" : "transparent",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #a78bfa" : "2px solid transparent",
              color: activeTab === tab ? "#a78bfa" : "#666",
              fontSize: "12px",
              fontWeight: activeTab === tab ? "600" : "400",
              textTransform: "capitalize",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab === "ai" ? "🤖 AI" : tab === "voice" ? "🔊 Voice" : "💜 Mood"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
        {activeTab === "ai" && (
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
              min={0}
              max={2}
              step={0.1}
            />
          </SettingsForm>
        )}

        {activeTab === "voice" && (
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
          </SettingsForm>
        )}

        {activeTab === "mood" && (
          <SettingsForm>
            {/* Mood Status */}
            <div
              style={{
                background: "rgba(167, 139, 250, 0.1)",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div style={{ color: "#a78bfa", fontSize: "13px", fontWeight: "600", marginBottom: "12px" }}>
                Current Mood Status
              </div>
              <MoodBar label="Mood" value={mood} />
              <MoodMeter label="Love ❤️" value={loveMeter} color="#f472b6" />
              <MoodMeter label="Anger 💢" value={angerMeter} color="#f87171" />
            </div>

            <button
              onClick={() => {
                resetMood();
              }}
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
          </SettingsForm>
        )}
      </div>
    </div>
  );
};

// --- Sub-components ---

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
      {label}: {typeof value === "number" ? value.toFixed(2) : value}
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
