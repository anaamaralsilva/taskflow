import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notification, setNotification] = useState<{
     message: string;
     type: "success" | "error";
    } | null>(null);

    useEffect(() => {
  if (!notification) {
    return;
  }

  const timer = setTimeout(() => {
    setNotification(null);
  }, 3000);

  return () => clearTimeout(timer);
}, [notification]);

  const handleResetPassword = async () => {
  if (!newPassword || !confirmPassword) {
    setNotification({
      message: "Preencha os dois campos.",
      type: "error",
    });
    return;
  }

  if (newPassword !== confirmPassword) {
    setNotification({
      message: "As senhas não coincidem.",
      type: "error",
    });
    return;
  }

  if (!token) {
    setNotification({
      message: "Token de recuperação inválido.",
      type: "error",
    });
    return;
  }

  try {
    const response = await fetch(
      "https://taskflow-3xqh.onrender.com/api/auth/reset-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setNotification({
        message: data.message || "Não foi possível redefinir a senha.",
        type: "error",
      });
      return;
    }

    setNotification({
      message: "Senha redefinida com sucesso!",
      type: "success",
    });
    navigate("/");
  } catch {
    setNotification({
      message: "Erro ao conectar com o servidor.",
      type: "error",
    });
  }
};

  return (
  <div className="reset-page">
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
    <div className="reset-container">

      <div className="reset-brand">
        <div className="reset-brand-content">
          <span className="reset-brand-badge">TASKFLOW</span>

          <h1>
            Crie uma nova
            <br />
            senha segura.
          </h1>

          <p>
            Escolha uma nova senha para recuperar o acesso
            à sua conta e continuar seus projetos.
          </p>
        </div>
      </div>

      <div className="reset-form-section">
        <div className="reset-card">

          <div className="reset-header">
            <h2>Redefinir senha</h2>
            <p>Digite e confirme sua nova senha.</p>
          </div>

          <div className="reset-form-group">
            <label htmlFor="newPassword">Nova senha</label>

            <input
              id="newPassword"
              type="password"
              placeholder="Digite sua nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="reset-form-group">
            <label htmlFor="confirmPassword">Confirmar nova senha</label>

            <input
              id="confirmPassword"
              type="password"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <p className="reset-password-hint">
            Use no mínimo 8 caracteres, com letra maiúscula, minúscula,
            número e caractere especial.
          </p>

          <button
            className="reset-submit-button"
            type="button"
            onClick={handleResetPassword}
          >
            Redefinir senha
          </button>

          <div className="reset-login-area">
            <span>Voltar para</span>

            <button
              className="reset-login-button"
              type="button"
              onClick={() => navigate("/")}
            >
              Login
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
);
}

export default ResetPassword;