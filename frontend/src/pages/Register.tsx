import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  

  const handleRegister = async () => {
  if (!name.trim() || !email.trim() || !password || !confirmPassword) {
    setNotification({
     message: "Preencha todos os campos.",
     type: "error",
    });
    return;
  }

  if (password !== confirmPassword) {
    setNotification({
     message: "As senhas não coincidem.",
     type: "error",
    });
    return;
  }

  try {
    const response = await fetch("https://taskflow-3xqh.onrender.com/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    if (!response.ok) {
  const data = await response.json();

  let errorMessage = "Não foi possível realizar o cadastro.";

  if (data.message === "Email already registered.") {
    errorMessage = "Este e-mail já está cadastrado.";
  } else if (data.message) {
    errorMessage = data.message;
  }

  setNotification({
    message: errorMessage,
    type: "error",
  });

  return;
}

    setNotification({
      message: "Cadastro realizado com sucesso!",
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
  <div className="register-page">
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
    <div className="register-container">

      <div className="register-brand">
        <div className="register-brand-content">
          <span className="register-brand-badge">TASKFLOW</span>

          <h1>
            Comece a organizar
            <br />
            seus projetos.
          </h1>

          <p>
            Crie sua conta e transforme suas ideias em tarefas,
            projetos e resultados.
          </p>
        </div>
      </div>

      <div className="register-form-section">
        <div className="register-card">

          <div className="register-header">
            <h2>Crie sua conta</h2>
            <p>Preencha seus dados para começar.</p>
          </div>

          <div className="register-form-group">
            <label htmlFor="name">Nome</label>
            <input
              id="name"
              type="text"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="Crie uma senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="register-form-group">
            <label htmlFor="confirmPassword">Confirmar senha</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <p className="password-hint">
            Use no mínimo 8 caracteres, com letra maiúscula, minúscula,
            número e caractere especial.
          </p>

          <button
            className="register-submit-button"
            type="button"
            onClick={handleRegister}
          >
            Criar conta
          </button>

          <div className="register-login-area">
            <span>Já possui uma conta?</span>

            <button
              className="register-login-button"
              type="button"
              onClick={() => navigate("/")}
            >
              Entrar
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
);
}

export default Register;