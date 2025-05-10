import React from "react";

const VideoPreview: React.FC = () => {
  return (
    <div className="mt-6 w-full max-w-2xl">
      <video
        className="w-full rounded-lg shadow-md border-4 border-black"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPreview;
