import { useState, useEffect, useRef } from "react";
import styles from "./styles.module.scss";
import axios from "axios";

const WebcamCapture = () => {
  const [mediaStream, setMediaStream] = useState<any>();
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [isImageCaptured, setIsImageCaptured] = useState(false);
  const [status, setStatus] = useState<string>("Image Capturing...");
  const videoRef = useRef<any>(null);

  useEffect(() => {
    startCapture();
    setTimeout(() => {
      captureImage();
    }, 1500);
  }, [capturedImage]);

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
      setStatus("Error opening video camera.");
    }
  };
  const captureImage = () => {
    if (!videoRef.current || mediaStream) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob: any) => {
        const file = new File([blob], "image.jpeg", { type: "image/jpeg" });
        const formData: any = {};
        formData.file = file;
        sendCapturedImageToAPI(formData);
      },
      "image/jpeg",
      0.8
    );
    const dataUrl = canvas.toDataURL("image/jpeg");
    setTimeout(() => captureImage(), 1000);
    setCapturedImage(dataUrl);
    setIsImageCaptured(true);
    setStatus("Image Captured Successfully!");
    mediaStream?.getTracks()[0].stop();
    setMediaStream(null);
  };

  const downloadImage = () => {
    if (capturedImage) {
      const link = document.createElement("a");
      link.href = capturedImage;
      link.download = "captured-image.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetProcess = () => {
    setMediaStream("");
    setCapturedImage(null);
    setIsImageCaptured(false);
    setStatus("Image Capturing...");
    setStatus("");
  };

  const sendCapturedImageToAPI = async (formData: any) => {
    setStatus(`Analyzing in process. Please wait for sometime...`);
    console.log("in api");
    console.log(formData);
    try {
      const response = await axios.post(
        "http://localhost:4670/training/check-face",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response) {
        console.log(response.data);
        setStatus("Image uploaded successfully!");
        setTimeout(
          () =>
            setStatus(
              `Hi ${response.data[0]._label}. Have a great day ahead!!!`
            ),
          1000
        );
      }
    } catch (error) {
      console.error(error);
      setStatus("Error uploading image!");
    }
  };

  return (
    <div className={styles.app}>
      <h1 className={styles.heading}>Welcome to Face Recognition System</h1>
      <p>{status}</p>
      {!mediaStream && captureImage.length != null ? (
        <button className={styles.buttonStyle}>Turning ON Camera</button>
      ) : !isImageCaptured ? (
        <div>
          <video ref={videoRef} autoPlay className={styles.videoStyle} />
          {/* <button onClick={() => setTimeout(captureImage, 500)} className={styles.buttonStyle}>Take picture</button> */}
        </div>
      ) : (
        capturedImage && (
          <div className={styles.capturedApp}>
            <img
              src={capturedImage}
              alt="captured"
              className={styles.videoStyle}
            />
            <button onClick={downloadImage} className={styles.downloadButton}>
              Download Image
            </button>
            <button onClick={resetProcess} className={styles.resetButton}>
              Reset
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default WebcamCapture;
