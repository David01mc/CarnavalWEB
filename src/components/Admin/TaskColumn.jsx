import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

const TaskColumn = ({ column, tasks, onEditTask, onDeleteTask, onToggleSubtask }) => {
    const { setNodeRef } = useDroppable({
        id: column.id,
    });

    return (
        <div className="kanban-column">
            <div className="column-header" style={{ borderColor: column.color }}>
                <div className="column-title">
                    <i className={`fas ${column.icon}`} style={{ color: column.color }}></i>
                    <h3>{column.title}</h3>
                    <span className="task-count">{tasks.length}</span>
                </div>
            </div>

            <div
                ref={setNodeRef}
                className="column-content"
            >
                <SortableContext
                    items={tasks.map(t => t._id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.length === 0 ? (
                        <div className="empty-column">
                            <i className="fas fa-inbox"></i>
                            <p>No hay tareas</p>
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <TaskCard
                                key={task._id}
                                task={task}
                                onEdit={onEditTask}
                                onDelete={onDeleteTask}
                                onToggleSubtask={onToggleSubtask}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </div>
    );
};

export default TaskColumn;
