import React from "react";
const Controls = ({ onStart, onStop, isCameraOn }) => (
  <div className="controls">
    <button id="startButton" onClick={onStart} disabled={isCameraOn}>
      Mulai Kamera
    </button>
    <button id="stopButton" onClick={onStop} disabled={!isCameraOn}>
      Hentikan Kamera
    </button>
  </div>
);
export default Controls;
