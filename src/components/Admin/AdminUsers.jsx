import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [roleChangeConfirm, setRoleChangeConfirm] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/auth/user`);
            setCurrentUserId(res.data._id);
        } catch (err) {
            console.error('Error fetching current user:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/users`, {
                headers: { 'x-auth-token': token }
            });
            setUsers(res.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/users/${userId}`, {
                headers: { 'x-auth-token': token }
            });
            fetchUsers(); // Refresh list
            setDeleteConfirm(null);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al eliminar usuario');
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/api/users/${userId}/role`,
                { role: newRole },
                { headers: { 'x-auth-token': token } }
            );
            fetchUsers(); // Refresh list
            setRoleChangeConfirm(null);
        } catch (err) {
            setError(err.response?.data?.msg || 'Error al cambiar rol');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Nunca';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="admin-container">
                <div className="loading">
                    <i className="fas fa-spinner fa-spin"></i> Cargando usuarios...
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1><i className="fas fa-users-cog"></i> Gestión de Usuarios</h1>
                <p className="subtitle">{users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}</p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </div>
            )}

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th><i className="fas fa-user"></i> Usuario</th>
                            <th><i className="fas fa-envelope"></i> Email</th>
                            <th><i className="fas fa-shield-alt"></i> Rol</th>
                            <th><i className="fas fa-calendar-plus"></i> Registro</th>
                            <th><i className="fas fa-clock"></i> Último login</th>
                            <th><i className="fas fa-cog"></i> Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td className="username-cell">
                                    <div>
                                        <i className="fas fa-user-circle"></i>
                                        <span>{user.username}</span>
                                        {user._id === currentUserId && (
                                            <span className="you-badge">TÚ</span>
                                        )}
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`role-badge ${user.role}`}>
                                        {user.role === 'admin' ? (
                                            <><i className="fas fa-crown"></i> Admin</>
                                        ) : (
                                            <><i className="fas fa-user"></i> User</>
                                        )}
                                    </span>
                                </td>
                                <td>{formatDate(user.createdAt)}</td>
                                <td>{formatDate(user.lastLogin)}</td>
                                <td className="actions-cell-wrapper">
                                    <div className="actions-cell">
                                        {user._id !== currentUserId ? (
                                            <>
                                                <button
                                                    className="btn-icon btn-role"
                                                    onClick={() => setRoleChangeConfirm(user)}
                                                    title={user.role === 'admin' ? 'Degradar a User' : 'Promover a Admin'}
                                                >
                                                    <i className="fas fa-exchange-alt"></i>
                                                </button>
                                                <button
                                                    className="btn-icon btn-delete"
                                                    onClick={() => setDeleteConfirm(user)}
                                                    title="Eliminar usuario"
                                                >
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </>
                                        ) : (
                                            <span className="no-actions">—</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {users.length === 0 && (
                    <div className="empty-state">
                        <div style={{ fontSize: '4rem' }}>
                            <i className="fas fa-users"></i>
                        </div>
                        <h3>No hay usuarios registrados</h3>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><i className="fas fa-exclamation-triangle"></i> Confirmar Eliminación</h2>
                        </div>
                        <p>¿Estás seguro de que quieres eliminar al usuario <strong>{deleteConfirm.username}</strong>?</p>
                        <p className="warning-text">Esta acción no se puede deshacer.</p>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setDeleteConfirm(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={() => handleDeleteUser(deleteConfirm._id)}
                            >
                                <i className="fas fa-trash-alt"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Change Confirmation Modal */}
            {roleChangeConfirm && (
                <div className="modal-overlay" onClick={() => setRoleChangeConfirm(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><i className="fas fa-exchange-alt"></i> Cambiar Rol</h2>
                        </div>
                        <p>
                            ¿Quieres cambiar el rol de <strong>{roleChangeConfirm.username}</strong> de{' '}
                            <strong>{roleChangeConfirm.role === 'admin' ? 'Admin' : 'User'}</strong> a{' '}
                            <strong>{roleChangeConfirm.role === 'admin' ? 'User' : 'Admin'}</strong>?
                        </p>
                        <div className="modal-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setRoleChangeConfirm(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => handleChangeRole(
                                    roleChangeConfirm._id,
                                    roleChangeConfirm.role === 'admin' ? 'user' : 'admin'
                                )}
                            >
                                <i className="fas fa-check"></i> Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminUsers;
