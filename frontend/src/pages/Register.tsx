import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  <div>
    <h1>Cadastre-se</h1>

    <input
      type="text"
      placeholder="Nome"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />

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

    <input
      type="password"
      placeholder="Confirmar senha"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
    />

    <button onClick={handleRegister}>
      Cadastrar
    </button>

    <button onClick={() => navigate("/")}>
      Já tenho uma conta
    </button>
  </div>
);
}

export default Register;