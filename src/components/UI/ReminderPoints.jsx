const ReminderPoints = ({ active, points, onComplete }) => {
  if (!active || points.length === 0) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      pointerEvents: "none",
      background: "rgba(0,0,0,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        position: "relative", width: "80vw", height: "80vh",
        maxWidth: "700px", maxHeight: "500px",
      }}>
        {points.map(function(p, i) {
          return (
            <div key={i} style={{
              position: "absolute",
              left: p.x + "%", top: p.y + "%",
              width: p.active ? "24px" : "12px",
              height: p.active ? "24px" : "12px",
              borderRadius: "50%",
              background: p.active
                ? "radial-gradient(circle, #f472b6, #a78bfa)"
                : "rgba(167, 139, 250, 0.3)",
              boxShadow: p.active
                ? "0 0 20px rgba(167, 139, 250, 0.8), 0 0 40px rgba(244, 114, 182, 0.4)"
                : "none",
              transform: "translate(-50%, -50%)",
              transition: "all 0.3s ease",
              animation: p.active ? "pulse 1.5s ease-in-out infinite" : "none",
              cursor: "pointer",
            }}>
              {p.active && (
                <div style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  color: "#fff", fontSize: "10px",
                  fontWeight: 700, whiteSpace: "nowrap",
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                  marginTop: "-20px",
                }}>
                  {"👀 এখানে দেখো!"}
                </div>
              )}
            </div>
          );
        })}

        {/* Instructions */}
        <div style={{
          position: "absolute", bottom: "-60px", left: "50%",
          transform: "translateX(-50%)",
          color: "#fff", fontSize: "14px", fontWeight: 600,
          textAlign: "center", whiteSpace: "nowrap",
          textShadow: "0 2px 8px rgba(0,0,0,0.5)",
          background: "rgba(0,0,0,0.6)",
          padding: "8px 20px", borderRadius: "12px",
          backdropFilter: "blur(8px)",
        }}>
          {"🔵 প্রতিটি বিন্দু ২০ সেকেন্ড ধরে দেখো | চোখের ব্যায়াম"}
        </div>
      </div>

      {/* Close button */}
      <button onClick={onComplete} style={{
        position: "fixed", top: "20px", right: "20px",
        background: "rgba(255,255,255,0.15)",
        border: "1px solid rgba(255,255,255,0.3)",
        color: "#fff", fontSize: "18px",
        width: "40px", height: "40px",
        borderRadius: "50%", cursor: "pointer",
        backdropFilter: "blur(8px)",
        zIndex: 10000,
        pointerEvents: "auto",
      }}>{"✕"}</button>
    </div>
  );
};

export default ReminderPoints;
