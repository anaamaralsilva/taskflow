import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
  try {
    const response = await fetch("http://localhost:5025/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (response.status === 429) {
  alert("Muitas tentativas de login. Aguarde um minuto e tente novamente.");
  return;
}

    if (!response.ok) {
  alert("Email ou senha inválidos.");
  return;
}

    const data = await response.json();

    localStorage.setItem("token", data.token);

   navigate("/dashboard");
  } catch (error) {
    console.error(error);
    alert("Não foi possível conectar ao servidor.");
  }
};

  return (
  <div className="login-page">
    <div className="login-container">

      <div className="login-brand">
        <div className="brand-content">
          <span className="brand-badge">TASKFLOW</span>

          <h1>
            Organize seu trabalho.
            <br />
            Alcance seus objetivos.
          </h1>

          <p>
            Gerencie projetos e tarefas em um único lugar,
            de forma simples e eficiente.
          </p>
        </div>
      </div>

      <div className="login-form-section">
        <div className="login-card">

          <div className="login-header">
            <h2>Bem-vindo de volta</h2>
            <p>Entre na sua conta para continuar.</p>
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="forgot-password-button"
            type="button"
            onClick={() => navigate("/forgot-password")}
          >
            Esqueci minha senha
          </button>

          <button
            className="login-button"
            type="button"
            onClick={handleLogin}
          >
            Entrar
          </button>

          <div className="register-area">
            <span>Ainda não possui uma conta?</span>

            <button
              className="register-button"
              type="button"
              onClick={() => navigate("/register")}
            >
              Criar conta
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
);
}

export default Login;