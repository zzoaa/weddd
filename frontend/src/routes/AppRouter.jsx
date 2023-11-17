// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "../App.jsx";


import Login from "../components/user/Login.jsx";
import HealthRouter from "./HealthRouter.jsx";
import UserRouter from "./UserRouter.jsx";
import ProductRouter from "./ProductRouter.jsx";
import SettingRouter from "./SettingRouter.jsx";
import SiteRouter from "./SiteRouter.jsx";
import OrderRouter from "./OrderRouter.jsx";
import DashboardChart from "../components/Dashboard/DashboardChart.jsx";
import CouponRouter from "./CouponRouter.jsx";
import TipRouter from "./TipRouter.jsx";

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={<App />}>
          <Route index element={<DashboardChart />} />
          <Route path='site/*' element={<SiteRouter />}></Route>
          <Route path='coupon/*' element={<CouponRouter />}></Route>
          <Route path="health/*" element={<HealthRouter />}></Route>
          <Route path="users/*" element={<UserRouter />}></Route>
          <Route path="product/*" element={<ProductRouter />}></Route>
          <Route path='order/*' element={<OrderRouter />}></Route>
          <Route path="setting/*" element={<SettingRouter />}></Route>
          <Route path="tip/*" element={<TipRouter />}></Route>
        </Route>

        <Route path="/members/*">
          <Route path="login" element={<Login />}></Route>
        </Route>
        <Route path="*" element={<h1>페이지를 찾을수 없습니다.</h1>}></Route>
      </Routes>
    </Router>
  );
}

export default AppRouter;
