import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProjectDetails.css";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState("Medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskError, setTaskError] = useState("");

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
    setTaskDueDate("");
    setShowTaskForm(false);
  } catch (error) {
    console.error(error);
  }
};

 return (
  <div className="project-details-page">
    <div className="project-details-container">
      <button
  className="back-button"
  onClick={() => navigate("/dashboard")}
>
  ← Voltar ao Dashboard
</button>

      {project ? (
        <>
          <div className="project-details-header">
            <h1>{project.name}</h1>
            <p>{project.description}</p>
            <p>Status: {project.status}</p>
            <p>
              Início: {new Date(project.startDate).toLocaleDateString("pt-BR")}
            </p>
            <p>
              Prazo: {new Date(project.dueDate).toLocaleDateString("pt-BR")}
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

    <input
      type="date"
      value={taskDueDate}
      onChange={(e) => setTaskDueDate(e.target.value)}
    />

    <div className="task-form-actions">
      <button onClick={() => setShowTaskForm(false)}>
        Cancelar
      </button>

      <button onClick={handleCreateTask}>
        Criar Tarefa
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