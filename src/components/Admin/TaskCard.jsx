import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PRIORITY_STYLES = {
    high: { bg: '#f44336', color: '#ffffff' },
    medium: { bg: '#ef6c00', color: '#ffffff' },
    low: { bg: '#4caf50', color: '#ffffff' },
};

const PRIORITY_LABELS = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
};

const TaskCard = ({ task, onEdit, onDelete, isDragging, onToggleSubtask }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging || isSortableDragging ? 0.5 : 1,
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
        const formattedDate = date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
        });
        return { formatted: formattedDate, diffDays };
    };

    const dueDate = formatDate(task.dueDate);

    const getInitials = (username) => {
        if (!username) return '?';
        return username.slice(0, 2).toUpperCase();
    };

    const handleSubtaskToggle = (e, index) => {
        e.stopPropagation();
        if (onToggleSubtask) {
            onToggleSubtask(task._id, index);
        }
    };

    const toggleCollapse = (e) => {
        e.stopPropagation();
        setIsCollapsed(!isCollapsed);
    };

    const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.low;

    // Count completed subtasks
    const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`task-card ${isDragging ? 'dragging' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            onClick={() => onEdit && onEdit(task)}
        >
            <div className="task-card-header">
                <div
                    className="priority-badge"
                    style={{
                        background: priorityStyle.bg,
                        color: priorityStyle.color
                    }}
                >
                    <i className="fas fa-flag"></i> {PRIORITY_LABELS[task.priority]}
                </div>
                <div className="task-header-actions">
                    <button
                        className="task-collapse-btn"
                        onClick={toggleCollapse}
                        title={isCollapsed ? 'Expandir' : 'Contraer'}
                    >
                        <i className={`fas fa-chevron-${isCollapsed ? 'down' : 'up'}`}></i>
                    </button>
                    {onDelete && (
                        <button
                            className="task-delete-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(task._id);
                            }}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
            </div>

            <h4 className="task-title">{task.title}</h4>

            {/* Collapsed indicator */}
            {isCollapsed && totalSubtasks > 0 && (
                <div className="task-collapsed-info">
                    <i className="fas fa-tasks"></i>
                    <span>{completedSubtasks}/{totalSubtasks} subtareas</span>
                </div>
            )}

            {/* Expanded content */}
            {!isCollapsed && (
                <>
                    {task.description && (
                        <p className="task-description">{task.description}</p>
                    )}

                    {task.subtasks && task.subtasks.length > 0 && (
                        <div className="task-subtasks">
                            {task.subtasks.map((subtask, index) => (
                                <div key={index} className="task-subtask-item">
                                    <input
                                        type="checkbox"
                                        id={`subtask-${task._id}-${index}`}
                                        checked={subtask.completed || false}
                                        onChange={(e) => handleSubtaskToggle(e, index)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <label
                                        htmlFor={`subtask-${task._id}-${index}`}
                                        className={subtask.completed ? 'completed' : ''}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {subtask.text}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}

                    {task.tags && task.tags.length > 0 && (
                        <div className="task-tags">
                            {task.tags.map((tag, index) => (
                                <span key={index} className="task-tag">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="task-card-footer">
                        {dueDate && (
                            <div className={`task-due-date ${dueDate.diffDays < 3 && dueDate.diffDays >= 0 ? 'urgent' : dueDate.diffDays < 0 ? 'overdue' : ''}`}>
                                <i className="fas fa-calendar-alt"></i>
                                {dueDate.formatted}
                                {dueDate.diffDays < 0 && <i className="fas fa-exclamation-triangle"></i>}
                            </div>
                        )}

                        {task.createdBy && (
                            <div className="task-creator" title={`Creado por ${task.createdBy.username}`}>
                                <div className="creator-avatar">
                                    {getInitials(task.createdBy.username)}
                                </div>
                                <span className="creator-name">{task.createdBy.username}</span>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default TaskCard;
