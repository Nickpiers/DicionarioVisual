import { useNavigate } from "react-router-dom";
import { Header } from "../../components/Header";
import { paths } from "../../controllers/paths";
import { FaUser } from "react-icons/fa";
import { TITLE_PAGE_ADMIN_PORTAL } from "../../controllers/constants";
import { useState } from "react";
import { loginUser } from "../controllers.js/loginController";
import "../style/AdminPortalLogin.css";

export const AdminPortalLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginUser(email, password);
      navigate(paths.adminPortalHome);
    } catch (err) {
      console.error(err);
      setError("Erro ao autenticar. Verifique suas credenciais.");
    }
    setLoading(false);
  };

  const renderFooter = () => (
    <footer className="admin-footer">
      Dicionário Visual de Palavras Polissêmicas © 2025 - Projeto de
      Acessibilidade e Inclusão Digital
    </footer>
  );

  const loader = (
    <div className="loader-container">
      <div className="loader-spinner"></div>
    </div>
  );

  const renderLogin = () => (
    <main className="admin-login-main">
      <div className="admin-login-box">
        <FaUser className="admin-login-icon" aria-hidden="true" />
        <h1 className="admin-login-title">Login</h1>
        {loading ? (
          loader
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <input
              type="text"
              aria-label="Campo de usuário"
              placeholder="Usuário"
              className="admin-login-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              aria-label="Campo de senha"
              placeholder="Senha"
              className="admin-login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="admin-login-error">{error}</p>}
            <button
              className="admin-login-button"
              type="submit"
              onClick={handleLogin}
            >
              Entrar
            </button>
          </form>
        )}
      </div>
    </main>
  );

  return (
    <div className="admin-portal-container">
      <Header
        onIconClick={() => {}}
        isPortal
        redirectAction={() => navigate(paths.dictionaryHome)}
        headerTitle={TITLE_PAGE_ADMIN_PORTAL}
        headerLogo=""
      />
      {renderLogin()}
      {renderFooter()}
    </div>
  );
};
