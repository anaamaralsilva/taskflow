import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./ResetPassword.css";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const handleResetPassword = async () => {
  if (!newPassword || !confirmPassword) {
    alert("Preencha os dois campos.");
    return;
  }

  if (newPassword !== confirmPassword) {
    alert("As senhas não coincidem.");
    return;
  }

  if (!token) {
    alert("Token de recuperação inválido.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5025/api/auth/reset-password",
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
      alert(data.message || "Não foi possível redefinir a senha.");
      return;
    }

    alert("Senha redefinida com sucesso!");
    navigate("/");
  } catch {
    alert("Erro ao conectar com o servidor.");
  }
};

  return (
  <div className="reset-page">
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