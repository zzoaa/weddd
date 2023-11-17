import { createSlice } from "@reduxjs/toolkit";

// 초기 상태 정의
const initialState = {

};

const consultSlice = createSlice({
  name: "consult",
  initialState,
  reducers: {
    // 로그인 액션

  },
});

// 액션 내보내기
// export const { login, logout, isLogin, updateUser, checkUser } =
//   consultSlice.actions;

// 리듀서 내보내기
export default consultSlice.reducer;
