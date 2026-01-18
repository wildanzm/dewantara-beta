import React from "react";
const FreeDetectPane = ({ prediction }) => (
  <div id="free-detect-pane" className="pane active">
    <h2>Hasil Prediksi:</h2>
    <p id="predictionOutput">{prediction}</p>
  </div>
);
export default FreeDetectPane;
