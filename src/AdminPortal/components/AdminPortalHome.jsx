import { useNavigate } from "react-router-dom";
import { Header } from "../../components/Header";
import { paths } from "../../controllers/paths";

export const AdminPortalHome = () => {
  const navigate = useNavigate();

  const renderFooter = () => (
    <footer className="bg-[#2c3e50] text-white text-center p-2">
      Dicionário Visual de Palavras Polissêmicas © 2025 - Projeto de
      Acessibilidade e Inclusão Digital
    </footer>
  );

  return (
    <div className="flex flex-col h-screen">
      <Header
        onIconClick={() => {}}
        isPortal
        redirectAction={() => navigate(paths.dictionaryHome)}
      />
      <main className="flex flex-row overflow-hidden flex-1" />
      {renderFooter()}
    </div>
  );
};
