import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Tasks.css";
import Sidebar from "../components/Sidebar";
import TaskModal from "../components/TaskModal";

type Task = {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  projectId: number;
};

type Project = {
  id: number;
  name: string;
};

function Tasks() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

const [notification, setNotification] = useState<{
  message: string;
  type: "success" | "error";
} | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const [tasksResponse, projectsResponse] = await Promise.all([
          fetch("http://localhost:5025/api/tasks", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5025/api/projects", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (tasksResponse.status === 401 || projectsResponse.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
          return;
        }

        if (tasksResponse.ok) {
          setTasks(await tasksResponse.json());
        }

        if (projectsResponse.ok) {
          setProjects(await projectsResponse.json());
        }
      } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(normalizedSearch) ||
        (task.description ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const getProjectName = (projectId: number) => {
    return (
      projects.find((project) => project.id === projectId)?.name ||
      "Projeto"
    );
  };

  const getStatusLabel = (status: string) => {
    if (status === "Pending") return "Pendente";
    if (status === "In Progress") return "Em andamento";
    if (status === "Completed") return "Concluída";
    return status;
  };

  const getPriorityLabel = (priority: string) => {
    if (priority === "Low") return "Baixa";
    if (priority === "Medium") return "Média";
    if (priority === "High") return "Alta";
    return priority;
  };

  const formatDate = (date?: string) => {
    if (!date || date.startsWith("0001-")) {
      return "Não definido";
    }

    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="tasks-page">
      <Sidebar />
     {showTaskForm && (
  <TaskModal
    projects={projects}
    taskToEdit={taskToEdit}
    onClose={() => {
      setShowTaskForm(false);
      setTaskToEdit(null);
    }}
    onTaskCreated={(createdTask) => {
      setTasks((currentTasks) => [
        ...currentTasks,
        createdTask,
      ]);
    }}
    onTaskUpdated={(updatedTask) => {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
    }}
    onNotification={setNotification}
  />
)}

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

      <main className="tasks-main">
      
        <header className="tasks-topbar">
  <div>
    <span className="tasks-eyebrow">TAREFAS</span>
    <h1>Todas as tarefas</h1>
    <p>
      Acompanhe suas atividades, prioridades e prazos em um só lugar.
    </p>
  </div>

        <div className="tasks-header-actions">
  <button
    type="button"
    className="tasks-new-button"
    onClick={() => setShowTaskForm(true)}
  >
    + Nova tarefa
  </button>

  <button
    type="button"
    className="tasks-back-button"
    onClick={() => navigate("/dashboard")}
  >
    ← Visão geral
  </button>
</div>
</header>

        <section className="tasks-summary">
          <div>
            <span>Total</span>
            <strong>{tasks.length}</strong>
          </div>

          <div>
            <span>Pendentes</span>
            <strong>
              {tasks.filter((task) => task.status === "Pending").length}
            </strong>
          </div>

          <div>
            <span>Em andamento</span>
            <strong>
              {tasks.filter((task) => task.status === "In Progress").length}
            </strong>
          </div>

          <div>
            <span>Concluídas</span>
            <strong>
              {tasks.filter((task) => task.status === "Completed").length}
            </strong>
          </div>
        </section>

        <section className="tasks-content">
          <div className="tasks-toolbar">
            <div className="tasks-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Buscar tarefa..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">Todos os status</option>
              <option value="Pending">Pendentes</option>
              <option value="In Progress">Em andamento</option>
              <option value="Completed">Concluídas</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
            >
              <option value="All">Todas as prioridades</option>
              <option value="Low">Baixa</option>
              <option value="Medium">Média</option>
              <option value="High">Alta</option>
            </select>
          </div>

          <div className="tasks-results-header">
            <div>
              <span className="tasks-eyebrow">LISTAGEM</span>
              <h2>Suas tarefas</h2>
            </div>

            <span>
              {filteredTasks.length}{" "}
              {filteredTasks.length === 1
                ? "tarefa encontrada"
                : "tarefas encontradas"}
            </span>
          </div>

          {loading ? (
            <div className="tasks-empty">Carregando tarefas...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="tasks-empty">
              <strong>Nenhuma tarefa encontrada.</strong>
              <span>Tente alterar a busca ou os filtros selecionados.</span>
            </div>
          ) : (
            <div className="tasks-list">
              {filteredTasks.map((task) => (
                <article className="tasks-card" key={task.id}>
                  <div className="tasks-card-main">
                    <div className="tasks-check">
                      {task.status === "Completed" ? "✓" : ""}
                    </div>

                    <div className="tasks-card-content">
                      <div className="tasks-card-title-row">
                        <h3>{task.title}</h3>

                        <div className="tasks-badges">
                          <span
                            className={`tasks-status status-${task.status
                              .toLowerCase()
                              .replaceAll(" ", "-")}`}
                          >
                            {getStatusLabel(task.status)}
                          </span>

                          <span
                            className={`tasks-priority priority-${task.priority.toLowerCase()}`}
                          >
                            {getPriorityLabel(task.priority)}
                          </span>
                        </div>
                      </div>

                      <p>{task.description || "Tarefa sem descrição."}</p>

                      <div className="tasks-meta">
                        <span>
                          Projeto:{" "}
                          <strong>{getProjectName(task.projectId)}</strong>
                        </span>

                        <span>Prazo: {formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                  </div>

                 <div className="tasks-item-actions">
  <button
    type="button"
    className="tasks-edit-button"
    onClick={() => {
      setTaskToEdit(task);
      setShowTaskForm(true);
    }}
  >
    Editar
  </button>

  <button
    type="button"
    className="tasks-open-button"
    onClick={() => navigate(`/projects/${task.projectId}`)}
  >
    Abrir projeto →
  </button>
</div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Tasks;