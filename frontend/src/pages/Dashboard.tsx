import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [projectsCount, setProjectsCount] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasksCount, setTasksCount] = useState(0);
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectStartDate, setNewProjectStartDate] = useState("");
  const [newProjectDueDate, setNewProjectDueDate] = useState("");

  const [notification, setNotification] = useState<{
  message: string;
  type: "success" | "error";
} | null>(null);

const year = currentDate.getFullYear();
const month = currentDate.getMonth();

const firstDayOfMonth = new Date(year, month, 1);
const lastDayOfMonth = new Date(year, month + 1, 0);

const daysInMonth = lastDayOfMonth.getDate();
const startingDay = firstDayOfMonth.getDay();

const calendarDays = [
  ...Array(startingDay).fill(null),
  ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
];

const monthName = currentDate.toLocaleDateString("pt-BR", {
  month: "long",
  year: "numeric",
});

const selectedDayProjects = selectedDate
  ? projects.filter((project) => {
      if (!project.dueDate || project.dueDate.startsWith("0001-")) {
        return false;
      }

      const dueDate = new Date(project.dueDate);

      return (
        dueDate.getFullYear() === selectedDate.getFullYear() &&
        dueDate.getMonth() === selectedDate.getMonth() &&
        dueDate.getDate() === selectedDate.getDate()
      );
    })
  : [];

const selectedDayTasks = selectedDate
  ? tasks.filter((task) => {
      if (!task.dueDate || task.dueDate.startsWith("0001-")) {
        return false;
      }

      const dueDate = new Date(task.dueDate);

      return (
        dueDate.getFullYear() === selectedDate.getFullYear() &&
        dueDate.getMonth() === selectedDate.getMonth() &&
        dueDate.getDate() === selectedDate.getDate()
      );
    })
  : [];

  useEffect(() => {
  if (!notification) {
    return;
  }

  const timer = setTimeout(() => {
    setNotification(null);
  }, 3000);

  return () => clearTimeout(timer);
}, [notification]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleCreateProject = async () => {
  if (!newProjectName.trim()) {
    setNotification({
      message: "Digite o nome do projeto.",
      type: "error",
    });
    return;
  }

  if (!newProjectStartDate || !newProjectDueDate) {
  setNotification({
  message: "Preencha a data de início e o prazo.",
  type: "error",
});
  return;
}

if (newProjectDueDate < newProjectStartDate) {
  setNotification({
  message: "O prazo não pode ser anterior à data de início.",
  type: "error",
});
  return;
}

  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:5025/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
      name: newProjectName,
      description: newProjectDescription,
      status: "In Progress",
      startDate: newProjectStartDate,
      dueDate: newProjectDueDate,
    }),
    });

    if (response.status === 401) {
      localStorage.removeItem("token");
      navigate("/");
      return;
    }

    if (!response.ok) {
      setNotification({
      message: "Não foi possível criar o projeto.",
      type: "error",
     });
      return;
    }

    const createdProject = await response.json();

    setProjects((currentProjects: any[]) => [
      ...currentProjects,
      createdProject,
    ]);

    setProjectsCount((currentCount) => currentCount + 1);

    setNewProjectName("");
    setNewProjectDescription("");
    setNewProjectStartDate("");
    setNewProjectDueDate("");
    setShowProjectForm(false);

    setNotification({
    message: "Projeto criado com sucesso!",
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

  useEffect(() => {
  const loadProjects = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:5025/api/projects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
  localStorage.removeItem("token");
  navigate("/");
  return;
}

if (!response.ok) {
  return;
}

      const data = await response.json();

      setProjectsCount(data.length);
      setProjects(data);
      const tasksResponse = await fetch("http://localhost:5025/api/tasks", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
if (tasksResponse.status === 401) {
  localStorage.removeItem("token");
  navigate("/");
  return;
}
if (tasksResponse.ok) {
  const tasksData = await tasksResponse.json();
  setTasks(tasksData);
  setTasksCount(tasksData.length);

  const pendingTasks = tasksData.filter(
    (task: { status: string }) => task.status.toLowerCase() === "in progress"
  );

  setPendingTasksCount(pendingTasks.length);

  const completedTasks = tasksData.filter(
  (task: { status: string }) => task.status.toLowerCase() === "completed"
);

setCompletedTasksCount(completedTasks.length);
}
    } catch (error) {
      console.error(error);
    }
  };

  loadProjects();
}, []);

