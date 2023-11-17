import { createSlice } from "@reduxjs/toolkit";

// 초기 상태 정의
const initialState = {
  productData: {
    prd_idx: 0,
  }
};

const ProductSlice = createSlice({
  name: "product",
  initialState,
  reducers: {

    // 상품 등록
    add: (state, action) => {
      const {idx, } = action.payload;
      state.productData.prd_idx = idx;
    },

  },
});

// 액션 내보내기
export const { add } =  ProductSlice.actions;

// 리듀서 내보내기
export default ProductSlice.reducer;
