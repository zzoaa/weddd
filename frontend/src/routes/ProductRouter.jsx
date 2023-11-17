// ProductRouter.jsx
import React from "react";
import { Route, Routes } from "react-router-dom";
import ProductItem from "../components/Product/ProductItem.jsx";
import ProductItemWrite from "../components/Product/ProductItemWrite.jsx";
import DisplayList from "../components/Product/display/DisplayList.jsx";
import Review from "../components/Product/review/Review.jsx";
import ProductQna from "../components/Product/qna/ProductQna.jsx";
import Category from "../components/Product/category/Category.jsx";
import ProductQnaEdit from "../components/Product/qna/ProductQnaEdit.jsx";

function ProductRouter() {
  return (
    <Routes>
      <Route path='category' element={<Category />}></Route>
      <Route path="item" element={<ProductItem />} />
      <Route path="item_write/:prd_id" element={<ProductItemWrite />} />
      <Route path="display" element={<DisplayList />}></Route>
      <Route path='review' element={<Review />}></Route>
      <Route path='product_qna' element={<ProductQna />}></Route>
      <Route path='product_qna/:qa_idx' element={<ProductQnaEdit />}></Route>
    </Routes>
  );
}

export default ProductRouter;
