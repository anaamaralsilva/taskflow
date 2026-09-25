import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async () => {
  if (!name.trim() || !email.trim() || !password || !confirmPassword) {
    alert("Preencha todos os campos.");
    return;
  }

  if (password !== confirmPassword) {
    alert("As senhas não coincidem.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5025/api/auth/register", {
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
    alert(
      "Não foi possível realizar o cadastro.\n\nA senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma letra minúscula, um número e um caractere especial."
     );
     return;
    }

    alert("Cadastro realizado com sucesso!");
    navigate("/");
  } catch {
    alert("Erro ao conectar com o servidor.");
  }
};

 return (
  <div className="register-page">
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