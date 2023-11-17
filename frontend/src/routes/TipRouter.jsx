// HealthRouter.jsx
import React from "react";
import {Route, Routes} from "react-router-dom";
import TipList from "../components/tip/TipList.jsx";
import TipEdit from "../components/tip/TipEdit.jsx";


function TipRouter() {
  return (
    <Routes>
      <Route path={'info'} element={<TipList/>}></Route>
      <Route path={'info/:tip_idx'} element={<TipEdit />}></Route>
    </Routes>
  );
}

export default TipRouter;
