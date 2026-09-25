import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const handleForgotPassword = async () => {
  if (!email.trim()) {
    alert("Digite seu e-mail.");
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:5025/api/auth/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );
    
    if (response.status === 429) {
      alert(
    "Muitas solicitações de recuperação. Aguarde um minuto e tente novamente."
  );
  return;
}

if (!response.ok) {
  alert("Não foi possível enviar o e-mail de recuperação.");
  return;
}

    alert("Enviamos um link de recuperação para o seu e-mail. Verifique sua caixa de entrada.");
    navigate("/");
  } catch {
    alert("Erro ao conectar com o servidor.");
  }
};

  return (
  <div className="forgot-page">
    <div className="forgot-container">

      <div className="forgot-brand">
        <div className="forgot-brand-content">
          <span className="forgot-brand-badge">TASKFLOW</span>

          <h1>
            Recupere o acesso
            <br />
            à sua conta.
          </h1>

          <p>
            Informe seu e-mail e enviaremos as instruções
            para você criar uma nova senha.
          </p>
        </div>
      </div>

      <div className="forgot-form-section">
        <div className="forgot-card">

          <div className="forgot-header">
            <h2>Esqueceu sua senha?</h2>

            <p>
              Digite o e-mail cadastrado na sua conta.
            </p>
          </div>

          <div className="forgot-form-group">
            <label htmlFor="email">E-mail</label>

            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            className="forgot-submit-button"
            type="button"
            onClick={handleForgotPassword}
          >
            Enviar link de recuperação
          </button>

          <div className="forgot-login-area">
            <span>Lembrou sua senha?</span>

            <button
              className="forgot-login-button"
              type="button"
              onClick={() => navigate("/")}
            >
              Voltar para o login
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
);
}

export default ForgotPassword;