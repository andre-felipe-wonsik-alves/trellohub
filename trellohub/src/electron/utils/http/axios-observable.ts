import axios from 'axios';
import {observer} from './http-observer.js';

const observable_axios = axios.create({baseURL:'http://localhost:5173'});

observable_axios.interceptors.response.use(
    response => response,
    error => {
        observer.notify(error);
        return Promise.reject(error);
    }
);

export default observable_axios;