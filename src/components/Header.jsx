import { FaHome, FaSearch, FaBuilding, FaBook } from "react-icons/fa";

// prettier-ignore
import { TITLE_DICTIONARY, TITLE_ADMIN_PORTAL } from '../controllers/constants'

import "../style/Header.css";

export const Header = ({
  onIconClick,
  setSearchedWord,
  isPortal = false,
  headerTitle,
  redirectAction,
}) => {
  const redirectTitle = isPortal ? TITLE_DICTIONARY : TITLE_ADMIN_PORTAL;

  const renderRedirectButton = () => (
    <div className="logo">
      <button
        id="redirect-button"
        title={redirectTitle}
        className="redirect-button"
        onClick={redirectAction}
      >
        {isPortal ? <FaBook /> : <FaBuilding />}
      </button>
    </div>
  );

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
          <h1 className="text-3xl font-bold mb-3">{headerTitle}</h1>
          <p className="text-sm">
            Palavras Polissêmicas - Comunicação Acessível
          </p>
        </div>
      </div>

      <div className="right-section">
        {!isPortal && (
          <div className="relative max-w-[400px]">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80" />
            <input
              type="text"
              placeholder="Pesquisar palavra..."
              className="w-full pl-12 pr-4 py-3 text-white text-lg rounded-full bg-white/15 placeholder-white/70 focus:outline-none focus:bg-white/25 focus:ring-3 focus:ring-blue-400/50 transition"
              onChange={(event) => setSearchedWord(event.target.value)}
            />
          </div>
        )}
        {renderRedirectButton()}
      </div>
    </header>
  );
};
