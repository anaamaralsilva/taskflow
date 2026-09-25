import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [projectsCount, setProjectsCount] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const [tasksCount, setTasksCount] = useState(0);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [completedTasksCount, setCompletedTasksCount] = useState(0);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectStartDate, setNewProjectStartDate] = useState("");
const [newProjectDueDate, setNewProjectDueDate] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleCreateProject = async () => {
  if (!newProjectName.trim()) {
    alert("Digite o nome do projeto.");
    return;
  }

  if (!newProjectStartDate || !newProjectDueDate) {
  alert("Preencha a data de início e o prazo.");
  return;
}

if (newProjectDueDate < newProjectStartDate) {
  alert("O prazo não pode ser anterior à data de início.");
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
      alert("Não foi possível criar o projeto.");
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

    alert("Projeto criado com sucesso!");
  } catch (error) {
    console.error(error);
    alert("Não foi possível conectar ao servidor.");
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
          {projects.map((project) => (
            <div
              className="project-item"
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="project-item-top">
                <div className="project-symbol">
                  {project.name.charAt(0).toUpperCase()}
                </div>

                <span className="project-status">
                  {project.status}
                </span>
              </div>

              <div className="project-content">
                <h3>{project.name}</h3>

                <p>
                  {project.description || "Projeto sem descrição."}
                </p>
              </div>

              <div className="project-footer">
                <span>Abrir projeto</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>

      </section>

    </main>

  </div>
);
}

export default Dashboard;