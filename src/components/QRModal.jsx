import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import '../styles/components/qr-modal.css';

function QRModal({ value, title, onClose }) {
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
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                        />
                    </div>
                </div>

                <p className="qr-instruction">
                    Apunta con la cámara de tu móvil para abrir esta letra directamente.
                </p>
            </motion.div>
        </div>
    );
}

export default QRModal;
