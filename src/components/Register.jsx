import { useState } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { useAuth } from '../context/AuthContext';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LehNiAsAAAAAPfIihnA7gPyqc1Oh1LtDCEYLv3H';

function RegisterForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        registrationCode: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const { executeRecaptcha } = useGoogleReCaptcha();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validar que las contraseñas coincidan
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (!executeRecaptcha) {
            setError('reCAPTCHA no está listo. Por favor, recarga la página.');
            return;
        }

        setLoading(true);

        try {
            // Obtener token de reCAPTCHA
            const recaptchaToken = await executeRecaptcha('register');

            // Intentar registrar
            const result = await register(
                formData.username,
                formData.email,
                formData.password,
                recaptchaToken,
                formData.registrationCode
            );

            if (result.success) {
                // Llamar a onSuccess para cerrar el modal y actualizar el estado
                if (onSuccess) onSuccess();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error al procesar el registro. Por favor, inténtalo de nuevo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div className="login-header" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <h2><i className="fas fa-user-plus"></i> Crear Cuenta</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Únete a la comunidad del Carnaval de Cádiz</p>
            </div>

            {error && (
                <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                    <i className="fas fa-exclamation-circle"></i> {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">
                        <i className="fas fa-user"></i> Usuario
                    </label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Elige un nombre de usuario"
                        required
                        autoFocus
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">
                        <i className="fas fa-envelope"></i> Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">
                        <i className="fas fa-key"></i> Contraseña
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 6 caracteres"
                        required
                        minLength={6}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">
                        <i className="fas fa-key"></i> Confirmar Contraseña
                    </label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repite tu contraseña"
                        required
                        minLength={6}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="registrationCode">
                        <i className="fas fa-key"></i> Código de Registro
                    </label>
                    <input
                        id="registrationCode"
                        name="registrationCode"
                        type="text"
                        value={formData.registrationCode}
                        onChange={handleChange}
                        placeholder="Código de 6 dígitos"
                        required
                        maxLength={6}
                        pattern="[0-9]{6}"
                        style={{ letterSpacing: '0.5em', textAlign: 'center', fontWeight: 'bold' }}
                    />
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>
                        <i className="fas fa-info-circle"></i> Solicita este código a un administrador
                    </small>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={loading}
                    style={{ width: '100%', marginTop: '1rem' }}
                >
                    {loading ? (
                        <>
                            <i className="fas fa-spinner fa-spin"></i> Registrando...
                        </>
                    ) : (
                        <>
                            <i className="fas fa-user-plus"></i> Crear Cuenta
                        </>
                    )}
                </button>
            </form>

            <div className="recaptcha-notice" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    <i className="fas fa-shield-alt"></i> Este sitio está protegido por reCAPTCHA y se aplican la{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                        Política de privacidad
                    </a>{' '}
                    y los{' '}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                        Términos de servicio
                    </a>{' '}
                    de Google.
                </small>
            </div>
        </div>
    );
}

function Register({ onSuccess }) {
    return (
        <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
            <RegisterForm onSuccess={onSuccess} />
        </GoogleReCaptchaProvider>
    );
}

export default Register;
