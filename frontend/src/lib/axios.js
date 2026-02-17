import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL + "/api",
    withCredentials: true, //to send cookies with requests
})

export default axiosInstance;