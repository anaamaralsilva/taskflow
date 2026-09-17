import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

    if (!response.ok) {
      alert("E-mail ou senha inválidos.");
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
    <div>
      <h1>TaskFlow</h1>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Entrar</button>

      <button onClick={() => navigate("/register")}>
        Cadastre-se
      </button>

      <button onClick={() => navigate("/forgot-password")}>
        Esqueci minha senha
      </button>
    </div>
  );
}

export default Login;