import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
    <div>
      <h1>Redefinir senha</h1>

      <input
        type="password"
        placeholder="Nova senha"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirmar nova senha"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button onClick={handleResetPassword}>
        Redefinir senha
      </button>

      <button onClick={() => navigate("/")}>
        Voltar para o Login
      </button>
    </div>
  );
}

export default ResetPassword;