import { FaSearch, FaBuilding, FaBook } from "react-icons/fa";
import { TITLE_DICTIONARY, TITLE_ADMIN_PORTAL } from "../controllers/constants";
import { iconsList } from "../Dictionary/controllers/iconsList";
import "../style/Header.css";

export const Header = ({
  onIconClick,
  setSelectedWord,
  setSearchedWord,
  isPortal = false,
  headerTitle,
  redirectAction,
  headerLogo = "home",
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

  const onChangeSearch = (event) => {
    const valueSearch = event.target.value;
    setSearchedWord(valueSearch);
    if (!valueSearch) setSelectedWord(null);
  };

  return (
    <header>
      <div className="logo">
        {headerLogo && (
          <button
            id="home-button"
            title="Página Inicial"
            className="home-button"
            onClick={onIconClick}
          >
            {iconsList[headerLogo]}
          </button>
        )}
        <div className="logo-text">
          <h1 id="home-title" className="home-title" onClick={onIconClick}>
            {headerTitle}
          </h1>
          <p>Palavras Polissêmicas - Comunicação Acessível</p>
        </div>
      </div>

      <div className="right-section">
        {!isPortal && (
          <div className="search-container">
            <FaSearch aria-hidden="true" />
            <input
              type="text"
              aria-label="Pesquisar palavra"
              placeholder="Pesquisar palavra..."
              onChange={onChangeSearch}
            />
          </div>
        )}
        {renderRedirectButton()}
      </div>
    </header>
  );
};
