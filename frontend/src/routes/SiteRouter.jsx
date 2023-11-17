// ProductRouter.jsx
import React from "react";
import {Route, Routes} from "react-router-dom";
import Banner from "../components/site/Banner.jsx";
import FaqList from "../components/site/faq/FaqList.jsx";
import Inquiry from "../components/site/inquiry/Inquiry.jsx";
import ConsultList from "../components/site/consult/ConsultList.jsx";
import ConsultResult from "../components/site/consult/ConsultResult.jsx";
import PartnerList from "../components/site/partner/PartnerList.jsx";

function SiteRouter() {
  return (
    <Routes>
      <Route path='banner' element={<Banner/>}/>
      <Route path='faq' element={<FaqList/>}></Route>
      <Route path='inquiry' element={<Inquiry/>}/>
      <Route path='consult' element={<ConsultList/>}></Route>
      <Route path='consult/:cst_id' element={<ConsultResult/>}></Route>
      <Route path={'partner'} element={<PartnerList />}></Route>
    </Routes>

  );
}

export default SiteRouter;


