import { useState } from "react";
import "./AdminLogin.css";

interface AdminLoginProps {
  onLogin: (token: string) => void;
}

function AdminLogin({ onLogin }: AdminLoginProps) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();

    setErro("");

    if (!usuario || !senha) {
      setErro("Informe usuário e senha.");
      return;
    }

    try {
      setCarregando(true);

     const response = await fetch(
    "https://cidade-ativa-u2ef.onrender.com/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usuario,
            senha,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.mensagem || "Erro ao realizar login."
        );
      }

      sessionStorage.setItem(
        "adminToken",
        data.token
      );

      onLogin(data.token);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro ao realizar login."
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-icon">🏛️</div>

        <h1>Administração</h1>

        <p className="login-subtitle">
          Acesso restrito aos administradores
        </p>

        <form onSubmit={entrar}>

          <div className="login-campo">
            <label>Usuário</label>

            <input
              type="text"
              placeholder="Digite seu usuário"
              value={usuario}
              onChange={(e) =>
                setUsuario(e.target.value)
              }
              autoComplete="username"
            />
          </div>

          <div className="login-campo">
            <label>Senha</label>

            <div className="senha-container">
              <input
                type={
                  mostrarSenha
                    ? "text"
                    : "password"
                }
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) =>
                  setSenha(e.target.value)
                }
                autoComplete="current-password"
              />

              <button
                type="button"
                className="btn-mostrar-senha"
                onClick={() =>
                  setMostrarSenha(!mostrarSenha)
                }
                aria-label={
                  mostrarSenha
                    ? "Ocultar senha"
                    : "Mostrar senha"
                }
              >
                {mostrarSenha ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {erro && (
            <div className="login-erro">
              {erro}
            </div>
          )}

          <button
            type="submit"
            className="login-botao"
            disabled={carregando}
          >
            {carregando
              ? "Entrando..."
              : "Entrar"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default AdminLogin;