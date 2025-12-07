// prettier-ignore
import { FaInfoCircle, FaBookOpen, FaVideo, FaQuestionCircle, FaUsers, FaLanguage } from "react-icons/fa";
import "../style/WelcomeScreen.css";

export const WelcomeScreen = () => {
  const renderSobreEsteSite = () => (
    <div className="welcome-card">
      <div className="card-header">
        <FaInfoCircle className="text-blue-600" aria-hidden="true" />
        <h2>Sobre este site</h2>
      </div>
      <p className="card-content">
        Este site é um dicionário especializado em palavras polissêmicas (com
        múltiplos significados) desenvolvido para:
      </p>
      <ul className="card-list">
        <li>
          <FaUsers aria-hidden="true" />
          Comunidade surda
        </li>
        <li>
          <FaLanguage aria-hidden="true" />
          Aprendizes de português como segunda língua
        </li>
      </ul>
    </div>
  );

  const renderPalavrasPolissemicas = () => (
    <div className="welcome-card">
      <div className="card-header">
        <FaBookOpen className="text-blue-600" aria-hidden="true" />
        <h2>Palavras Polissêmicas</h2>
      </div>
      <p className="card-content">
        Explore palavras com múltiplos significados e seus usos em diferentes
        contextos.
      </p>
    </div>
  );

  const renderVideo = () => (
    <div className="welcome-card">
      <div className="card-header">
        <FaVideo className="text-blue-600" aria-hidden="true" />
        <h2>Vídeos em LIBRAS</h2>
      </div>
      <p className="card-content">
        Cada significado acompanhado de vídeo demonstrando o sinal
        correspondente em LIBRAS.
      </p>
    </div>
  );

  const renderComoUsar = () => (
    <div className="welcome-card welcome-card-yellow">
      <div className="card-header">
        <FaQuestionCircle className="text-yellow-600" aria-hidden="true" />
        <h2>Como usar este dicionário:</h2>
      </div>
      <ol className="card-ol">
        <li>1. Selecione uma palavra na barra lateral</li>
        <li>2. Veja todos os significados da palavra</li>
        <li>3. Assista aos vídeos em LIBRAS para cada significado</li>
      </ol>
    </div>
  );

  return (
    <div className="welcome-screen">
      <h1>Bem-vindo ao Dicionário Visual de Palavras Polissêmicas</h1>
      <div className="cards-text grid gap-6 max-w-3xl">
        {renderSobreEsteSite()}
        <div className="grid md:grid-cols-2 gap-6">
          {renderPalavrasPolissemicas()}
          {renderVideo()}
        </div>
        {renderComoUsar()}
      </div>
    </div>
  );
};
