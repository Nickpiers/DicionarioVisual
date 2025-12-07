export const TITLE_DICTIONARY = "Dicionário Visual";
export const TITLE_ADMIN_PORTAL = "Portal Administrativo";

export const TITLE_PAGE_ADMIN_PORTAL = "Portal Administrativo";

export const EXIT_MODAL = "EXIT_MODAL";
export const CONFIRMATION_MODAL = "CONFIRMATION_MODAL";
export const UPLOAD_SUCCESS_MODAL = "UPLOAD_SUCCESS_MODAL";
export const UPLOAD_ERROR_MODAL = "UPLOAD_ERROR_MODAL";
export const LOADER_MODAL = "LOADER_MODAL";

export const MODAL_CONTENTS = {
  [EXIT_MODAL]: {
    title: "Quer mesmo sair?",
    content: "Você precisará fazer login novamente para acessar o portal!",
    buttonTextFirst: "Ficar",
    buttonTextSecond: "Sair",
    buttonColorSecondProps: "bg-red-600 hover:bg-red-700",
  },
  [CONFIRMATION_MODAL]: {
    title: "Confirmação",
    content: "As informações estão corretas e quer prosseguir para adicionar?",
    buttonTextFirst: "Continuar alterando",
    buttonTextSecond: "Prosseguir",
    buttonColorSecondProps: "bg-green-600 hover:bg-green-700",
  },
  [UPLOAD_SUCCESS_MODAL]: {
    title: "Sucesso!",
    content: "O verbete foi adicionado ao site com sucesso!",
    buttonTextFirst: "Ok",
  },
  [UPLOAD_ERROR_MODAL]: {
    title: "Ops!",
    content: "Ocorreu um erro ao tentar adicionar o verbete. Tente novamente!",
    buttonTextFirst: "Tentar novamente",
  },
};
