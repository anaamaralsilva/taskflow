import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

    const data = await response.json();

    window.location.href = data.resetLink;
  } catch {
    alert("Erro ao conectar com o servidor.");
  }
};

  return (
    <div>
      <h1>Esqueci minha senha</h1>

      <p>Digite seu e-mail para recuperar sua senha.</p>

      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={handleForgotPassword}>
        Enviar
      </button>

      <button onClick={() => navigate("/")}>
        Voltar para o Login
      </button>
    </div>
  );
}

export default ForgotPassword;