// prettier-ignore
import { FaInfoCircle, FaBookOpen, FaVideo, FaQuestionCircle, FaUsers, FaLanguage } from "react-icons/fa";

export const WelcomeScreen = () => {
  const renderSobreEsteSite = () => (
    <div className="bg-blue-50 p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <FaInfoCircle className="text-blue-600 text-3xl" aria-hidden="true" />
        <h2 className="font-semibold text-lg">Sobre este site</h2>
      </div>
      <p className="mb-2">
        Este site é um dicionário especializado em palavras polissêmicas (com
        múltiplos significados) desenvolvido para:
      </p>
      <ul className="list-disc pl-6 text-gray-700">
        <li className="flex items-center gap-2">
          <FaUsers className="text-gray-600 text-2xl" aria-hidden="true" />
          Comunidade surda
        </li>
        <li className="flex items-center gap-2">
          <FaLanguage className="text-gray-600 text-2xl" aria-hidden="true" />
          Aprendizes de português como segunda língua
        </li>
      </ul>
    </div>
  );

  const renderPalavrasPolissemicas = () => (
    <div className="bg-blue-50 p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <FaBookOpen className="text-blue-600 text-3xl" aria-hidden="true" />
        <h2 className="font-semibold text-lg">Palavras Polissêmicas</h2>
      </div>
      <p className="text-gray-700">
        Explore palavras com múltiplos significados e seus usos em diferentes
        contextos.
      </p>
    </div>
  );

  const renderVideo = () => (
    <div className="bg-blue-50 p-6 rounded-xl shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <FaVideo className="text-blue-600 text-3xl" aria-hidden="true" />
        <h2 className="font-semibold text-lg">Vídeos em LIBRAS</h2>
      </div>
      <p className="text-gray-700">
        Cada significado acompanhado de vídeo demonstrando o sinal
        correspondente em LIBRAS.
      </p>
    </div>
  );

  const renderComoUsar = () => (
    <div className="bg-yellow-50 p-6 rounded-xl shadow-sm border border-yellow-200">
      <div className="flex items-center gap-3 mb-3">
        <FaQuestionCircle
          className="text-yellow-600 text-3xl"
          aria-hidden="true"
        />
        <h2 className="font-semibold text-lg">Como usar este dicionário:</h2>
      </div>
      <ol className="list-decimal pl-6 text-gray-700">
        <li>Selecione uma palavra na barra lateral</li>
        <li>Veja todos os significados da palavra</li>
        <li>Assista aos vídeos em LIBRAS para cada significado</li>
      </ol>
    </div>
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Bem-vindo ao Dicionário Visual de Palavras Polissêmicas
      </h1>
      <div className="grid gap-6 max-w-3xl">
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
