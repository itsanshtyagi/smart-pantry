import { useState, useRef } from 'react';
import { X, Camera, Loader2, ScanLine } from 'lucide-react';
import { scanLabelWithAI } from '../../services/openai';
import Button from '../ui/Button';

export default function LabelScanner({ onProductFound, onClose }) {
    const [capturing, setCapturing] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setCapturing(true);
            setError(null);
        } catch (err) {
            console.error('Camera error:', err);
            if (err.name === 'NotAllowedError') {
                setError('Camera access denied. Please allow camera permissions.');
            } else {
                setError('Could not access camera. Try uploading a photo instead.');
            }
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setCapturing(false);
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPreview(dataUrl);
        stopCamera();
        processImage(dataUrl);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result;
            setPreview(dataUrl);
            processImage(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    const processImage = async (dataUrl) => {
        setProcessing(true);
        setError(null);
        try {
            const base64 = dataUrl.split(',')[1];
            const result = await scanLabelWithAI(base64);
            onProductFound(result);
        } catch (err) {
            console.error('AI scan error:', err);
            setError('Failed to read label. Please try again with a clearer photo.');
            setPreview(null);
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <ScanLine size={22} className="text-purple-600" />
                        AI Label Scanner
                    </h3>
                    <button onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Processing overlay */}
                    {processing && (
                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                            <Loader2 size={40} className="text-purple-600 animate-spin" />
                            <p className="text-sm font-medium text-gray-600">AI is reading your label...</p>
                            <p className="text-xs text-gray-400">Extracting product name, dates & more</p>
                        </div>
                    )}

                    {/* Preview */}
                    {preview && !processing && (
                        <div className="rounded-xl overflow-hidden border border-gray-200">
                            <img src={preview} alt="Captured label" className="w-full object-cover max-h-48" />
                        </div>
                    )}

                    {/* Camera view */}
                    {capturing && !processing && (
                        <div className="space-y-3">
                            <div className="rounded-xl overflow-hidden bg-black relative">
                                <video ref={videoRef} autoPlay playsInline className="w-full" />
                                <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-xl m-4 pointer-events-none" />
                            </div>
                            <Button onClick={capturePhoto} className="w-full">
                                <Camera size={18} />
                                Capture Photo
                            </Button>
                        </div>
                    )}

                    {/* Initial state */}
                    {!capturing && !processing && !preview && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-500 text-center">
                                Take a photo of the product label. AI will extract the name, MFG date, expiry date, and "best before" info automatically.
                            </p>

                            <Button onClick={startCamera} className="w-full">
                                <Camera size={18} />
                                Open Camera
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-white px-3 text-gray-400">or</span>
                                </div>
                            </div>

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors text-sm font-medium"
                            >
                                📁 Upload a Photo
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Retry */}
                    {preview && !processing && (
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => { setPreview(null); setError(null); }} className="flex-1">
                                Retake
                            </Button>
                        </div>
                    )}
                </div>

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
}
