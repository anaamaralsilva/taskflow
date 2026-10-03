import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleForgotPassword = async () => {
  if (!email.trim()) {
    setNotification({
      message: "Digite seu e-mail.",
      type: "error",
    });
    return;
  }

  try {
    setIsLoading(true);

    const response = await fetch(
      "https://taskflow-3xqh.onrender.com/api/auth/forgot-password",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );
    
    if (response.status === 429) {
      setNotification({
        message:
          "Muitas solicitações de recuperação. Aguarde um minuto e tente novamente.",
        type: "error",
      });

  return;
}

if (!response.ok) {
  setNotification({
     message: "Não foi possível enviar o e-mail de recuperação.",
   type: "error",
  });
  return;
}

   setNotification({
     message: "Enviamos um link de recuperação para o seu e-mail. Verifique sua caixa de entrada.",
     type: "success",
    });
  
 } catch {
  setNotification({
    message: "Erro ao conectar com o servidor.",
    type: "error",
  });
} finally {
  setIsLoading(false);
}
};

  return (
  <div className="forgot-page">
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
  disabled={isLoading}
>
  {isLoading ? "Enviando..." : "Enviar link de recuperação"}
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