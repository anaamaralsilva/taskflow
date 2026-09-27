import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProjectDetails.css";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [projectStatus, setProjectStatus] = useState("");
  const [tasks, setTasks] = useState<any[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskStatus, setTaskStatus] = useState("Pending");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskError, setTaskError] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState(false);
  
  const [showEditProjectForm, setShowEditProjectForm] = useState(false);
  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectDescription, setEditProjectDescription] = useState("");
  const [editProjectStartDate, setEditProjectStartDate] = useState("");
  const [editProjectDueDate, setEditProjectDueDate] = useState("");

  const [taskFilter, setTaskFilter] = useState<
  "All" | "Pending" | "In Progress" | "Completed"
>("All");

  const [notification, setNotification] = useState<{
  message: string;
  type: "success" | "error";
} | null>(null);

   const completedTasks = tasks.filter(
     (task) => task.status === "Completed"
   ).length;

   const progress =
     tasks.length > 0
       ? Math.round((completedTasks / tasks.length) * 100)
       : 0;

  useEffect(() => {
  if (!notification) {
    return;
  }

  const timer = setTimeout(() => {
    setNotification(null);
  }, 3000);

  return () => clearTimeout(timer);
}, [notification]);

  useEffect(() => {
  const loadProject = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
  `http://localhost:5025/api/projects/${id}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

if (response.status === 401) {
  localStorage.removeItem("token");
  navigate("/");
  return;
}

if (!response.ok) {
  return;
}

      const data = await response.json();
      setProject(data);
      setProjectStatus(data.status);
      const tasksResponse = await fetch(
  "http://localhost:5025/api/tasks",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

if (tasksResponse.status === 401) {
  localStorage.removeItem("token");
  navigate("/");
  return;
}
if (tasksResponse.ok) {
  const tasksData = await tasksResponse.json();

  const projectTasks = tasksData.filter(
    (task: { projectId: number }) => task.projectId === Number(id)
  );

  setTasks(projectTasks);
}
    } catch (error) {
      console.error(error);
    }
  };

  loadProject();
}, [id]);
const handleCreateTask = async () => {
  if (!taskTitle.trim() || !taskDueDate) {
setTaskError("Preencha o título e o prazo da tarefa.");  return;
}

setTaskError("");

  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:5025/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: taskTitle,
        description: taskDescription,
        status: taskStatus,
        priority: taskPriority,
        dueDate: taskDueDate,
        projectId: Number(id),
      }),
    });

    if (response.status === 401) {
  localStorage.removeItem("token");
  navigate("/");
  return;
}

if (!response.ok) {
  console.error("Erro ao criar tarefa");
  return;
}

    const newTask = await response.json();

    setTasks((currentTasks) => [...currentTasks, newTask]);

    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("Medium");
    setTaskStatus("Pending");
    setTaskDueDate("");
    setShowTaskForm(false);

    setNotification({
  message: "Tarefa criada com sucesso!",
  type: "success",
});

  } catch (error) {
    console.error(error);
  }
};
const handleDeleteTask = async (taskId: number) => {
  
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:5025/api/tasks/${taskId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/");
      return;
    }

    if (!response.ok) {
      console.error("Erro ao excluir tarefa");
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    );

    setNotification({
    message: "Tarefa excluída com sucesso!",
    type: "success",
  });

  } catch (error) {
  console.error(error);

  setNotification({
    message: "Não foi possível conectar ao servidor.",
    type: "error",
  });
}
};

  const handleDeleteProject = async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:5025/api/projects/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/");
      return;
    }

    if (!response.ok) {
      setNotification({
        message: "Não foi possível excluir o projeto.",
        type: "error",
      });
      return;
    }

    navigate("/dashboard");
  } catch (error) {
    console.error(error);

    setNotification({
      message: "Não foi possível conectar ao servidor.",
      type: "error",
    });
  }
};
const handleUpdateProject = async () => {
  if (!project) {
    return;
  }

  if (!editProjectName.trim()) {
    setNotification({
      message: "Digite o nome do projeto.",
      type: "error",
    });
    return;
  }

  if (!editProjectStartDate || !editProjectDueDate) {
    setNotification({
      message: "Preencha a data de início e o prazo.",
      type: "error",
    });
    return;
  }

  if (editProjectDueDate < editProjectStartDate) {
    setNotification({
      message: "O prazo não pode ser anterior à data de início.",
      type: "error",
    });
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:5025/api/projects/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editProjectName.trim(),
          description: editProjectDescription,
          startDate: editProjectStartDate,
          dueDate: editProjectDueDate,
          status: projectStatus,
        }),
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/");
      return;
    }

    if (!response.ok) {
      setNotification({
        message: "Não foi possível atualizar o projeto.",
        type: "error",
      });
      return;
    }

    const updatedProject = await response.json();

    setProject(updatedProject);
    setProjectStatus(updatedProject.status);
    setShowEditProjectForm(false);

    setNotification({
      message: "Projeto atualizado com sucesso!",
      type: "success",
    });
  } catch (error) {
    console.error(error);

    setNotification({
      message: "Não foi possível conectar ao servidor.",
      type: "error",
    });
  }
};

const handleEditTask = (task: any) => {
  setEditingTaskId(task.id);
  setTaskTitle(task.title);
  setTaskDescription(task.description);
  setTaskPriority(task.priority);
  setTaskStatus(task.status);
  setTaskDueDate(task.dueDate.split("T")[0]);
  setTaskError("");
  setShowTaskForm(true);
};

const handleUpdateTask = async () => {
  if (!editingTaskId) {
    return;
  }

  if (!taskTitle.trim() || !taskDueDate) {
    setTaskError("Preencha o título e o prazo da tarefa.");
    return;
  }

  setTaskError("");

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:5025/api/tasks/${editingTaskId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          status: taskStatus,
          priority: taskPriority,
          dueDate: taskDueDate,
        }),
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/");
      return;
    }

    if (!response.ok) {
      console.error("Erro ao atualizar tarefa");
      return;
    }

    const updatedTask = await response.json();

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === editingTaskId ? updatedTask : task
      )
    );

    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("Medium");
    setTaskStatus("Pending");
    setTaskDueDate("");
    setEditingTaskId(null);
    setShowTaskForm(false);

    setNotification({
     message: "Tarefa atualizada com sucesso!",
     type: "success",
    });
  } catch (error) {
    console.error(error);
  }
};
const handleUpdateProjectStatus = async (newStatus: string) => {
  if (!project) {
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(
      `http://localhost:5025/api/projects/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
         name: project.name,
         description: project.description,
         status: newStatus,
         startDate: project.startDate,
         dueDate: project.dueDate,
        }),
      }
    );

    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/");
      return;
    }

    if (!response.ok) {
      setNotification({
        message: "Não foi possível atualizar o status do projeto.",
        type: "error",
       });
      return;
    }

    const updatedProject = await response.json();

    setProject(updatedProject);
    setProjectStatus(updatedProject.status);
  } catch (error) {
    console.error(error);
    setNotification({
      message: "Não foi possível conectar ao servidor.",
      type: "error",
     });
  }
};

 return (
  <div className="project-details-page">
    {notification && (
  <div className={`notification-toast ${notification.type}`}>
    <span>{notification.message}</span>

    <button
      type="button"
      onClick={() => setNotification(null)}
    >
      ×
    </button>
  </div>
)}
    {taskToDelete !== null && (
  <div className="delete-modal-overlay">
    <div className="delete-modal">
      <div className="delete-modal-icon">!</div>

      <h2>Excluir tarefa?</h2>

      <p>
        Tem certeza de que deseja excluir esta tarefa?
        Esta ação não poderá ser desfeita.
      </p>

      <div className="delete-modal-actions">
        <button
          type="button"
          className="delete-modal-cancel"
          onClick={() => setTaskToDelete(null)}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="delete-modal-confirm"
          onClick={async () => {
            await handleDeleteTask(taskToDelete);
            setTaskToDelete(null);
          }}
        >
          Excluir tarefa
        </button>
      </div>
    </div>
  </div>
)}

{showDeleteProjectModal && (
  <div className="delete-modal-overlay">
    <div className="delete-modal">
      <div className="delete-modal-icon">!</div>

      <h2>Excluir projeto?</h2>

      <p>
        Tem certeza de que deseja excluir este projeto?
        Esta ação não poderá ser desfeita.
      </p>

      <div className="delete-modal-actions">
        <button
          type="button"
          className="delete-modal-cancel"
          onClick={() => setShowDeleteProjectModal(false)}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="delete-modal-confirm"
          onClick={async () => {
            await handleDeleteProject();
            setShowDeleteProjectModal(false);
          }}
        >
          Excluir projeto
        </button>
      </div>
    </div>
  </div>
)}
    <div className="project-details-container">

    <div className="project-page-heading">
     <span className="section-label">PROJETO</span>
     <h1>Detalhes do projeto</h1>
     <p>Gerencie as informações e tarefas do seu projeto.</p>
  </div>
      <button
  className="back-button"
  onClick={() => navigate("/dashboard")}
>
  ← Voltar ao Dashboard
</button>

      {project ? (
        <>
          <div className="project-details-header">
            <div className="project-title-area">
             <span className="project-card-label">PROJETO ATUAL</span>
             <h1>{project.name}</h1>
             <p>{project.description}</p>
            
            <button
  type="button"
  className="edit-project-button"
  onClick={() => {
    setEditProjectName(project.name);
    setEditProjectDescription(project.description);
    setEditProjectStartDate(
      project.startDate && !project.startDate.startsWith("0001-")
        ? project.startDate.split("T")[0]
        : ""
    );
    setEditProjectDueDate(
      project.dueDate && !project.dueDate.startsWith("0001-")
        ? project.dueDate.split("T")[0]
        : ""
    );
    setShowEditProjectForm(true);
  }}
>
  Editar projeto
</button>
            <button
              type="button"
              className="delete-project-button"
              onClick={() => setShowDeleteProjectModal(true)}
            >
               Excluir projeto
             </button>
             {showEditProjectForm && (
  <div className="edit-project-form">
    <label>Nome do projeto</label>
    <input
      type="text"
      value={editProjectName}
      onChange={(e) => setEditProjectName(e.target.value)}
    />

    <label>Descrição</label>
    <textarea
      value={editProjectDescription}
      onChange={(e) => setEditProjectDescription(e.target.value)}
    />

    <div className="edit-project-dates">
      <div>
        <label>Data de início</label>
        <input
          type="date"
          value={editProjectStartDate}
          onChange={(e) => setEditProjectStartDate(e.target.value)}
        />
      </div>

      <div>
        <label>Prazo</label>
        <input
          type="date"
          value={editProjectDueDate}
          onChange={(e) => setEditProjectDueDate(e.target.value)}
        />
      </div>
    </div>

    <div className="edit-project-actions">
      <button
        type="button"
        onClick={() => setShowEditProjectForm(false)}
      >
        Cancelar
      </button>

      <button
       type="button"
       onClick={handleUpdateProject}
      >
       Salvar alterações
     </button>
    </div>
  </div>
)}
            </div>
            <div className="project-info-grid">

  <div className="project-info-card">
    <span className="project-info-label">STATUS</span>

    <select
      value={projectStatus}
      onChange={(e) => {
        const newStatus = e.target.value;
        setProjectStatus(newStatus);
        handleUpdateProjectStatus(newStatus);
      }}
    >
      <option value="Active">Ativo</option>
      <option value="In Progress">Em andamento</option>
      <option value="Completed">Concluído</option>
    </select>
  </div>

  <div className="project-info-card">
    <span className="project-info-label">DATA DE INÍCIO</span>
    <strong>
      {project.startDate && !project.startDate.startsWith("0001-")
        ? new Date(project.startDate).toLocaleDateString("pt-BR")
        : "Não definido"}
    </strong>
  </div>

  <div className="project-info-card">
    <span className="project-info-label">PRAZO</span>
    <strong>
      {project.dueDate && !project.dueDate.startsWith("0001-")
        ? new Date(project.dueDate).toLocaleDateString("pt-BR")
        : "Não definido"}
    </strong>
  </div>

</div>
<div className="project-progress">
  <div className="project-progress-header">
    <div>
      <span className="project-progress-label">PROGRESSO DO PROJETO</span>
      <p>
        {completedTasks} de {tasks.length}{" "}
        {tasks.length === 1 ? "tarefa concluída" : "tarefas concluídas"}
      </p>
    </div>

    <strong>{progress}%</strong>
  </div>

  <div className="project-progress-bar">
    <div
      className="project-progress-fill"
      style={{ width: `${progress}%` }}
    />
  </div>
</div>
          </div>

          <div className="tasks-section">
            <div className="tasks-header">
              <h2>Tarefas do Projeto</h2>

              <button
                 className="new-task-button"
                 onClick={() => {
                   setEditingTaskId(null);
                   setTaskTitle("");
                   setTaskDescription("");
                   setTaskPriority("Medium");
                   setTaskStatus("Pending");
                   setTaskDueDate("");
                   setTaskError("");
                   setShowTaskForm(true);
                  }}
                >
                  + Nova Tarefa
                </button>
            </div>

            <div className="task-filters">
  <button
    type="button"
    className={taskFilter === "All" ? "active" : ""}
    onClick={() => setTaskFilter("All")}
  >
    Todas <span>{tasks.length}</span>
  </button>

  <button
    type="button"
    className={taskFilter === "Pending" ? "active" : ""}
    onClick={() => setTaskFilter("Pending")}
  >
    Pendentes{" "}
    <span>
      {tasks.filter((task) => task.status === "Pending").length}
    </span>
  </button>

  <button
    type="button"
    className={taskFilter === "In Progress" ? "active" : ""}
    onClick={() => setTaskFilter("In Progress")}
  >
    Em andamento{" "}
    <span>
      {tasks.filter((task) => task.status === "In Progress").length}
    </span>
  </button>

  <button
    type="button"
    className={taskFilter === "Completed" ? "active" : ""}
    onClick={() => setTaskFilter("Completed")}
  >
    Concluídas{" "}
   <span>
    {tasks.filter((task) => task.status === "Completed").length}
   </span>
  </button>
</div>

             {showTaskForm && (
  <div className="task-form">

    {taskError && (
  <p className="task-error">{taskError}</p>
)}

<label>Título</label>

    <input
      type="text"
      placeholder="Título da tarefa"
      value={taskTitle}
      onChange={(e) => setTaskTitle(e.target.value)}
    />

    <label>Descrição</label>

    <textarea
      placeholder="Descrição"
      value={taskDescription}
      onChange={(e) => setTaskDescription(e.target.value)}
    />

    <label>Prioridade</label>

    <select
      value={taskPriority}
      onChange={(e) => setTaskPriority(e.target.value)}
    >
      <option value="Low">Baixa</option>
      <option value="Medium">Média</option>
      <option value="High">Alta</option>
    </select>

    <label>Status</label>

    <select
  value={taskStatus}
  onChange={(e) => setTaskStatus(e.target.value)}
>
  <option value="Pending">Pendente</option>
  <option value="In Progress">Em andamento</option>
  <option value="Completed">Concluída</option>
</select>

<label>Prazo</label>

    <input
      type="date"
      value={taskDueDate}
      onChange={(e) => setTaskDueDate(e.target.value)}
    />

    <div className="task-form-actions">
      <button onClick={() => setShowTaskForm(false)}>
        Cancelar
      </button>

      <button
       onClick={editingTaskId ? handleUpdateTask : handleCreateTask}
      >
        {editingTaskId ? "Salvar Alterações" : "Criar Tarefa"}
     </button>
    </div>
  </div>
)}
            {tasks.length > 0 ? (
              <div>

                {tasks.filter((task) =>
                  taskFilter === "All" ? true : task.status === taskFilter
                ).length === 0 && (
                  <div className="empty-tasks">
                    <p>Nenhuma tarefa encontrada neste filtro.</p>
                    <span>
                      As tarefas com esse status aparecerão aqui.
                    </span>
                  </div>
                 )}
                {tasks
                  .filter((task) =>
                  taskFilter === "All" ? true : task.status === taskFilter
                   )
                  .map((task) => (
                  <div
                     className={`task-card ${
                        task.status === "Completed" ? "task-card-completed" : ""
                      }`}
                      key={task.id}
                      >
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
<div className="task-meta">
  <div className="task-meta-item">
    <span className="task-meta-label">STATUS</span>

    <span
      className={`task-badge status-${task.status
        .toLowerCase()
        .replaceAll(" ", "-")}`}
    >
      {task.status === "Pending"
        ? "Pendente"
        : task.status === "In Progress"
        ? "Em andamento"
        : task.status === "Completed"
        ? "Concluída"
        : task.status}
    </span>
  </div>

  <div className="task-meta-item">
    <span className="task-meta-label">PRIORIDADE</span>

    <span
      className={`task-badge priority-${task.priority.toLowerCase()}`}
    >
      {task.priority === "Low"
        ? "Baixa"
        : task.priority === "Medium"
        ? "Média"
        : task.priority === "High"
        ? "Alta"
        : task.priority}
    </span>
  </div>

  <div className="task-meta-item">
    <span className="task-meta-label">PRAZO</span>

    <strong>
      {new Date(task.dueDate).toLocaleDateString("pt-BR")}
    </strong>
  </div>
</div>

                    <button
                     className="edit-task-button"
                     onClick={() => handleEditTask(task)}
                    >
                     Editar
                    </button>
                    
                    <button
                     className="delete-task-button"
                     onClick={() => setTaskToDelete(task.id)}
                   >
                    Excluir
                  </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhuma tarefa cadastrada neste projeto.</p>
            )}
          </div>
        </>
      ) : (
        <p>Carregando projeto...</p>
      )}
    </div>
  </div>
);
}
export default ProjectDetails;