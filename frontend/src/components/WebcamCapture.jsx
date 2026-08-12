import React, { useRef, useState, useEffect } from 'react';
import { Camera, RotateCcw, AlertTriangle, Video } from 'lucide-react';

export default function WebcamCapture({ onCapture, initialPhoto = null }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [photo, setPhoto] = useState(initialPhoto);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState(null);

  // Sync photo with initialPhoto changes (e.g. form resets)
  useEffect(() => {
    setPhoto(initialPhoto);
  }, [initialPhoto]);

  const startCamera = async () => {
    console.log('startCamera invoked');
    setError(null);
    try {
      let mediaStream;
      try {
        console.log('Requesting getUserMedia with ideal constraints');
        // Try ideal resolution and front-facing camera constraints
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 }, 
            facingMode: 'user' 
          },
          audio: false
        });
      } catch (firstErr) {
        console.warn('Ideal media constraints failed, falling back to basic stream:', firstErr);
        // Fallback to basic webcam access
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      console.log('getUserMedia succeeded, setting stream');
      streamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        console.log('Video element srcObject set and play() called');
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error('Webcam permission error:', err);
      setError('Unable to access webcam. Please check camera permissions in your browser.');
    }
  };

  const stopCamera = () => {
    console.log('stopCamera invoked');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Stopping track:', track.label);
        track.stop();
      });
      streamRef.current = null;
    }
    setStream(null);
    setIsCameraActive(false);
  };

  // Auto-start camera on mount, clean up on unmount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const capturePhoto = () => {
    console.log('capturePhoto invoked');
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      console.log('Video elements details:', {
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        readyState: video.readyState,
        paused: video.paused
      });

      // Adjust canvas to match video stream
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Draw active frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Extract base64 representation
      const dataUri = canvas.toDataURL('image/jpeg', 0.85);
      console.log('Captured base64 dataUri prefix:', dataUri.substring(0, 100));
      
      setPhoto(dataUri);
      onCapture(dataUri);
      stopCamera();
    } else {
      console.warn('capturePhoto aborted because refs are missing:', {
        videoRef: videoRef.current,
        canvasRef: canvasRef.current
      });
    }
  };

  const retakePhoto = () => {
    setPhoto(null);
    onCapture(null);
    startCamera();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
        {error ? (
          <div className="text-center p-6 text-slate-400">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
            <p className="text-sm font-medium leading-relaxed max-w-xs">{error}</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={startCamera}
                className="mt-4 px-4 py-2 bg-corporate-600 text-white rounded-md text-xs font-semibold hover:bg-corporate-700 transition"
              >
                Retry Camera Access
              </button>
              <button
                type="button"
                onClick={() => {
                  const demoPhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
                  setPhoto(demoPhoto);
                  onCapture(demoPhoto);
                }}
                className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition"
              >
                Use Demo Photo
              </button>
            </div>
          </div>
        ) : photo ? (
          // Captured Image Preview Mode
          <div className="relative w-full h-full">
            <img 
              src={photo} 
              alt="Captured Visitor" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <button
                type="button"
                onClick={retakePhoto}
                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-800 rounded-md font-semibold text-xs shadow hover:bg-slate-100 transition cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Capture
              </button>
            </div>
          </div>
        ) : isCameraActive ? (
          // Live Video Streaming Mode
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]" // Mirror preview
            />
            
            {/* Transparent Grid overlay for placement guidance */}
            <div className="absolute inset-0 border-[2px] border-dashed border-white/20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-corporate-400 rounded-full opacity-35 pointer-events-none" />
            
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button
                type="button"
                onClick={capturePhoto}
                className="flex items-center gap-2 px-6 py-2.5 bg-corporate-600 text-white rounded-full font-bold text-sm shadow-lg shadow-corporate-900/40 hover:bg-corporate-700 hover:scale-105 transition-all cursor-pointer"
              >
                <Camera className="h-5 w-5 animate-pulse" />
                Capture Photo
              </button>
            </div>
          </div>
        ) : (
          // Inactive Camera State Mode
          <div className="text-center p-6 text-slate-400">
            <Video className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-medium mb-4">Webcam is currently disabled</p>
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-corporate-600 text-white rounded-md text-sm font-bold shadow hover:bg-corporate-700 transition cursor-pointer"
            >
              <Video className="h-4 w-4" />
              Enable Webcam
            </button>
          </div>
        )}
      </div>
      
      {/* Hidden canvas for video captures */}
      <canvas ref={canvasRef} className="hidden" />
      
      {photo && (
        <button
          type="button"
          onClick={retakePhoto}
          className="mt-3 flex items-center gap-2 text-xs font-semibold text-corporate-600 hover:text-corporate-700 transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Retake Visitor Photo
        </button>
      )}
    </div>
  );
}
