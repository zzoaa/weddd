import { useState } from "react";

import { Outlet } from "react-router-dom";
import Drop from "../../features/Drop.jsx";
import { NavLink } from "react-router-dom";

function Dashboard() {
  const [activeMenu, setActiveMenu] = useState(null);

  const siteOptions = {
    title: "사이트 관리",
    active: false,
    menus: [
      { name: "배너관리", link: "site/banner" },
      { name: "FAQ", link: "site/faq"},
      { name: "1대1문의" , link:"site/inquiry"},
      { name: "1대1영양상담 관리" , link:"site/consult"},
      { name: "제휴문의 관리" , link:"site/partner"},
    ],
  };
  const tipOption = {
    title: "건강팁 관리",
    active: false,
    menus: [
      { name: "건강팁 관리", link: "tip/info" },

    ],
  }
  const couponOptions = {
    title : "쿠폰 관리",
    active: false,
    menus: [
      { name: "쿠폰 관리" , link:"coupon/list"},
    ]
  }

  const productsOptions = {
    title: "상품 관리",
    active: false,
    menus: [
      {
        name: "상품 분류 관리",
        link: "product/category",
      },
      {
        name: "상품 관리",
        link: "product/item",
      },
      {
        name: "상품 진열장 관리",
        link: "product/display",
      },
      {
        name: "상품 리뷰 관리",
        link: "product/review",
      },
      {
        name: "상품 문의 관리",
        link: "product/product_qna",
      },


    ],
  };

  const usersOptions = {
    title: "회원 관리",
    active: false,
    menus: [
      {
        name: "회원 목록",
        link: "users/list",
      },
      {
        name: "등급 관리",
        link: "users/rank",
      },
    ],
  };

  const oderOptions = {
    title: "주문 관리",
    active: false,
    menus: [
      {
        name: "주문 관리",
        link: "order/orderlist",
      },
      {
        name: "구독 관리",
        link: "order/subscribelist",
      },

    ],
  };

  const settingOptions = {
    title: "환경 설정",
    active: false,
    menus: [
      {
        name: "사이트 기본 설정",
        link: "setting/site",
      },
      // {
      //   name: "쇼핑몰 환경 설정",
      //   link: "setting/shop",
      // },
      {
        name: "쇼핑몰 배송 설정",
        link: "setting/delivery",
      },
      {
        name: "약관 설정",
        link: "setting/agreement",
      },

    ],
  };
  const healthInfo = {
    title: "건강정보 관리",
    active: false,
    menus: [
      {
        name: "건강정보 목록",
        link: "health/info",
      },
      {
        name: "건강기능식품 관리",
        link: "health/func_food",
      },
      {
        name: "건강식품 관리",
        link: "health/food",
      },
      {
        name: "추천레시피 관리",
        link: "health/recipe",
      },
      {
        name: "추천운동 관리",
        link: "health/exercise",
      },
    ],
  };

  return (
    <section className={"dash-board"}>
      <header className={"header"}>
        <NavLink className={"logo-warp"} to={"/"}>
          <img src="/logo.svg" alt="logo" />
        </NavLink>

        <nav className={"nav"}>
          {/*사이트 관리*/}
          <Drop
            actived={activeMenu}
            activeToggle={setActiveMenu}
            options={siteOptions}
          />
          {/*회원 관리*/}
          <Drop
            actived={activeMenu}
            activeToggle={setActiveMenu}
            options={usersOptions}
          />
          {/*쿠폰 관리*/}
          <Drop
              actived={activeMenu}
              activeToggle={setActiveMenu}
              options={couponOptions}
          />
          {/*상품 관리*/}
          <Drop
            actived={activeMenu}
            activeToggle={setActiveMenu}
            options={productsOptions}
          />
          {/*주문 관리*/}
          <Drop
            actived={activeMenu}
            activeToggle={setActiveMenu}
            options={oderOptions}
          />
          {/*건강정보 관리*/}
          <Drop
            actived={activeMenu}
            activeToggle={setActiveMenu}
            options={healthInfo}
          />
          {/*건강팁 관리*/}
          <Drop
            actived={activeMenu}
            activeToggle={setActiveMenu}
            options={tipOption}
          />
          {/*환경 설정*/}
          <Drop
            actived={activeMenu}
            activeToggle={setActiveMenu}
            options={settingOptions}
          />
        </nav>
      </header>
      <div className={"container"}>
        <Outlet></Outlet>
      </div>
    </section>
  );
}

export default Dashboard;
