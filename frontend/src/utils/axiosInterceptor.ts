import axios from 'axios';
import { history } from './navigation';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, 
  timeout: 60000, 
});




// axiosInstance.interceptors.request.use(
//   (config) => {
//     // Modify the request configuration before sending it
//     // For example, add an Authorization token if it exists
//     const token = localStorage.getItem('authToken'); // Retrieve token from local storage
//     if (token) {
//       config.headers['Authorization'] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     // Handle request error
//     return Promise.reject(error);
//   }
// );


axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.log(error)
      if (error.response.status === 401) {
        console.log("error 401")
        localStorage.clear();
        history.push('/');
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
