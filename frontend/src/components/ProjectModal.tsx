import { useState } from "react";
import "./ProjectModal.css";

type ProjectModalProps = {
  onClose: () => void;
  onProjectCreated: (project: any) => void;
  onNotification: (notification: {
    message: string;
    type: "success" | "error";
  }) => void;
};

function ProjectModal({
  onClose,
  onProjectCreated,
  onNotification,
}: ProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleCreateProject = async () => {
    if (!name.trim()) {
      onNotification({
        message: "Digite o nome do projeto.",
        type: "error",
      });
      return;
    }

    if (!startDate || !dueDate) {
      onNotification({
        message: "Preencha a data de início e o prazo.",
        type: "error",
      });
      return;
    }

    if (dueDate < startDate) {
      onNotification({
        message: "O prazo não pode ser anterior à data de início.",
        type: "error",
      });
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("https://taskflow-3xqh.onrender.com/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          status: "In Progress",
          startDate,
          dueDate,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
        return;
      }

      if (!response.ok) {
        onNotification({
          message: "Não foi possível criar o projeto.",
          type: "error",
        });
        return;
      }

      const createdProject = await response.json();

      onProjectCreated(createdProject);

      onNotification({
        message: "Projeto criado com sucesso!",
        type: "success",
      });

      onClose();
    } catch (error) {
      console.error(error);

      onNotification({
        message: "Não foi possível conectar ao servidor.",
        type: "error",
      });
    }
  };

  return (
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
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="project-modal-form">
          <label>
            Nome do projeto
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex.: Novo projeto"
            />
          </label>

          <label>
            Descrição
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descreva brevemente o projeto"
            />
          </label>

          <div className="project-modal-dates">
            <label>
              Data de início
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </label>

            <label>
              Prazo
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
          </div>

          <div className="project-modal-actions">
            <button
              className="project-cancel-button"
              type="button"
              onClick={onClose}
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
    </div>
  );
}

export default ProjectModal;