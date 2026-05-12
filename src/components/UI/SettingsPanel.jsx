import { useState } from "react";
import { useSettingsStore } from "../../stores/settingsStore";

const SettingsPanel = ({ isOpen, onClose }) => {
  const settings = useSettingsStore();
  const [activeTab, setActiveTab] = useState("ai");

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "280px",
        height: "100%",
        background: "rgba(20, 20, 30, 0.95)",
        backdropFilter: "blur(10px)",
        borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
        zIndex: 200,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "#fff", fontSize: "16px", fontWeight: "600" }}>
          Settings
        </span>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#888",
            fontSize: "20px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        {["ai", "voice", "character"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: "12px",
              background: activeTab === tab ? "rgba(167, 139, 250, 0.2)" : "transparent",
              border: "none",
              color: activeTab === tab ? "#a78bfa" : "#888",
              fontSize: "12px",
              textTransform: "capitalize",
              cursor: "pointer",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
        {activeTab === "ai" && (
          <SettingsForm>
            <SettingInput
              label="API Key"
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
                { value: "webspeech", label: "Browser (Free - Bengali support limited)" },
                { value: "elevenlabs", label: "ElevenLabs (Premium - Better quality)" },
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
            <SettingSlider
              label="Stability"
              value={settings.stability}
              onChange={settings.setStability}
              min={0}
              max={1}
              step={0.05}
            />
            <SettingSlider
              label="Similarity Boost"
              value={settings.similarityBoost}
              onChange={settings.setSimilarityBoost}
              min={0}
              max={1}
              step={0.05}
            />
          </SettingsForm>
        )}

        {activeTab === "character" && (
          <SettingsForm>
            <SettingInput
              label="Character Name"
              value={settings.characterName}
              onChange={settings.setCharacterName}
              placeholder="Zara"
            />
            <SettingSlider
              label="Emotion Duration (ms)"
              value={settings.emotionDuration}
              onChange={settings.setEmotionDuration}
              min={1000}
              max={10000}
              step={500}
            />
          </SettingsForm>
        )}
      </div>
    </div>
  );
};

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
        padding: "10px 12px",
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "8px",
        color: "#fff",
        fontSize: "14px",
        outline: "none",
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
        padding: "10px 12px",
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "8px",
        color: "#fff",
        fontSize: "14px",
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
      {label}: {value.toFixed(2)}
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{ width: "100%" }}
    />
  </div>
);

export default SettingsPanel;