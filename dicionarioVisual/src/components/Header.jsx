import { FaHome, FaSearch } from "react-icons/fa";

import "../style/Header.css";

export const Header = ({ onIconClick }) => {
  return (
    <header>
      <div className="logo">
        <button
          id="home-button"
          title="Página Inicial"
          className="home-button"
          onClick={onIconClick}
        >
          <FaHome />
        </button>
        <div className="logo-text">
          <h1 className="text-3xl font-bold mb-3">Dicionário Visual</h1>
          <p className="text-sm">
            Palavras Polissêmicas - Comunicação Acessível
          </p>
        </div>
      </div>

      <div className="relative max-w-[400px]">
        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80" />
        <input
          type="text"
          placeholder="Pesquisar palavra..."
          className="w-full pl-12 pr-4 py-3 text-white text-lg rounded-full bg-white/15 placeholder-white/70 focus:outline-none focus:bg-white/25 focus:ring-3 focus:ring-blue-400/50 transition"
        />
      </div>
    </header>
  );
};
