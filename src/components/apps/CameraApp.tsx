import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { PICTURES_DIR_ID } from '../../services/vfs';
import { sound } from '../../services/audio';
import { 
  Camera, 
  SwitchCamera, 
  Sliders, 
  Download, 
  Image as ImageIcon, 
  Sparkles, 
  RefreshCw, 
  Check 
} from 'lucide-react';

type FilterMode = 'normal' | 'grayscale' | 'sepia' | 'cyber' | 'noir' | 'vibrant';

export const CameraApp: React.FC = () => {
  const { createFile, addNotification } = useOS();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [streamActive, setStreamActive] = useState(false);
  const [filter, setFilter] = useState<FilterMode>('normal');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  // Initialize camera stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false,
          });
          currentStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setStreamActive(true);
          }
        } else {
          setStreamActive(false);
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable in iframe. Using preview mode.', err);
        setStreamActive(false);
      }
    };

    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const getFilterStyle = (f: FilterMode): string => {
    switch (f) {
      case 'grayscale': return 'grayscale(100%)';
      case 'sepia': return 'sepia(90%) contrast(110%)';
      case 'cyber': return 'hue-rotate(180deg) saturate(180%)';
      case 'noir': return 'grayscale(100%) contrast(160%) brightness(90%)';
      case 'vibrant': return 'saturate(200%) contrast(110%)';
      default: return 'none';
    }
  };

  const handleCapturePhoto = async () => {
    setIsCapturing(true);
    sound.playCameraShutter();

    const canvas = canvasRef.current || document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (streamActive && videoRef.current && ctx) {
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      ctx.filter = getFilterStyle(filter);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl不易 = canvas.toDataURL('image/png');
      setCapturedImage(dataUrl不易);
    } else if (ctx) {
      // Fallback synthetic photo canvas
      canvas.width = 640;
      canvas.height = 480;
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(0.5, '#4338ca');
      grad.addColorStop(1, '#6366f1');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Draw stylized camera graphic
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px serif';
      ctx.textAlign = 'center';
      ctx.fillText('SimpleOS Photo Capture', 320, 240);
      ctx.font = '14px monospace';
      ctx.fillText(new Date().toLocaleString(), 320, 280);

      const syntheticUrl = canvas.toDataURL('image/png');
      setCapturedImage(syntheticUrl);
    }

    setTimeout(() => setIsCapturing(false), 300);
  };

  const handleSaveToPictures = async () => {
    if (!capturedImage) return;
    const filename = `Photo_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
    await createFile(filename, PICTURES_DIR_ID, capturedImage, 'image');
    sound.playSuccessChime();
    addNotification({
      title: 'Photo Saved',
      message: `Saved ${filename} to Pictures folder.`,
      type: 'success',
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0c] text-stone-200 font-sans select-none overflow-hidden">
      {/* Top Controls */}
      <div className="h-12 px-6 border-b border-white/10 bg-[#09090b] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-stone-300" />
          <span className="font-serif italic font-bold text-stone-100 text-sm">Photo Booth</span>
        </div>

        {/* Filter Selection Chips */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-xs">
          {(['normal', 'grayscale', 'sepia', 'cyber', 'noir', 'vibrant'] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg capitalize transition-colors ${
                filter === f ? 'bg-stone-200 text-stone-950 font-semibold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Camera Viewport */}
      <div className="flex-1 relative flex items-center justify-center bg-black p-4 overflow-hidden">
        {capturedImage ? (
          <div className="relative max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <img src={capturedImage} alt="Captured" className="max-w-full max-h-[60vh] object-contain rounded-2xl" />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setCapturedImage(null)}
                className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md text-stone-200 hover:bg-black text-xs font-medium border border-white/20"
              >
                Retake
              </button>
              <button
                onClick={handleSaveToPictures}
                className="px-4 py-1.5 rounded-xl bg-stone-100 hover:bg-white text-stone-950 text-xs font-semibold shadow-lg flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save to Pictures</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full max-w-2xl max-h-[70vh] rounded-3xl overflow-hidden bg-stone-950 border border-white/10 flex items-center justify-center shadow-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ filter: getFilterStyle(filter) }}
              className="w-full h-full object-cover"
            />

            {!streamActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-stone-950/80">
                <Camera className="w-12 h-12 text-stone-500 mb-3" />
                <div className="font-medium text-stone-200 text-sm">Virtual Camera Standby</div>
                <p className="text-xs text-stone-400 max-w-xs mt-1">
                  Ready to capture photo snapshots directly to your SimpleOS Pictures album.
                </p>
              </div>
            )}

            {isCapturing && (
              <div className="absolute inset-0 bg-white animate-fade-out pointer-events-none" />
            )}
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Bottom Shutter Action Bar */}
      <div className="h-20 px-8 border-t border-white/10 bg-[#09090b] flex items-center justify-center shrink-0">
        {!capturedImage && (
          <div className="flex items-center gap-6">
            <button
              onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
              className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-stone-200 transition-colors"
              title="Flip Camera"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>

            <button
              onClick={handleCapturePhoto}
              className="w-14 h-14 rounded-full bg-stone-100 hover:bg-white border-4 border-stone-800 flex items-center justify-center text-stone-950 shadow-xl hover:scale-105 active:scale-95 transition-transform"
              title="Capture Photo"
            >
              <Camera className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
