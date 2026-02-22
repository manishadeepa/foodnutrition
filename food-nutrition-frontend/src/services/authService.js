import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000"
});

export const loginUser = (data) => API.post("/login", data);
export const signupUser = (data) => API.post("/signup", data);
