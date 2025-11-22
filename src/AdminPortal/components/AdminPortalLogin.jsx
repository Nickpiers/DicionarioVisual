import { useNavigate } from "react-router-dom";
import { Header } from "../../components/Header";
import { paths } from "../../controllers/paths";
import { FaUser } from "react-icons/fa";
import { TITLE_PAGE_ADMIN_PORTAL } from "../../controllers/constants";
import { useState } from "react";
import { loginUser } from "../controllers.js/loginController";

export const AdminPortalLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      await loginUser(email, password);
      navigate(paths.adminPortalHome);
    } catch (err) {
      console.error(err);
      setError("Erro ao autenticar. Verifique suas credenciais.");
    }
  };

  const renderFooter = () => (
    <footer className="bg-[#2c3e50] text-white text-center p-2">
      Dicionário Visual de Palavras Polissêmicas © 2025 - Projeto de
      Acessibilidade e Inclusão Digital
    </footer>
  );

  const renderLogin = () => (
    <main className="flex flex-col items-center justify-center flex-1 bg-gray-100 mb-25">
      <div className="bg-white p-8 rounded-xl shadow-md w-100 text-center mb-5">
        <FaUser className="text-7xl text-[#2c3e50] mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-6 text-[#2c3e50]">Login</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <input
            type="text"
            placeholder="Usuário"
            className="w-full border rounded-md p-2 mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full border rounded-md p-2 mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-600 mb-3">{error}</p>}
          <button
            className="w-full bg-[#2c3e50] text-white py-2 rounded-md hover:bg-[#1a252f] cursor-pointer"
            type="submit"
            onClick={handleLogin}
          >
            Entrar
          </button>
        </form>
      </div>
    </main>
  );

  return (
    <div className="flex flex-col h-screen">
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
