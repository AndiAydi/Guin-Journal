"import axios from \"axios\";

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const http = axios.create({
  baseURL: API,
  withCredentials: true,
});

http.interceptors.request.use((cfg) => {
  const t = localStorage.getItem(\"jg_token\");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
"