import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskColumn from './TaskColumn';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import '../../styles/components/taskManager.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

const COLUMNS = [
    { id: 'ideas', title: 'Ideas', icon: 'fa-lightbulb', color: '#f093fb' },
    { id: 'todo', title: 'Por Hacer', icon: 'fa-circle', color: '#667eea' },
    { id: 'in-progress', title: 'En Progreso', icon: 'fa-spinner', color: '#19d3da' },
    { id: 'done', title: 'Completado', icon: 'fa-check-circle', color: '#38ef7d' },
];

const TaskManager = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [activeId, setActiveId] = useState(null);
    const [filters, setFilters] = useState({
        priority: '',
        search: '',
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Fetch tasks
    const fetchTasks = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/tasks`, {
                headers: {
                    'x-auth-token': token,
                },
            });

            if (!response.ok) throw new Error('Error al cargar tareas');

            const data = await response.json();
            setTasks(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchTasks();
        }
    }, [user]);

    // Handle drag start
    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    // Handle drag end
    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeTask = tasks.find(t => t._id === active.id);
        const overColumn = over.id;

        // If dropped on a column
        if (COLUMNS.find(col => col.id === overColumn)) {
            if (activeTask.status !== overColumn) {
                // Move to different column
                await moveTask(active.id, overColumn);
            }
        }

        setActiveId(null);
    };

    // Move task to different status
    const moveTask = async (taskId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/tasks/${taskId}/move`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error('Error al mover tarea');

            // Update local state
            setTasks(prevTasks =>
                prevTasks.map(task =>
                    task._id === taskId ? { ...task, status: newStatus } : task
                )
            );
        } catch (err) {
            console.error('Error moving task:', err);
            setError(err.message);
        }
    };

    // Create or update task
    const handleSaveTask = async (taskData) => {
        try {
            const token = localStorage.getItem('token');
            const url = editingTask
                ? `${API_URL}/api/tasks/${editingTask._id}`
                : `${API_URL}/api/tasks`;
            const method = editingTask ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) throw new Error('Error al guardar tarea');

            await fetchTasks();
            setShowModal(false);
            setEditingTask(null);
        } catch (err) {
            console.error('Error saving task:', err);
            setError(err.message);
        }
    };

    // Delete task
    const handleDeleteTask = async (taskId) => {
        if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                    'x-auth-token': token,
                },
            });

            if (!response.ok) throw new Error('Error al eliminar tarea');

            await fetchTasks();
        } catch (err) {
            console.error('Error deleting task:', err);
            setError(err.message);
        }
    };

    // Edit task
    const handleEditTask = (task) => {
        setEditingTask(task);
        setShowModal(true);
    };

    // Toggle subtask completion
    const handleToggleSubtask = async (taskId, subtaskIndex) => {
        try {
            const task = tasks.find(t => t._id === taskId);
            if (!task || !task.subtasks) return;

            const updatedSubtasks = [...task.subtasks];
            updatedSubtasks[subtaskIndex] = {
                ...updatedSubtasks[subtaskIndex],
                completed: !updatedSubtasks[subtaskIndex].completed
            };

            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify({ subtasks: updatedSubtasks }),
            });

            if (!response.ok) throw new Error('Error al actualizar subtarea');

            // Update local state
            setTasks(prevTasks =>
                prevTasks.map(t =>
                    t._id === taskId ? { ...t, subtasks: updatedSubtasks } : t
                )
            );
        } catch (err) {
            console.error('Error toggling subtask:', err);
            setError(err.message);
        }
    };

    // Filter tasks
    const getFilteredTasks = (status) => {
        return tasks.filter(task => {
            const matchesStatus = task.status === status;
            const matchesPriority = !filters.priority || task.priority === filters.priority;
            const matchesSearch = !filters.search ||
                task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                task.description?.toLowerCase().includes(filters.search.toLowerCase());

            return matchesStatus && matchesPriority && matchesSearch;
        });
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="admin-container">
                <h2>Acceso Denegado</h2>
                <p>Esta sección es solo para administradores.</p>
            </div>
        );
    }

    return (
        <div className="task-manager animate-fade-in">
            {/* Header */}
            <div className="task-manager-header">
                <div className="header-left">
                    <h1><i className="fas fa-tasks"></i> Gestor de Tareas</h1>
                    <p>Organiza y gestiona las tareas del equipo</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        setEditingTask(null);
                        setShowModal(true);
                    }}
                >
                    <i className="fas fa-plus"></i> Nueva Tarea
                </button>
            </div>

            {/* Filters */}
            <div className="task-filters">
                <div className="filter-item">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Buscar tareas..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>
                <div className="filter-item">
                    <i className="fas fa-flag"></i>
                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    >
                        <option value="">Todas las prioridades</option>
                        <option value="high">Alta</option>
                        <option value="medium">Media</option>
                        <option value="low">Baja</option>
                    </select>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="alert alert-error">
                    <i className="fas fa-exclamation-circle"></i> {error}
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="loading">
                    <i className="fas fa-spinner fa-spin"></i> Cargando tareas...
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    {/* Kanban Board */}
                    <div className="kanban-board">
                        {COLUMNS.map((column) => (
                            <TaskColumn
                                key={column.id}
                                column={column}
                                tasks={getFilteredTasks(column.id)}
                                onEditTask={handleEditTask}
                                onDeleteTask={handleDeleteTask}
                                onToggleSubtask={handleToggleSubtask}
                            />
                        ))}
                    </div>

                    {/* Drag Overlay */}
                    <DragOverlay>
                        {activeId ? (
                            <TaskCard
                                task={tasks.find(t => t._id === activeId)}
                                isDragging
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}

            {/* Task Modal */}
            {showModal && (
                <TaskModal
                    task={editingTask}
                    onSave={handleSaveTask}
                    onClose={() => {
                        setShowModal(false);
                        setEditingTask(null);
                    }}
                />
            )}
        </div>
    );
};

export default TaskManager;
