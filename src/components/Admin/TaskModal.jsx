import { useState, useEffect } from 'react';

const TaskModal = ({ task, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'ideas',
        dueDate: '',
        tags: [],
        subtasks: [],
    });

    const [tagInput, setTagInput] = useState('');
    const [subtaskInput, setSubtaskInput] = useState('');

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'medium',
                status: task.status || 'ideas',
                dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                tags: task.tags || [],
                subtasks: task.subtasks || [],
            });
        }
    }, [task]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData({
                ...formData,
                tags: [...formData.tags, tagInput.trim()],
            });
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove),
        });
    };

    const handleAddSubtask = (e) => {
        e.preventDefault();
        if (subtaskInput.trim()) {
            setFormData({
                ...formData,
                subtasks: [...formData.subtasks, { text: subtaskInput.trim(), completed: false }],
            });
            setSubtaskInput('');
        }
    };

    const handleRemoveSubtask = (indexToRemove) => {
        setFormData({
            ...formData,
            subtasks: formData.subtasks.filter((_, index) => index !== indexToRemove),
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content task-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <i className={`fas ${task ? 'fa-edit' : 'fa-plus'}`}></i>
                        {task ? 'Editar Tarea' : 'Nueva Tarea'}
                    </h2>
                    <button className="close-button" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {/* Título */}
                    <div className="form-group">
                        <label>
                            <i className="fas fa-heading"></i> Título *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            placeholder="Nombre de la tarea..."
                            autoFocus
                        />
                    </div>

                    {/* Descripción */}
                    <div className="form-group">
                        <label>
                            <i className="fas fa-align-left"></i> Descripción
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows="4"
                            placeholder="Detalles de la tarea..."
                        />
                    </div>

                    {/* Subtasks Section - AHORA AQUÍ DESPUÉS DE DESCRIPCIÓN */}
                    <div className="form-group">
                        <label>
                            <i className="fas fa-list-check"></i> Lista de Subtareas
                        </label>
                        <div className="tag-input-container">
                            <input
                                type="text"
                                value={subtaskInput}
                                onChange={(e) => setSubtaskInput(e.target.value)}
                                placeholder="Añade una subtarea y presiona Enter..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddSubtask(e);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="add-tag-btn"
                                onClick={handleAddSubtask}
                            >
                                <i className="fas fa-plus"></i>
                            </button>
                        </div>

                        {formData.subtasks.length > 0 && (
                            <div className="subtasks-list">
                                {formData.subtasks.map((subtask, index) => (
                                    <div key={index} className="subtask-item">
                                        <span className="subtask-text">{subtask.text}</span>
                                        <button
                                            type="button"
                                            className="remove-subtask-btn"
                                            onClick={() => handleRemoveSubtask(index)}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Prioridad y Estado */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>
                                <i className="fas fa-flag"></i> Prioridad
                            </label>
                            <select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <option value="low">Baja</option>
                                <option value="medium">Media</option>
                                <option value="high">Alta</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>
                                <i className="fas fa-tasks"></i> Estado
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="ideas">Ideas</option>
                                <option value="todo">Por Hacer</option>
                                <option value="in-progress">En Progreso</option>
                                <option value="done">Completado</option>
                            </select>
                        </div>
                    </div>

                    {/* Fecha de Vencimiento */}
                    <div className="form-group">
                        <label>
                            <i className="fas fa-calendar-alt"></i> Fecha de Vencimiento
                        </label>
                        <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        />
                    </div>

                    {/* Etiquetas */}
                    <div className="form-group">
                        <label>
                            <i className="fas fa-tags"></i> Etiquetas
                        </label>
                        <div className="tag-input-container">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="Escribe una etiqueta y presiona Enter..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleAddTag(e);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="add-tag-btn"
                                onClick={handleAddTag}
                            >
                                <i className="fas fa-plus"></i>
                            </button>
                        </div>

                        {formData.tags.length > 0 && (
                            <div className="tags-list">
                                {formData.tags.map((tag, index) => (
                                    <span key={index} className="tag-chip">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Botones de acción - SEPARADOS */}
                    <div className="modal-actions-separated">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            <i className="fas fa-times-circle"></i> Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            <i className={`fas ${task ? 'fa-save' : 'fa-plus-circle'}`}></i>
                            {task ? 'Guardar Cambios' : 'Crear Tarea'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
