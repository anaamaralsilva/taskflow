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
  } catch (error) {
    console.error(error);
  }
};
const handleDeleteTask = async (taskId: number) => {
  const confirmed = window.confirm(
  "Tem certeza que deseja excluir esta tarefa?"
);

if (!confirmed) {
  return;
}
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
  } catch (error) {
    console.error(error);
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
    setTaskDueDate("");
    setEditingTaskId(null);
    setShowTaskForm(false);
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
      alert("Não foi possível atualizar o status do projeto.");
      return;
    }

    const updatedProject = await response.json();

    setProject(updatedProject);
    setProjectStatus(updatedProject.status);
  } catch (error) {
    console.error(error);
    alert("Não foi possível conectar ao servidor.");
  }
};

 return (
  <div className="project-details-page">
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
          </div>
            <div className="project-status-control">
  <span>Status:</span>

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
            <p>
  Início:{" "}
  {project.startDate && !project.startDate.startsWith("0001-")
    ? new Date(project.startDate).toLocaleDateString("pt-BR")
    : "Não definido"}
</p>

<p>
  Prazo:{" "}
  {project.dueDate && !project.dueDate.startsWith("0001-")
    ? new Date(project.dueDate).toLocaleDateString("pt-BR")
    : "Não definido"}
</p>
          </div>

          <div className="tasks-section">
            <div className="tasks-header">
              <h2>Tarefas do Projeto</h2>

              <button
                 className="new-task-button"
                 onClick={() => setShowTaskForm(true)}
                >
                  + Nova Tarefa
                </button>
            </div>
             {showTaskForm && (
  <div className="task-form">

    {taskError && (
  <p className="task-error">{taskError}</p>
)}

    <input
      type="text"
      placeholder="Título da tarefa"
      value={taskTitle}
      onChange={(e) => setTaskTitle(e.target.value)}
    />

    <textarea
      placeholder="Descrição"
      value={taskDescription}
      onChange={(e) => setTaskDescription(e.target.value)}
    />

    <select
      value={taskPriority}
      onChange={(e) => setTaskPriority(e.target.value)}
    >
      <option value="Low">Baixa</option>
      <option value="Medium">Média</option>
      <option value="High">Alta</option>
    </select>

    <select
  value={taskStatus}
  onChange={(e) => setTaskStatus(e.target.value)}
>
  <option value="Pending">Pendente</option>
  <option value="In Progress">Em andamento</option>
  <option value="Completed">Concluída</option>
</select>

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
                {tasks.map((task) => (
                  <div className="task-card" key={task.id}>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                    <p>Status: {task.status}</p>
                    <p>Prioridade: {task.priority}</p>
                    <p>
                      Prazo:{" "}
                      {new Date(task.dueDate).toLocaleDateString("pt-BR")}
                    </p>

                    <button
                     className="edit-task-button"
                     onClick={() => handleEditTask(task)}
                    >
                     Editar
                    </button>
                    
                    <button
                     className="delete-task-button"
                     onClick={() => handleDeleteTask(task.id)}
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