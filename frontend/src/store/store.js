import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

const store = configureStore({
  reducer: rootReducer,

  // 미들웨어 및 기타 설정 추가
});

export default store;
