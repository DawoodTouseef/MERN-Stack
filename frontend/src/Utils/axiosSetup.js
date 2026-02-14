import axios from 'axios';
import Cookies from 'js-cookie';

const applyCSRFHeader = () => {
  axios.interceptors.request.use((config) => {
    const csrfToken = Cookies.get('csrf-token');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  });
};

export default applyCSRFHeader;
