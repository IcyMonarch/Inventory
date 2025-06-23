import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const PhotoCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [capturing, setCapturing] = useState(false);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc); // Pass base64 image to parent
    }
  };

  return (
    <div>
      {capturing ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: 'environment' }}
          />
          <button onClick={capture}>📸 Take Photo</button>
          <button onClick={() => setCapturing(false)}>Cancel</button>
        </>
      ) : (
        <button onClick={() => setCapturing(true)}>Use Camera</button>
      )}
    </div>
  );
};

export default PhotoCapture;
