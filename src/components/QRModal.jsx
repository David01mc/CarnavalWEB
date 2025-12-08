import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import '../styles/components/qr-modal.css';

function QRModal({ value, title, onClose }) {
    const downloadQR = () => {
        const svg = document.getElementById("qr-code-svg");
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        // Add white background
        img.onload = () => {
            canvas.width = 1024; // Higher res for better printing
            canvas.height = 1024;
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Draw image with margin
            const margin = 50;
            const size = canvas.width - (margin * 2);
            ctx.drawImage(img, margin, margin, size, size);

            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = `carnaval-qr-${Date.now()}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    };

    return (
        <div className="qr-modal-overlay" onClick={onClose}>
            <motion.div
                className="qr-modal-content"
                onClick={e => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
            >
                <button className="qr-close-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>

                <div className="qr-header">
                    <h3><i className="fas fa-qrcode"></i> Escanea para leer</h3>
                    <p className="qr-subtitle">{title}</p>
                </div>

                <div className="qr-code-container">
                    <div className="qr-wrapper">
                        <QRCode
                            value={value}
                            size={350}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 350 350`}
                            id="qr-code-svg"
                        />
                    </div>
                </div>

                <div className="qr-actions">
                    <button className="qr-download-btn" onClick={downloadQR}>
                        <i className="fas fa-download"></i> Descargar QR
                    </button>
                </div>

                <p className="qr-instruction">
                    Apunta con la cámara de tu móvil para abrir esta letra directamente.
                </p>
            </motion.div>
        </div>
    );
}

export default QRModal;
