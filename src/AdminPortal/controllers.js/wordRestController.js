import { requestEndpoint } from "./requestController";

export const capitalizeFirstLetter = (val) => {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
};

export const uploadWord = async ({ term, videoUrl, meanings }) => {
  const request = {
    restParams: { uri: "/words", params: { term, videoUrl, meanings } },
    method: "POST",
  };
  try {
    await requestEndpoint(request);
  } catch (error) {
    throw new Error("Erro ao fazer upload de palavra: ", error);
  }
};

export const retrieveWords = async () => {
  const request = {
    restParams: { uri: "/words" },
    isNoToken: true,
  };
  try {
    const response = await requestEndpoint(request);
    return response;
  } catch (error) {
    throw new Error("Erro ao recuperar palavras: ", error);
  }
};
