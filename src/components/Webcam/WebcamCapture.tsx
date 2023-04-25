import React, { useState, useEffect, useRef } from "react";
import styles from './styles.module.scss'

const WebcamCapture = () => {
  const [mediaStream, setMediaStream] = useState<any>();
  const [capturedImage, setCapturedImage] = useState(null);
  const [isImageCaptured, setIsImageCaptured] = useState(false)
  const [status, setStatus] = useState()
  const videoRef = useRef<any>(null);

  useEffect(() => {
    startCapture()
    setTimeout(() => { captureImage() }, 1500)
  }, [capturedImage])

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setMediaStream(stream);
    } catch (err) {
      console.error("Error opening video camera.", err);
    }
  };

  const captureImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    context?.drawImage(
      videoRef.current,
      0,
      0,
      canvas.width,
      canvas.height
    );
    setCapturedImage(canvas.toDataURL("image/png"));
    setIsImageCaptured(true)
    mediaStream.getTracks()[0].stop();
    setMediaStream(null)
  };

  const downloadImage = () => {
    if (capturedImage) {
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = 'captured-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetProcess = () => {
    setMediaStream('')
    setCapturedImage(null)
    setIsImageCaptured(false)
  }

  return (
    <div className={styles.app}>
      {!mediaStream && captureImage.length != null ? (
        <button className={styles.buttonStyle}>Turning ON camera</button>
      ) : !isImageCaptured ? (
        <div>
          <video ref={videoRef} autoPlay />
          {/* <button onClick={() => setTimeout(captureImage, 500)} className={styles.buttonStyle}>Take picture</button> */}
        </div>
      ) : capturedImage &&
      <div className={styles.app}>
        <img src={capturedImage} alt="captured" />
        <button onClick={downloadImage} className={styles.downloadButton}>Download Image</button>
        <button onClick={resetProcess} className={styles.resetButton}>Reset</button>
      </div>
      }
    </div>
  );
};

export default WebcamCapture;
