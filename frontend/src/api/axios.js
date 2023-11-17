// api.js
import axios from "axios";

export const baseURL = "https://api.helfu.kr/v1/";
// export const baseURL = 'http://localhost:7999/v1/'
const api = axios.create({
  baseURL: baseURL,
});
let refreshTokenRetryCount = 0;
// 토큰을 헤더에 추가하는 로직 (선택적)
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('at');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  response => {
    // If the response is successful, just return it
    refreshTokenRetryCount = 0;
    return response;
  },
  error => {
    if (error.response && error.response.status === 401) {
      // Handle the 401 error
      // For example, refresh the token
      if (refreshTokenRetryCount === 2) {
        sessionStorage.removeItem('rt')
        sessionStorage.removeItem('at')
        sessionStorage.removeItem('ud')
        api.defaults.headers['Authorization'] = null;
        window.location.href = '/members/login';
        return;
      }
      refreshTokenRetryCount++;
      api.defaults.headers['Authorization'] = null;
      return refreshTokenAndReattemptRequest(error);
    }
    return Promise.reject(error);
  }
);

async function refreshTokenAndReattemptRequest(error) {
  try {
    if (refreshTokenRetryCount === 2) {
      window.location.href = '/members/login';
      return;
    }
    if(error.response.status == 401) {
      console.log(error)
      refreshTokenRetryCount++;

      // alert(error.response.data.error);

    }

    //토근 발생 2번 시도후에 로그인 페이지로 이동

    const refreshToken = sessionStorage.getItem('rt');
    const response = await api.post('members/authorize/token', {refreshToken},);
    // console.log(response);
    //새로 발급 받은 토큰으로 다시 저장
    // sessionStorage.setItem('at', response.data.accessToken);
    // sessionStorage.setItem('rt', response.data.refreshToken);
    // sessionStorage.setItem('ud', response.data.userData);
    // // 헤더 다시 세팅
    // api.defaults.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
    // Retry the original request
    return api(error.config);
  } catch (err) {
    console.log('hoho')
    refreshTokenRetryCount++;
    // Handle the error, e.g., logout the user, redirect to login, etc.
    console.error(err);
  }
}

export default api;
