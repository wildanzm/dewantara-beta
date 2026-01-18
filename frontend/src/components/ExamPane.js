import React from "react";
const ExamPane = ({
  instructionChar,
  feedback,
  onNextQuestion,
  isCameraOn,
}) => (
  <div id="exam-pane" className="pane active">
    <h2>
      Instruksi: Peragakan Huruf{" "}
      <span id="instruction-char">{instructionChar}</span>
    </h2>
    <div id="feedback" className={feedback.className}>
      {feedback.message}
    </div>
    <button
      id="nextQuestionButton"
      onClick={onNextQuestion}
      disabled={!isCameraOn}
    >
      Soal Berikutnya
    </button>
  </div>
);
export default ExamPane;
