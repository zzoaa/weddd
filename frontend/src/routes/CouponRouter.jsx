// HealthRouter.jsx
import React from "react";
import {Route, Routes} from "react-router-dom";
import CouponList from "../components/coupon/CouponList.jsx";
import CouponEdit from "../components/coupon/CouponEdit.jsx";

function CouponRouter() {
  return (
    <Routes>
      <Route path={'list'} element={<CouponList/>}></Route>
      <Route path={'list/:cou_id'} element={<CouponEdit/>}></Route>
    </Routes>
  );
}

export default CouponRouter;
