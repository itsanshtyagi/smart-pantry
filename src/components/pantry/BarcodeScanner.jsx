import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { lookupBarcode } from '../../services/openFoodFacts';
import { X } from 'lucide-react';

export default function BarcodeScanner({ onProductFound, onClose }) {
    const scannerRef = useRef(null);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            'qr-reader',
            { fps: 10, qrbox: { width: 250, height: 150 } },
            false
        );

        scanner.render(
            async (decodedText) => {
                await scanner.clear();
                const product = await lookupBarcode(decodedText);
                if (product) {
                    onProductFound(product);
                } else {
                    onProductFound({ item_name: '', category: 'Other', barcode: decodedText });
                }
            },
            (error) => {
                if (!error.includes?.('NotFoundException')) {
                    console.warn('Scan error:', error);
                }
            }
        );

        scannerRef.current = scanner;
        return () => scanner.clear().catch(() => { });
    }, [onProductFound]);

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">📷 Scan Barcode</h3>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>
                <div id="qr-reader" className="w-full rounded-xl overflow-hidden" />
                <p className="text-sm text-gray-500 text-center mt-3">
                    Point your camera at the product barcode
                </p>
            </div>
        </div>
    );
}
