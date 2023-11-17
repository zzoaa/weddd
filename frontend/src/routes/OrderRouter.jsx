// ProductRouter.jsx
import React from "react";
import { Route, Routes } from "react-router-dom";
import OderLIst from "../components/Oder/OderLIst.jsx";
import SubscribeList from "../components/Oder/SubscribeList.jsx";
import OderDetail from "../components/Oder/OderDetail.jsx";


function OrderRouter() {
  return (
    <Routes>
      <Route path='orderlist/' element={<OderLIst />} >
      </Route>
      <Route path='orderlist/:orderid' element={<OderDetail />}></Route>
      <Route path='subscribelist' element={<SubscribeList />}></Route>
    </Routes>
  );
}

export default OrderRouter;
