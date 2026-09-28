import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Projects.css";
import Sidebar from "../components/Sidebar";

type Project = {
  id: number;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  dueDate?: string;
};

type Task = {
  id: number;
  projectId: number;
  status: string;
};

function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const [projectsResponse, tasksResponse] = await Promise.all([
          fetch("http://localhost:5025/api/projects", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5025/api/tasks", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (projectsResponse.status === 401 || tasksResponse.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        if (projectsResponse.ok) {
          setProjects(await projectsResponse.json());
        }

        if (tasksResponse.ok) {
          setTasks(await tasksResponse.json());
        }
      } catch (error) {
        console.error("Erro ao carregar projetos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(normalizedSearch) ||
        (project.description ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const getStatusLabel = (status: string) => {
    if (status === "Active") return "Ativo";
    if (status === "In Progress") return "Em andamento";
    if (status === "Completed") return "Concluído";
    return status;
  };

  const formatDate = (date?: string) => {
    if (!date || date.startsWith("0001-")) {
      return "Não definido";
    }

    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="projects-page">
      <Sidebar />

      <main className="projects-main">
        <header className="projects-topbar">
          <div>
            <span className="projects-eyebrow">PROJETOS</span>
            <h1>Todos os projetos</h1>
            <p>
              Visualize, pesquise e acompanhe seus projetos em um só lugar.
            </p>
          </div>

          <button
            type="button"
            className="projects-back-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Visão geral
          </button>
        </header>

        <section className="projects-summary">
          <div>
            <span>Total</span>
            <strong>{projects.length}</strong>
          </div>

          <div>
            <span>Ativos</span>
            <strong>
              {
                projects.filter(
                  (project) => project.status === "Active"
                ).length
              }
            </strong>
          </div>

          <div>
            <span>Em andamento</span>
            <strong>
              {
                projects.filter(
                  (project) => project.status === "In Progress"
                ).length
              }
            </strong>
          </div>

          <div>
            <span>Concluídos</span>
            <strong>
              {
                projects.filter(
                  (project) => project.status === "Completed"
                ).length
              }
            </strong>
          </div>
        </section>

        <section className="projects-content">
          <div className="projects-toolbar">
            <div className="projects-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Buscar projeto..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">Todos os status</option>
              <option value="Active">Ativos</option>
              <option value="In Progress">Em andamento</option>
              <option value="Completed">Concluídos</option>
            </select>
          </div>

          <div className="projects-results-header">
            <div>
              <span className="projects-eyebrow">LISTAGEM</span>
              <h2>Seus projetos</h2>
            </div>

            <span>
              {filteredProjects.length}{" "}
              {filteredProjects.length === 1
                ? "projeto encontrado"
                : "projetos encontrados"}
            </span>
          </div>

          {loading ? (
            <div className="projects-empty">
              Carregando projetos...
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="projects-empty">
              <strong>Nenhum projeto encontrado.</strong>
              <span>
                Tente alterar a busca ou o filtro selecionado.
              </span>
            </div>
          ) : (
            <div className="projects-grid">
              {filteredProjects.map((project) => {
                const projectTasks = tasks.filter(
                  (task) => task.projectId === project.id
                );

                const completedTasks = projectTasks.filter(
                  (task) => task.status === "Completed"
                ).length;

                const progress =
                  projectTasks.length > 0
                    ? Math.round(
                        (completedTasks / projectTasks.length) * 100
                      )
                    : 0;

                return (
                  <article
                    className="projects-card"
                    key={project.id}
                    onClick={() =>
                      navigate(`/projects/${project.id}`)
                    }
                  >
                    <div className="projects-card-top">
                      <div className="projects-card-symbol">
                        {project.name.charAt(0).toUpperCase()}
                      </div>

                      <span
                        className={`projects-status status-${project.status
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {getStatusLabel(project.status)}
                      </span>
                    </div>

                    <div className="projects-card-content">
                      <h3>{project.name}</h3>

                      <p>
                        {project.description ||
                          "Projeto sem descrição."}
                      </p>

                      <span className="projects-card-date">
                        Prazo: {formatDate(project.dueDate)}
                      </span>
                    </div>

                    <div className="projects-card-progress">
                      <div className="projects-progress-header">
                        <span>PROGRESSO</span>
                        <strong>{progress}%</strong>
                      </div>

                      <div className="projects-progress-bar">
                        <div
                          className="projects-progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <small>
                        {projectTasks.length === 0
                          ? "Nenhuma tarefa cadastrada"
                          : `${completedTasks} de ${projectTasks.length} ${
                              projectTasks.length === 1
                                ? "tarefa concluída"
                                : "tarefas concluídas"
                            }`}
                      </small>
                    </div>

                    <div className="projects-card-footer">
                      <span>Abrir projeto</span>
                      <span>→</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Projects;