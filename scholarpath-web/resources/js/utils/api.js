import axios from 'axios';

// Backend Engine (Go / Gin) handling Auth, CRUD, PostgreSQL, Upload
const backendApi = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// AI Engine (Python / FastAPI) handling NLP & Recommendation
const aiApi = axios.create({
    baseURL: 'http://localhost:8001/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor to attach JWT token if available
const tokenInterceptor = (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
};

backendApi.interceptors.request.use(tokenInterceptor);
aiApi.interceptors.request.use(tokenInterceptor);

export { backendApi, aiApi };
