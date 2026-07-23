import axios from "axios";

const api = axios.create({
    baseURL: "https://postgres-crud-tdpg.onrender.com",
});

export default api;