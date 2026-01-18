import React from "react";
const Tabs = ({ activePane, onTabSwitch }) => {
  const panes = [
    { id: "free-detect", label: "Deteksi Bebas" },
    { id: "exam", label: "Mode Ujian" },
    // { id: "dictionary", label: "Kamus BISINDO" },
  ];
  return (
    <div className="tabs">
      {panes.map((pane) => (
        <button
          key={pane.id}
          className={`tab-button ${activePane === pane.id ? "active" : ""}`}
          onClick={() => onTabSwitch(pane.id)}
        >
          {pane.label}
        </button>
      ))}
    </div>
  );
};
export default Tabs;
