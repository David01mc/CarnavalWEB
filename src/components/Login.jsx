import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Login({ onClose, onRegisterClick }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);
        setLoading(false);

        if (result.success) {
            onClose();
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="modal-overlay login-overlay" onClick={onClose}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
                <button className="login-close-btn" onClick={onClose}>
                    <i className="fas fa-times"></i>
                </button>

                <div className="login-header">
                    <div className="login-icon">
                        <i className="fas fa-theater-masks"></i>
                    </div>
                    <h2>Bienvenido</h2>
                    <p>Inicia sesión en tu cuenta</p>
                </div>

                {error && (
                    <div className="login-alert">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-input-group">
                        <div className="input-icon">
                            <i className="fas fa-user"></i>
                        </div>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Usuario"
                            required
                            autoFocus
                            className="login-input"
                        />
                    </div>

                    <div className="login-input-group">
                        <div className="input-icon">
                            <i className="fas fa-lock"></i>
                        </div>
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            required
                            className="login-input"
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                <span>Iniciando sesión...</span>
                            </>
                        ) : (
                            <>
                                <i className="fas fa-sign-in-alt"></i>
                                <span>Iniciar Sesión</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer">
                    <p>¿No tienes cuenta? <button onClick={() => { onClose(); onRegisterClick(); }}>Regístrate</button></p>
                </div>
            </div>
        </div>
    );
}

export default Login;
