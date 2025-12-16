import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import BingoCellModal from './BingoCellModal';
import '../styles/components/bingo.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

function Bingo2026() {
    const { user } = useAuth();
    const [template, setTemplate] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const isAdmin = user && (user.role === 'admin' || user.isAdmin);

    // Fetch template and user data
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Fetch template
            const templateRes = await fetch(`${API_URL}/api/bingo/2026`);
            if (!templateRes.ok) throw new Error('Error al cargar plantilla del bingo');
            const templateData = await templateRes.json();
            setTemplate(templateData);

            // Fetch user data
            const userRes = await fetch(`${API_URL}/api/bingo/2026/user`, {
                headers: { 'x-auth-token': token }
            });
            if (!userRes.ok) throw new Error('Error al cargar datos del usuario');
            const userDataResponse = await userRes.json();
            setUserData(userDataResponse);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, fetchData]);

    // Trigger confetti when completing a line
    const triggerLineConfetti = useCallback(() => {
        const count = 150;
        const defaults = {
            origin: { y: 0.7 },
            colors: ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#00CED1', '#8B0000']
        };

        confetti({
            ...defaults,
            particleCount: count,
            spread: 100,
            startVelocity: 45
        });

        // Second burst
        setTimeout(() => {
            confetti({
                ...defaults,
                particleCount: count / 2,
                spread: 80,
                startVelocity: 35,
                origin: { y: 0.8, x: 0.3 }
            });
            confetti({
                ...defaults,
                particleCount: count / 2,
                spread: 80,
                startVelocity: 35,
                origin: { y: 0.8, x: 0.7 }
            });
        }, 200);
    }, []);

    // Get cell user data
    const getCellData = (cellId) => {
        if (!userData || !userData.cells) return null;
        return userData.cells.find(c => c.cellId === cellId);
    };

    // Handle cell click
    const handleCellClick = (cell) => {
        setSelectedCell(cell);
    };

    // Handle cell save
    const handleCellSave = async (cellId, data) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/bingo/2026/cell/${cellId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Error al guardar');

            const result = await response.json();

            // Update local user data
            setUserData(prev => {
                const existingIndex = prev.cells.findIndex(c => c.cellId === cellId);
                const newCells = [...prev.cells];

                if (existingIndex >= 0) {
                    newCells[existingIndex] = result.cell;
                } else {
                    newCells.push(result.cell);
                }

                return { ...prev, cells: newCells };
            });

            // Check for completed lines and trigger confetti
            if (result.completedLines && result.completedLines.length > 0) {
                triggerLineConfetti();
            }

            setSelectedCell(null);
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle cell unmark
    const handleCellUnmark = async (cellId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/bingo/2026/cell/${cellId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (!response.ok) throw new Error('Error al desmarcar');

            // Update local user data
            setUserData(prev => ({
                ...prev,
                cells: prev.cells.filter(c => c.cellId !== cellId)
            }));

            setSelectedCell(null);
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle reset bingo
    const handleReset = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/bingo/2026/reset`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (!response.ok) throw new Error('Error al resetear');

            setUserData(prev => ({ ...prev, cells: [], completedAt: null }));
            setShowResetConfirm(false);
        } catch (err) {
            setError(err.message);
        }
    };

    // Handle admin title edit
    const handleTitleEdit = async (cellId, newTitle) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/bingo/2026/cell/${cellId}/title`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify({ title: newTitle })
            });

            if (!response.ok) throw new Error('Error al actualizar título');

            // Update local template
            setTemplate(prev => ({
                ...prev,
                cells: prev.cells.map(c =>
                    c.id === cellId ? { ...c, title: newTitle } : c
                )
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    // Calculate progress
    const markedCount = userData?.cells?.length || 0;
    const totalCells = 25;
    const progressPercent = (markedCount / totalCells) * 100;

    if (!user) {
        return (
            <div className="bingo-login-required">
                <div className="login-message">
                    <i className="fas fa-lock"></i>
                    <h2>Inicia sesión para jugar al Bingo</h2>
                    <p>Necesitas una cuenta para guardar tu progreso</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bingo-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <span>Cargando bingo...</span>
            </div>
        );
    }

    return (
        <div className="bingo-container">
            <header className="bingo-header">
                <div className="bingo-header-top">
                    <motion.h1
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                    >
                        <i className="fas fa-th"></i> Bingo Carnaval 2026
                    </motion.h1>
                    <button
                        className="btn btn-reset"
                        onClick={() => setShowResetConfirm(true)}
                        disabled={markedCount === 0}
                        title="Resetear Bingo"
                    >
                        <i className="fas fa-redo"></i>
                    </button>
                </div>
                <p className="bingo-subtitle">
                    ¿Cuántos clichés puedes encontrar en las letras?
                </p>
            </header>

            {error && (
                <div className="bingo-error">
                    <i className="fas fa-exclamation-circle"></i> {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            {/* Progress Bar */}
            <div className="bingo-progress">
                <div className="progress-info">
                    <span>{markedCount} / {totalCells} casillas</span>
                    <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="progress-bar">
                    <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Bingo Grid */}
            <motion.div
                className="bingo-grid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                {template?.cells?.map((cell, index) => {
                    const cellData = getCellData(cell.id);
                    const isMarked = !!cellData;

                    return (
                        <motion.div
                            key={cell.id}
                            className={`bingo-cell ${isMarked ? 'marked' : ''}`}
                            onClick={() => handleCellClick(cell)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.02 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="cell-content">
                                <span className="cell-title">{cell.title}</span>
                                {isMarked && (
                                    <div className="cell-mark">
                                        <i className="fas fa-check"></i>
                                    </div>
                                )}
                                {isMarked && (
                                    <div className="cell-info">
                                        <span className="cell-agrupacion">{cellData.agrupacionName}</span>
                                        <span className="cell-pase">{cellData.pase}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Reset Confirmation Modal */}
            <AnimatePresence>
                {showResetConfirm && (
                    <motion.div
                        className="bingo-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowResetConfirm(false)}
                    >
                        <motion.div
                            className="bingo-confirm-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h3><i className="fas fa-exclamation-triangle"></i> ¿Resetear Bingo?</h3>
                            <p>Se borrarán todas tus casillas marcadas. Esta acción no se puede deshacer.</p>
                            <div className="confirm-actions">
                                <button className="btn btn-secondary" onClick={() => setShowResetConfirm(false)}>
                                    Cancelar
                                </button>
                                <button className="btn btn-danger" onClick={handleReset}>
                                    <i className="fas fa-trash"></i> Sí, Resetear
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cell Modal */}
            <AnimatePresence>
                {selectedCell && (
                    <BingoCellModal
                        cell={selectedCell}
                        cellData={getCellData(selectedCell.id)}
                        isAdmin={isAdmin}
                        onSave={(data) => handleCellSave(selectedCell.id, data)}
                        onUnmark={() => handleCellUnmark(selectedCell.id)}
                        onTitleEdit={(newTitle) => handleTitleEdit(selectedCell.id, newTitle)}
                        onClose={() => setSelectedCell(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

export default Bingo2026;
