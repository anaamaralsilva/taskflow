import { useEffect, useState } from "react";
import "./TaskModal.css";

type Project = {
  id: number;
  name: string;
};

type Task = {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  projectId: number;
};

type Notification = {
  message: string;
  type: "success" | "error";
};

type TaskModalProps = {
  projects: Project[];
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
  onTaskUpdated?: (task: Task) => void;
  onNotification: (notification: Notification) => void;
  taskToEdit?: Task | null;
};

function TaskModal({
  projects,
  onClose,
  onTaskCreated,
  onTaskUpdated,
  onNotification,
  taskToEdit = null,
}: TaskModalProps) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
  if (taskToEdit) {
    setTitle(taskToEdit.title);
    setDescription(taskToEdit.description || "");
    setProjectId(String(taskToEdit.projectId));
    setPriority(taskToEdit.priority);
    setDueDate(
      taskToEdit.dueDate
        ? taskToEdit.dueDate.split("T")[0]
        : ""
    );
  }
}, [taskToEdit]);

  const handleCreateTask = async () => {
  if (!title.trim()) {
    onNotification({
      message: "Digite o título da tarefa.",
      type: "error",
    });
    return;
  }

  if (!projectId) {
    onNotification({
      message: "Selecione um projeto.",
      type: "error",
    });
    return;
  }

  if (!dueDate) {
    onNotification({
      message: "Selecione o prazo da tarefa.",
      type: "error",
    });
    return;
  }

  const token = localStorage.getItem("token");

  try {
    setCreating(true);

    const isEditing = !!taskToEdit;

    const response = await fetch(
      isEditing
        ? `http://localhost:5025/api/tasks/${taskToEdit.id}`
        : "http://localhost:5025/api/tasks",
      {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          status: isEditing ? taskToEdit.status : "Pending",
          priority,
          dueDate,
          projectId: Number(projectId),
        }),
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
      return;
    }

    if (!response.ok) {
      onNotification({
        message: isEditing
          ? "Não foi possível atualizar a tarefa."
          : "Não foi possível criar a tarefa.",
        type: "error",
      });
      return;
    }

    const savedTask = await response.json();

    if (isEditing) {
      onTaskUpdated?.(savedTask);

      onNotification({
        message: "Tarefa atualizada com sucesso!",
        type: "success",
      });
    } else {
      onTaskCreated(savedTask);

      onNotification({
        message: "Tarefa criada com sucesso!",
        type: "success",
      });
    }

    onClose();
  } catch (error) {
    console.error(error);

    onNotification({
      message: "Não foi possível conectar ao servidor.",
      type: "error",
    });
  } finally {
    setCreating(false);
  }
};

  return (
    <div className="task-modal-overlay">
      <div className="task-modal">
        <div className="task-modal-header">
          <div>
            <span className="task-modal-label">
  {taskToEdit ? "EDITAR TAREFA" : "NOVA TAREFA"}
</span>

<h2>
  {taskToEdit ? "Editar tarefa" : "Criar tarefa"}
</h2>

<p>
  {taskToEdit
    ? "Atualize as informações da sua tarefa."
    : "Adicione uma nova tarefa ao seu projeto."}
</p>
          </div>

          <button
            className="task-modal-close"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="task-modal-form">
          <div className="task-form-group">
            <label htmlFor="taskTitle">Título da tarefa</label>

            <input
              id="taskTitle"
              type="text"
              placeholder="Ex.: Revisar documentação"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="task-form-group">
            <label htmlFor="taskDescription">Descrição</label>

            <textarea
              id="taskDescription"
              placeholder="Descreva brevemente a tarefa"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="task-form-group">
            <label htmlFor="taskProject">Projeto</label>

            <select
              id="taskProject"
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
            >
              <option value="">Selecione um projeto</option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="task-modal-row">
            <div className="task-form-group">
              <label htmlFor="taskPriority">Prioridade</label>

              <select
                id="taskPriority"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
              >
                <option value="Low">Baixa</option>
                <option value="Medium">Média</option>
                <option value="High">Alta</option>
              </select>
            </div>

            <div className="task-form-group">
              <label htmlFor="taskDueDate">Prazo</label>

              <input
                id="taskDueDate"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="task-modal-actions">
          <button
            className="task-cancel-button"
            type="button"
            onClick={onClose}
            disabled={creating}
          >
            Cancelar
          </button>

          <button
            className="task-create-button"
            type="button"
            onClick={handleCreateTask}
            disabled={creating}
          >
            {creating
  ? taskToEdit
    ? "Salvando..."
    : "Criando..."
  : taskToEdit
    ? "Salvar alterações"
    : "Criar tarefa"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;