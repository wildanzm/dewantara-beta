import React, { forwardRef } from "react";
const VideoDisplay = forwardRef((props, ref) => (
  <div className="video-container">
    <video
      ref={ref}
      id="webcam"
      autoPlay
      playsInline
      muted
      style={{ transform: "scaleX(-1)" }}
    ></video>
  </div>
));
export default VideoDisplay;
