import { useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { lookupBarcode } from '../../services/openFoodFacts';
import { X, Camera } from 'lucide-react';

export default function BarcodeScanner({ onProductFound, onClose }) {
    const scannerRef = useRef(null);
    const isRunning = useRef(false);

    const startScanner = useCallback(async () => {
        try {
            const scanner = new Html5Qrcode('qr-reader');
            scannerRef.current = scanner;

            const cameras = await Html5Qrcode.getCameras();
            if (!cameras || cameras.length === 0) {
                alert('No camera found on this device.');
                onClose();
                return;
            }

            // Prefer back camera on mobile
            const backCamera = cameras.find(c =>
                c.label.toLowerCase().includes('back') ||
                c.label.toLowerCase().includes('rear') ||
                c.label.toLowerCase().includes('environment')
            );
            const cameraId = backCamera ? backCamera.id : cameras[cameras.length - 1].id;

            isRunning.current = true;
            await scanner.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 150 },
                    aspectRatio: 1.0,
                },
                async (decodedText) => {
                    // Stop scanner after successful scan
                    if (isRunning.current) {
                        isRunning.current = false;
                        await scanner.stop().catch(() => { });

                        const product = await lookupBarcode(decodedText);
                        if (product && product.item_name) {
                            onProductFound(product);
                        } else {
                            onProductFound({
                                item_name: '',
                                category: 'Other',
                                barcode: decodedText,
                            });
                        }
                    }
                },
                () => { } // ignore scan errors (normal during scanning)
            );
        } catch (err) {
            console.error('Scanner init error:', err);
            if (err.toString().includes('NotAllowedError') || err.toString().includes('Permission')) {
                alert('Camera access denied. Please allow camera permissions in your browser settings and try again.');
            } else {
                alert('Could not start camera: ' + err.message);
            }
            onClose();
        }
    }, [onProductFound, onClose]);

    useEffect(() => {
        // Small delay to ensure the DOM element exists
        const timeout = setTimeout(startScanner, 300);

        return () => {
            clearTimeout(timeout);
            if (scannerRef.current && isRunning.current) {
                isRunning.current = false;
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, [startScanner]);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Camera size={22} className="text-emerald-600" />
                        Scan Barcode
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <div id="qr-reader" className="w-full rounded-xl overflow-hidden" style={{ minHeight: '250px' }} />
                <p className="text-sm text-gray-500 text-center mt-3">
                    Point your camera at the product barcode
                </p>
                <p className="text-xs text-gray-400 text-center mt-1">
                    Supports EAN, UPC, and QR codes
                </p>
            </div>
        </div>
    );
}
