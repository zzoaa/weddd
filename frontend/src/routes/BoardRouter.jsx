// HealthRouter.jsx
import React from "react";
import {Route, Routes} from "react-router-dom";
import NoticeList from "../components/notice/NoticeList.jsx";
import NoticeEdit from "../components/notice/NoticeEdit.jsx";


function TipRouter() {
  return (
    <Routes>
      <Route path={'notice'} element={<NoticeList/>}></Route>
      <Route path={'notice/:not_idx'} element={<NoticeEdit />}></Route>
    </Routes>
  );
}

export default TipRouter;
