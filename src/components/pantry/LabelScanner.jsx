import { useState, useRef } from 'react';
import { X, Camera, Loader2, ScanLine, Upload, RotateCcw } from 'lucide-react';
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
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            streamRef.current = stream;
            setCapturing(true);
            // Wait for DOM to render the video element
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(() => { });
                }
            }, 100);
        } catch (err) {
            console.error('Camera error:', err);
            if (err.name === 'NotAllowedError') {
                setError('Camera access denied. Please allow camera permissions in your browser settings.');
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

        // Resize image to reduce base64 size
        const reader = new FileReader();
        reader.onloadend = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = 1024;
                let w = img.width, h = img.height;
                if (w > maxSize || h > maxSize) {
                    if (w > h) { h = (h / w) * maxSize; w = maxSize; }
                    else { w = (w / h) * maxSize; h = maxSize; }
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                setPreview(dataUrl);
                processImage(dataUrl);
            };
            img.src = reader.result;
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
            // Show actual error message for debugging
            const errMsg = err?.message || err?.toString() || 'Unknown error';
            if (errMsg.includes('401') || errMsg.includes('auth') || errMsg.includes('Unauthorized')) {
                setError('API authentication failed. Please check your API key in .env.local');
            } else if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('rate')) {
                setError('API rate limit reached. Please wait a moment and try again.');
            } else if (errMsg.includes('model') || errMsg.includes('not found') || errMsg.includes('404')) {
                setError('The AI model does not support image analysis. Please check your API configuration.');
            } else {
                setError(`AI scan failed: ${errMsg}`);
            }
            setPreview(null);
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    const reset = () => {
        setPreview(null);
        setError(null);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 sm:p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <ScanLine size={22} className="text-purple-600" />
                        AI Label Scanner
                    </h3>
                    <button onClick={handleClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                    {/* Processing overlay */}
                    {processing && (
                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                            <Loader2 size={40} className="text-purple-600 animate-spin" />
                            <p className="text-sm font-medium text-gray-600">AI is reading your label...</p>
                            <p className="text-xs text-gray-400">Extracting product name, dates & more</p>
                        </div>
                    )}

                    {/* Preview */}
                    {preview && !processing && !error && (
                        <div className="rounded-xl overflow-hidden border border-gray-200">
                            <img src={preview} alt="Captured label" className="w-full object-cover max-h-48" />
                        </div>
                    )}

                    {/* Camera view */}
                    {capturing && !processing && (
                        <div className="space-y-3">
                            <div className="rounded-xl overflow-hidden bg-black relative" style={{ minHeight: '200px' }}>
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full"
                                    style={{ minHeight: '200px' }}
                                />
                                <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-xl m-4 pointer-events-none" />
                            </div>
                            <button
                                type="button"
                                onClick={capturePhoto}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                            >
                                <Camera size={18} />
                                Capture Photo
                            </button>
                        </div>
                    )}

                    {/* Initial state */}
                    {!capturing && !processing && !preview && !error && (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-500 text-center">
                                Take a photo of the product label. AI will extract the name, MFG date, expiry date, and "best before" info automatically.
                            </p>

                            <button
                                type="button"
                                onClick={startCamera}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                            >
                                <Camera size={18} />
                                Open Camera
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-white px-3 text-gray-400">or</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors text-sm font-medium"
                            >
                                <Upload size={18} />
                                Upload a Photo
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
                        <div className="space-y-3">
                            <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm">
                                {error}
                            </div>
                            <button
                                type="button"
                                onClick={reset}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
                            >
                                <RotateCcw size={16} />
                                Try Again
                            </button>
                        </div>
                    )}
                </div>

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
}
