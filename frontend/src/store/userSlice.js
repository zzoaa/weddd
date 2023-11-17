import { createSlice } from "@reduxjs/toolkit";

// 초기 상태 정의
const initialState = {
  userData: {
    id: null,
    name: "",
    email: "",
    loggedIn: false,
  }
  
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // 로그인 액션
    login: (state, action) => {
      const { id, name, email } = action.payload;
      state.userData.id = id;
      state.userData.name = name;
      state.userData.email = email;
      state.userData.loggedIn = true;
    },
    isLogin: (state) => {
      const userData = sessionStorage.getItem("ud");
      if (userData) {
        state.userData.id = JSON.parse(userData).id;
        state.userData.name = JSON.parse(userData).name;
        state.userData.loggedIn = true;
      }
    },
    // 로그아웃 액션
    logout: (state) => {
      state.id = null;
      state.name = "";
      state.email = "";
      state.loggedIn = false;
      sessionStorage.removeItem("at");
      sessionStorage.removeItem("rt");
      sessionStorage.removeItem("ud");
    },
    // 사용자 정보 업데이트 액션
    updateUser: (state, action) => {
      const { name, email } = action.payload;
      if (name) state.name = name;
      if (email) state.email = email;
    },
  },
});

// 액션 내보내기
export const { login, logout, isLogin, updateUser, checkUser } =
  userSlice.actions;
//셀렉터 내보내기
export const selectIsLoggedIn = (state) => state.user.loggedIn;
// 리듀서 내보내기
export default userSlice.reducer;
