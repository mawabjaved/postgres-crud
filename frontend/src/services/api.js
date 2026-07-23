import axios from "axios";

const api = axios.create({
  baseURL: "https://postgres-crud-backend.onrender.com",
});

export default api;