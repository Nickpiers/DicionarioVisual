import { useNavigate } from "react-router-dom";
import { paths } from "../../controllers/paths";
import { Header } from "../../components/Header";
import { TITLE_PAGE_ADMIN_PORTAL } from "../../controllers/constants";
import { useEffect, useState } from "react";
import { FaPlus, FaUpload } from "react-icons/fa";
import { AddMeaningCard } from "./AddMeaningCard";
import { scheduleTokenCheck } from "../controllers.js/loginController";

export const AdminPortalHome = () => {
  const navigate = useNavigate();

  const [word, setWord] = useState("");
  const [video, setVideo] = useState(null);
  const [meanings, setMeanings] = useState([
    { significado: "", descricao: "", exemplo: "" },
    { significado: "", descricao: "", exemplo: "" },
  ]);

  const handleAddMeaning = () => {
    setMeanings([...meanings, { significado: "", descricao: "", exemplo: "" }]);
  };

  const handleUpload = async () => {};

  const renderWordInput = () => (
    <div className="col-span-2">
      <label className="block text-lg font-medium mb-2 text-[#2c3e50]">
        Palavra
      </label>
      <input
        type="text"
        placeholder="Digite a nova palavra..."
        value={word}
        onChange={(e) => setWord(e.target.value)}
        className="w-full border border-gray-300 rounded-md p-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#2c3e50]"
      />
    </div>
  );

  const renderVideoUpload = () => (
    <div className="col-span-1">
      <label className="block text-lg font-medium mb-2 text-[#2c3e50]">
        Upload de Vídeo
      </label>
      <label className="cursor-pointer flex items-center justify-center border-2 border-dashed border-gray-400 rounded-md p-6 hover:bg-gray-50 transition">
        <FaUpload className="text-2xl text-[#2c3e50] mr-2" />
        <span className="text-[#2c3e50] font-medium">Anexar vídeo</span>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files[0])}
          className="hidden"
        />
      </label>
      {video && (
        <p className="text-sm text-gray-600 mt-2 truncate">{video.name}</p>
      )}
    </div>
  );

  const renderButtons = () => (
    <div className="flex justify-between mt-10">
      <button
        onClick={handleAddMeaning}
        className="flex items-center justify-center bg-[#2c3e50] text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-[#1a252f] transition-colors cursor-pointer"
      >
        <FaPlus className="mr-2" /> Add Significado
      </button>

      <button
        onClick={handleUpload}
        className="flex items-center justify-center bg-green-600 text-white py-3 px-6 rounded-md text-lg font-medium hover:bg-green-700 transition-colors cursor-pointer"
      >
        <FaUpload className="mr-2" /> Upload
      </button>
    </div>
  );

  const renderFooter = () => (
    <footer className="bg-[#2c3e50] text-white text-center p-2">
      Dicionário Visual de Palavras Polissêmicas © 2025 - Projeto de
      Acessibilidade e Inclusão Digital
    </footer>
  );

  const logout = (path) => {
    localStorage.removeItem("token");
    navigate(path);
  };

  useEffect(() => {
    scheduleTokenCheck();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header
        onIconClick={() => logout(paths.adminPortalLogin)}
        isPortal
        redirectAction={() => logout(paths.dictionaryHome)}
        headerTitle={TITLE_PAGE_ADMIN_PORTAL}
        headerLogo="logout"
      />
      <main className="flex flex-col flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold text-[#2c3e50] mb-8 text-center">
          Cadastro de Nova Palavra
        </h1>

        <div className="flex flex-col bg-white shadow-lg rounded-2xl p-8 flex-1">
          <div className="grid grid-cols-3 gap-8 mb-8">
            {renderWordInput()}
            {renderVideoUpload()}
          </div>
          <AddMeaningCard meanings={meanings} setMeanings={setMeanings} />
          {renderButtons()}
        </div>
      </main>
      {renderFooter()}
    </div>
  );
};
