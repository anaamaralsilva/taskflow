import { useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
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
          <button
            className={`sidebar-link ${
              location.pathname === "/dashboard" ? "active" : ""
            }`}
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            <span className="sidebar-icon">⌂</span>
            Visão geral
          </button>

          <button
            className={`sidebar-link ${
              location.pathname === "/projects" ? "active" : ""
            }`}
            type="button"
            onClick={() => navigate("/projects")}
          >
            <span className="sidebar-icon">▣</span>
            Projetos
          </button>

          <button
            className={`sidebar-link ${
              location.pathname === "/tasks" ? "active" : ""
            }`}
            type="button"
            onClick={() => navigate("/tasks")}
          >
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
  );
}

export default Sidebar;