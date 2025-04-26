import Axios from "axios";

const axios = Axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9800',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    transformRequest: [(data, headers) => {
        // 返回json
        return JSON.stringify(data);
    },]
});

export default axios;