return (
  <div className="dashboard-page">

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

    {showProjectForm && (
  <div className="project-modal-overlay">
    <div className="project-modal">

      <div className="project-modal-header">
        <div>
          <span className="section-label">NOVO PROJETO</span>
          <h2>Criar projeto</h2>
          <p>Adicione as informações do seu novo projeto.</p>
        </div>

        <button
          className="project-modal-close"
          type="button"
          onClick={() => setShowProjectForm(false)}
        >
          ×
        </button>
      </div>

      <div className="project-modal-form">
        <div className="project-form-group">
          <label htmlFor="projectName">Nome do projeto</label>

          <input
            id="projectName"
            type="text"
            placeholder="Ex: TaskFlow Platform"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
        </div>

        <div className="project-dates-row">
  <div className="project-form-group">
    <label htmlFor="projectStartDate">Data de início</label>

    <input
      id="projectStartDate"
      type="date"
      value={newProjectStartDate}
      onChange={(e) => setNewProjectStartDate(e.target.value)}
    />
  </div>

  <div className="project-form-group">
    <label htmlFor="projectDueDate">Prazo</label>

    <input
      id="projectDueDate"
      type="date"
      value={newProjectDueDate}
      onChange={(e) => setNewProjectDueDate(e.target.value)}
    />
  </div>
</div>

        <div className="project-form-group">
          <label htmlFor="projectDescription">Descrição</label>

          <textarea
            id="projectDescription"
            placeholder="Descreva brevemente o objetivo do projeto..."
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
          />
        </div>
      </div>

      <div className="project-modal-actions">
        <button
          className="project-cancel-button"
          type="button"
          onClick={() => {
            setShowProjectForm(false);
            setNewProjectName("");
            setNewProjectDescription("");
            setNewProjectStartDate("");
            setNewProjectDueDate("");
          }}
        >
          Cancelar
        </button>

        <button
          className="project-create-button"
          type="button"
          onClick={handleCreateProject}
        >
          Criar projeto
        </button>
      </div>

    </div>
  </div>
)}

    <aside className="dashboard-sidebar">
      <div>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">T</div>

          <div>
            <strong>TaskFlow</strong>
            <span>Workspace</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-link active" type="button">
            <span className="sidebar-icon">⌂</span>
            Visão geral
          </button>

          <button className="sidebar-link" type="button">
            <span className="sidebar-icon">▣</span>
            Projetos
          </button>

          <button className="sidebar-link" type="button">
            <span className="sidebar-icon">✓</span>
            Tarefas
          </button>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar">TF</div>

          <div>
            <strong>Minha conta</strong>
            <span>TaskFlow</span>
          </div>
        </div>

        <button
          className="sidebar-logout"
          type="button"
          onClick={handleLogout}
        >
          Sair
        </button>
      </div>
    </aside>

    <main className="dashboard-main">

      <header className="dashboard-topbar">
        <div>
          <span className="dashboard-eyebrow">TASKFLOW</span>
          <h1>Visão geral</h1>
          <p>Acompanhe seus projetos e tarefas em um só lugar.</p>
        </div>

        <button
          className="topbar-logout"
          type="button"
          onClick={handleLogout}
        >
          Sair
        </button>
      </header>

      <section className="dashboard-cards">

        <div className="dashboard-card">
          <div className="card-top">
            <span>Projetos</span>
            <div className="card-icon">▣</div>
          </div>

          <strong>{projectsCount}</strong>
          <p>Projetos no seu workspace</p>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <span>Tarefas</span>
            <div className="card-icon">✓</div>
          </div>

          <strong>{tasksCount}</strong>
          <p>Total de tarefas cadastradas</p>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <span>Em andamento</span>
            <div className="card-icon">◷</div>
          </div>

          <strong>{pendingTasksCount}</strong>
          <p>Tarefas que precisam de atenção</p>
        </div>

        <div className="dashboard-card">
          <div className="card-top">
            <span>Concluídas</span>
            <div className="card-icon">✓</div>
          </div>

          <strong>{completedTasksCount}</strong>
          <p>Tarefas finalizadas</p>
        </div>

      </section>

      <section className="projects-section">

        <div className="projects-section-header">
          <div>
            <span className="section-label">PROJETOS</span>
            <h2>Meus projetos</h2>
            <p>Acesse um projeto para visualizar e gerenciar suas tarefas.</p>
          </div>

          <div className="projects-header-actions">
           <span className="projects-total">
            {projectsCount} projeto(s)
          </span>

         <button
           className="new-project-button"
           type="button"
           onClick={() => setShowProjectForm(true)}
          >
           + Novo projeto
          </button>
        </div>
        </div>

        <div className="projects-list">
          {projects.map((project) => {
            const projectTasks = tasks.filter(
              (task) => task.projectId === project.id
             );

            const completedProjectTasks = projectTasks.filter(
              (task) => task.status === "Completed"
            ).length;

             const projectProgress =
              projectTasks.length > 0
                ? Math.round(
                    (completedProjectTasks / projectTasks.length) * 100
                  )
                : 0;

           return (
            <div
              className="project-item"
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="project-item-top">
                <div className="project-symbol">
                  {project.name.charAt(0).toUpperCase()}
                </div>

                <span
  className={`project-status status-${project.status
    .toLowerCase()
    .replaceAll(" ", "-")}`}
>
  {project.status === "Active"
    ? "Ativo"
    : project.status === "In Progress"
    ? "Em andamento"
    : project.status === "Completed"
    ? "Concluído"
    : project.status}
                </span>
              </div>

              <div className="project-content">
                <h3>{project.name}</h3>

                <p>
                  {project.description || "Projeto sem descrição."}
                </p>
                <span className="project-due-date">
                   Prazo:{" "}
                     {project.dueDate && !project.dueDate.startsWith("0001-")
                       ? new Date(project.dueDate).toLocaleDateString("pt-BR")
                     : "Não definido"}
                </span>
              </div>
             <div className="project-progress-mini">
  <div className="project-progress-mini-header">
    <span>Progresso</span>
    <strong>{projectProgress}%</strong>
  </div>

  <div className="project-progress-mini-bar">
    <div
      className="project-progress-mini-fill"
      style={{ width: `${projectProgress}%` }}
    />
  </div>

  <span className="project-progress-mini-text">
  {projectTasks.length === 0
    ? "Nenhuma tarefa cadastrada"
    : `${completedProjectTasks} de ${projectTasks.length} ${
        projectTasks.length === 1
          ? "tarefa concluída"
          : "tarefas concluídas"
      }`}
</span>
</div>
              <div className="project-footer">
                <span>Abrir projeto</span>
                <span>→</span>
              </div>
            </div>
           );
          })}
        </div>

      </section>
      <section className="calendar-section">
  <div className="calendar-header">
    <div>
      <span className="section-label">CALENDÁRIO</span>
      <h2>Agenda</h2>
      <p>Acompanhe os prazos dos seus projetos e tarefas.</p>
    </div>

    <div className="calendar-navigation">
      <button
        type="button"
        onClick={() =>
          setCurrentDate(new Date(year, month - 1, 1))
        }
      >
        ‹
      </button>

      <strong>{monthName}</strong>

      <button
        type="button"
        onClick={() =>
          setCurrentDate(new Date(year, month + 1, 1))
        }
      >
        ›
      </button>
    </div>
  </div>

  <div className="calendar-weekdays">
    <span>DOM</span>
    <span>SEG</span>
    <span>TER</span>
    <span>QUA</span>
    <span>QUI</span>
    <span>SEX</span>
    <span>SÁB</span>
  </div>

  <div className="calendar-grid">
    {calendarDays.map((day, index) => {
  if (day === null) {
    return (
      <div
        className="calendar-day empty"
        key={`empty-${index}`}
      />
    );
  }

  const date = new Date(year, month, day);

  const today = new Date();

  const isToday =
   today.getFullYear() === year &&
   today.getMonth() === month &&
   today.getDate() === day;

  const projectEvents = projects.filter((project) => {
    if (!project.dueDate || project.dueDate.startsWith("0001-")) {
      return false;
    }

    const dueDate = new Date(project.dueDate);

    return (
      dueDate.getFullYear() === date.getFullYear() &&
      dueDate.getMonth() === date.getMonth() &&
      dueDate.getDate() === date.getDate()
    );
  });

  const taskEvents = tasks.filter((task) => {
    if (!task.dueDate || task.dueDate.startsWith("0001-")) {
      return false;
    }

    const dueDate = new Date(task.dueDate);

    return (
      dueDate.getFullYear() === date.getFullYear() &&
      dueDate.getMonth() === date.getMonth() &&
      dueDate.getDate() === date.getDate()
    );
  });

  return (
        <button
  type="button"
  className={`calendar-day ${
  selectedDate &&
  selectedDate.getFullYear() === year &&
  selectedDate.getMonth() === month &&
  selectedDate.getDate() === day
    ? "selected"
    : ""
} ${isToday ? "today" : ""}`}
onClick={() =>
  setSelectedDate(new Date(year, month, day))
}
>
  <span className="calendar-day-number">{day}</span>

  {isToday && (
  <span className="calendar-today-label">HOJE</span>
)}

  <div className="calendar-events">
    {projectEvents.map((project) => (
      <div
        className="calendar-event project-event"
        key={`project-${project.id}`}
      >
        {project.name}
      </div>
    ))}

    {taskEvents.map((task) => (
      <div
        className="calendar-event task-event"
        key={`task-${task.id}`}
      >
        {task.title}
      </div>
    ))}
  </div>
</button>
       );
    })}
  </div>
  {selectedDate && (
  <div className="selected-day-panel">
    <div className="selected-day-header">
      <div>
        <span className="section-label">DIA SELECIONADO</span>

        <h3>
          {selectedDate.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </h3>
      </div>

      <button
        type="button"
        className="selected-day-close"
        onClick={() => setSelectedDate(null)}
      >
        ×
      </button>
    </div>

    {selectedDayProjects.length === 0 &&
    selectedDayTasks.length === 0 ? (
      <div className="selected-day-empty">
        Nenhum compromisso para este dia.
      </div>
    ) : (
      <div className="selected-day-events">
        {selectedDayProjects.map((project) => (
          <div
            className="selected-event-card project"
            key={`selected-project-${project.id}`}
          >
            <span>PROJETO</span>
            <strong>{project.name}</strong>
          </div>
        ))}

        {selectedDayTasks.map((task) => (
          <div
            className="selected-event-card task"
            key={`selected-task-${task.id}`}
          >
            <span>TAREFA</span>
            <strong>{task.title}</strong>

            <small>
              {task.status === "Pending"
                ? "Pendente"
                : task.status === "In Progress"
                ? "Em andamento"
                : task.status === "Completed"
                ? "Concluída"
                : task.status}
            </small>
          </div>
        ))}
      </div>
    )}
  </div>
)}
</section>

    </main>

  </div>
);
}

export default Dashboard;