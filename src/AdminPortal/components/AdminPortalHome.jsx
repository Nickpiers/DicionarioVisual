import { useNavigate } from "react-router-dom";
import { paths } from "../../controllers/paths";
import { Header } from "../../components/Header";
// prettier-ignore
import { EXIT_MODAL, TITLE_PAGE_ADMIN_PORTAL, UPLOAD_ERROR_MODAL, UPLOAD_SUCCESS_MODAL } from "../../controllers/constants";
import { useEffect, useState } from "react";
import { scheduleTokenCheck } from "../controllers.js/loginController";
// prettier-ignore
import { capitalizeFirstLetter, uploadWord } from "../controllers.js/wordRestController";
import { ModalHandler } from "./ModalHandler";
import { PortalHomeContent } from "./PortalHomeContent";
import { UploadWordsButton } from "./UploadWordsButton";

export const AdminPortalHome = () => {
  const navigate = useNavigate();

  const [word, setWord] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [meanings, setMeanings] = useState([
    { description: "", example: "" },
    { description: "", example: "" },
  ]);
  const [openModal, setOpenModal] = useState(null);

  const clearPage = () => {
    setWord("");
    setVideoUrl("");
    setMeanings([
      { description: "", example: "" },
      { description: "", example: "" },
    ]);
  };

  const handleUpload = async () => {
    try {
      await uploadWord({
        term: capitalizeFirstLetter(word),
        videoUrl,
        meanings,
      });
      clearPage();
      setOpenModal({ type: UPLOAD_SUCCESS_MODAL });
    } catch (error) {
      console.error(error);
      setOpenModal({ type: UPLOAD_ERROR_MODAL });
    }
  };

  const renderFooter = () => (
    <footer className="bg-[#2c3e50] text-white text-center p-2">
      Dicionário Visual de Palavras Polissêmicas © 2025 - Projeto de
      Acessibilidade e Inclusão Digital
    </footer>
  );

  useEffect(() => {
    scheduleTokenCheck();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header
        onIconClick={() =>
          setOpenModal({ type: EXIT_MODAL, path: paths.adminPortalLogin })
        }
        isPortal
        redirectAction={() =>
          setOpenModal({ type: EXIT_MODAL, path: paths.dictionaryHome })
        }
        headerTitle={TITLE_PAGE_ADMIN_PORTAL}
        headerLogo="logout"
      />
      <PortalHomeContent
        word={word}
        setWord={setWord}
        videoUrl={videoUrl}
        setVideoUrl={setVideoUrl}
        setOpenModal={setOpenModal}
        meanings={meanings}
        setMeanings={setMeanings}
        clearPage={clearPage}
      />
      {renderFooter()}
      <ModalHandler
        openModal={openModal}
        setOpenModal={setOpenModal}
        handleUpload={handleUpload}
        navigate={navigate}
      />
      <UploadWordsButton />
    </div>
  );
};
