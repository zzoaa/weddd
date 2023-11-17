// HealthRouter.jsx
import React from "react";
import { Route, Routes } from "react-router-dom";
import SiteSetting from "../components/Setting/siteSetting.jsx";
import SiteAgreement from "../components/Setting/siteAgreement.jsx";
import SiteDelivery from "../components/Setting/siteDelivery.jsx";
import SiteShopSetting from "../components/Setting/siteShopSetting.jsx";


function SettingRouter() {
  return (
    <Routes>
      <Route path="site" element={<SiteSetting />} />
      <Route path="agreement" element={<SiteAgreement />} />
      <Route path='delivery' element={<SiteDelivery />} />
      <Route path='shop' element={<SiteShopSetting />} ></Route>
    </Routes>
  );
}

export default SettingRouter;
