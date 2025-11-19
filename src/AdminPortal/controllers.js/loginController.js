import { jwtDecode } from "jwt-decode";
import { requestEndpoint } from "./requestController";

export const loginUser = async (email, password) => {
  const request = {
    restParams: { uri: "auth/login", params: { email, password } },
    method: "POST",
    isLogin: true,
  };
  try {
    const { token } = await requestEndpoint(request);
    localStorage.setItem("token", token);
  } catch (error) {
    throw new Error("Erro ao fazer login: ", error);
  }
};

export const createUser = async ({ name, email, password, role }) => {
  const params = { name, email, password, role };

  const request = {
    restParams: { uri: "/users", params },
    method: "POST",
  };
  try {
    await requestEndpoint(request);
  } catch (error) {
    throw new Error("Erro ao criar usuário: ", error);
  }
};

export const checkUsers = async () => {
  const request = {
    restParams: { uri: "/users/getUsers" },
  };
  try {
    await requestEndpoint(request);
  } catch (error) {
    throw new Error("Erro ao consultar usuários: ", error);
  }
};

export const scheduleTokenCheck = () => {
  let tokenTimerStarted = false;

  if (tokenTimerStarted) return; // evita agendar novamente
  tokenTimerStarted = true;

  const token = localStorage.getItem("token");
  if (!token) return;

  const decoded = jwtDecode(token);
  const now = Date.now() / 1000; // segundos
  const timeLeft = (decoded.exp - now) * 1000; // ms

  if (timeLeft > 0) {
    setTimeout(() => {
      alert("Sua sessão expirou. Faça login novamente.");
      localStorage.removeItem("token");
      window.location.href = "/admin-portal/login";
      tokenTimerStarted = false; // reseta caso queira novo login depois
    }, timeLeft);
  } else {
    localStorage.removeItem("token");
    window.location.href = "/admin-portal/login";
    tokenTimerStarted = false;
  }
};
