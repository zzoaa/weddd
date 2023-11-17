const couponModel = loadModule('coupon', 'model')
const couponController = {};
const path = require('path');
const productsModel = require("../products/products.model");
// 모든 쿠폰 조회
couponController.getCouList = async (req, res) => {
  try {
    const {
      // startdate, enddate,
      page, stxt
    } = req.query; // 쿼리에서 페이지, 검색어, 시작 및 종료 날짜를 가져옵니다.
    const cList = await couponModel.getCouList(
      // startdate, enddate, TODO : 날짜 검색조건 필요
      page, stxt);
    const totallist = await couponModel.getCouList(0, null);
    const totalcount = totallist.length;
    if (!cList) {
      return res.status(200).json({message: "쿠폰 내역이 없습니다"});
    }
    return res.json({list: cList, totalcount});
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return res.status(500).json({error: "Failed to fetch coupons"});
  }
};

//하나의 쿠폰에 사용중인 유저 목록 조회
couponController.getCouUseList = async (req, res) => {
  try {
    let cou_id = req.params.cou_id;
    const page = req.query.page || 0; // 페이지 쿼리가 없다면 기본값은 0입니다.
    const pagerow = req.query.pagerow || 10;

    const useList = await couponModel.getCouUseList(cou_id, page, pagerow);
    const totalList = await couponModel.getCouUseList(cou_id, 0, null);
    const totalcount = totalList.length;

    if (!useList) {
      return res.status(500).json({error: "쿠폰 데이터 오류"});
    }
    return res.json({list : useList, totalcount});
  } catch (e) {
    console.error("Error fetching coupons:", e);
    return res.status(501).json({error: e});
  }
}
// 쿠폰 생성하기
couponController.createCoupon = async (req, res) => {
  try {
    // const {mem_idx, cou_disc,cou_name,cou_minprice,cou_maxprice,cou_exptime,cou_status} = req.body;
    let cc = req.body;
    if (!req.body) {
      return res.status(400).json({error: "내용이 없습니다."});
    }
    const create = await couponModel.createC(cc);
    if (!create) {
      return res.status(500).json({error: "쿠폰 생성 데이터 오류"});
    }

    return res.status(200).json(create);
  } catch (error) {
    console.error("Error adding post:", error);
    return res.status(500).json({error: error});
  }
};
//쿠폰 상세보기
couponController.getCouDetail = async (req, res) => {
  let cou_id = req.params.cou_id;
  try {
    const detail = await couponModel.getCouDetail(cou_id);
    if (!detail) {
      return res.status(500).json({error: "쿠폰 데이터 오류"});
    }
    return res.json(detail);
  } catch (error) {
    console.error("Error editing post:", error);
    return res.status(500).json({error: "Failed to get coupon"});
  }
};
//쿠폰 삭제하기
couponController.delCoupon = async (req, res) => {
  try {
    const cou_id = req.body.cou_id;
    const result = await couponModel.delCoupon(cou_id);
    return res.status(200).json({success: true, message: `쿠폰 ${cou_id} 삭제 완료`});
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return res.status(500).json({success: false, message: '쿠폰 삭제 도중 에러 발생'});
  }
};
/** 회원쿠폰*/
couponController.getMemCouList = async (req, res) => {
  try {
    const mem_id = req.params.mem_id;
    const {
      // startdate, enddate,
      page, stxt
    } = req.query; // 쿼리에서 페이지, 검색어, 시작 및 종료 날짜를 가져옵니다.
    const checkedCouStatus = await couponController.chkExpDateTIme(mem_id, stxt);
    if (!checkedCouStatus) {
      return res.status(200).json({message: "쿠폰 상태 점검 중 오류가 발생했습니다."});
    }
    const memCouList = await couponModel.getMemCouList(mem_id, page, stxt);
    // startdate, enddate, TODO : 날짜 검색조건 필요2
    const memCouListLeng = await couponModel.getMemCouList(mem_id, 0, stxt);
    if (!memCouList || !memCouList || memCouListLeng.length === 0) {
      return res.status(200).json({message: "쿠폰 내역이 없습니다"});
    }
    const totalCouCount = memCouListLeng.length;
    return res.json({
      totalCouCount: totalCouCount,
      memCouList: memCouList
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return res.status(500).json({success: false, message: '회원 id로 쿠폰 조회 오류'});
  }
}
//발급하기.
couponController.giveMemCou = async (req, res) => {
  const cdata = req.body;
  try {
    const give = await couponModel.giveMemCou(cdata);
    if (!give) {
      return res.status(200).json({message: "추가할 쿠폰 내역이 없습니다"});
    }
    return res.json(give);
  } catch (e) {
    console.error(e)
    return res.status(500).json({success: false, message: '회원 id로 쿠폰 지급 실패'});
  }
}
//수정하기
couponController.editMemCou = async (req, res) => {
  const cdata = req.body;
  try {
    const edit = await couponModel.editMemCou(cdata);
    if (!edit) {
      return res.status(200).json({message: "수정할 쿠폰 내역이 없습니다"});
    }
    return res.json(edit);
  } catch (e) {
    console.error(e)
    return res.status(500).json({success: false, message: '회원 id로 쿠폰 수정 실패'});
  }
}
//지우기
couponController.removeCou = async (req, res) => {
  const removeDate = req.body;
  const change_status = 'N';
  try {
    const delC = await couponModel.couStatusChange(change_status, removeDate);
    if (!delC) {
      return res.status(200).json({message: "삭제할 쿠폰 내역이 없습니다"});
    }
    return res.json({delNum: delC});
  } catch (e) {
    console.error(e)
    return res.status(500).json({success: false, message: '쿠폰 삭제 실패'});
  }
}
/* 기타 controller ------------------------------------------ */
//쿠폰 유효기간 체크
couponController.chkExpDateTIme = async (mem_idx, stxt) => {
  try {
    const memCouList = await couponModel.getMemCouList(mem_idx, 0, stxt);
    for (let i = 0; i < memCouList.length; i++) {
      const currentDateTime = new Date(); // 현재 시간
      // 2. memCouList[i].exp_datetime을 체크합니다.
      const expirationDateTime = memCouList[i].exp_datetime;
      // 2-1. memCouList[i].exp_datetime 이 현재 시간을 지났다면
      if (expirationDateTime <= currentDateTime) {
        // const del_memo = '기간만료'
        const change_status = 'N'
        const removeData = {
          serial_num: memCouList[i].serial_num,
          mem_idx: mem_idx,
          del_memo: '기간만료',
          cou_status: 'N'
        }
        const checkedStatus = await couponModel.couStatusChange(change_status, removeData);
        if (checkedStatus === null) {
          return '에러';
        }
      } else {
        // 2-2. memCouList[i].exp_datetime 이 현재 시간을 지나지 않았다면 다음 반복문으로 continue 합니다.
        continue;
      }
    }
    // 5. 문제없이 반복문이 종료된다면 '유효기간 체크 완료'를 반환합니다.
    return '유효기간 체크 완료';
  } catch (error) {
    console.error("Error checking coupon expiration:", error);
    return '에러';
  }
}
/** 내보내기 */
module.exports = couponController;
