/**
 * supers Controller
 * --------------------------------------------------------------------------------
 * 사용자 컨트롤러
 *
 * getStatics   접속
 * postStatics  사용자 접속시 통계데이타를 입력처리
 *
 * @namespace super
 * @author 장선근
 * @version 1.0.0.
 */

const superController = {};
const superModel = loadModule('super', 'model')
const shopModel = loadModule('shop', 'model')
const membersModel = loadModule('members', 'model')
const couponModel = loadModule('coupon', 'model')
const productModel = loadModule('products', 'model')
const path = require('path');
const uploadLibrary = require('../../libraries/upload.library.js');
const fs = require("fs");
/**
 * Global Middleware
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const db = database();
//사이트 기본설정 GET
superController.getSettingBasic = async (req, res) => {
  try {
    const superSettings = await superModel.getSettingBasic();
    console.log(superSettings);
    if (!superSettings) {
      return res.status(200).json({message: "사이트 설정 데이터가 없습니다"});
    }
    return res.json(superSettings);
  } catch (e) {
    console.error(e)
    return res.status(500).json({error: "Failed to get setting data"});
  }
}
//사이트 기본설정 POST
superController.postSettingBasic = async (req, res) => {
  const configData = req.body;
  try {
    const superSettings = await superModel.postSettingBasic(configData);
    console.log(superSettings);
    if (!superSettings) {
      return res.status(200).json({message: "사이트 설정 데이터가 없습니다"});
    }
    return res.json(superSettings);
  } catch (e) {
    console.error(e)
    return res.status(500).json({error: "Failed to get setting data"});
  }
}
//일자별 통계량 GET
superController.getStatDate = async (req, res) => {
  try {
    const {startdate, enddate} = req.query; // 쿼리에서 시작 및 종료 날짜를 가져옵니다.
    let startD, endD;
    if (startdate && enddate) {
      startD = new Date(startdate)
      endD = new Date(enddate)
    }
    // console.log(endD)
    // 모델 함수 호출과 함께 시작 및 종료 날짜를 전달합니다.
    const result = await superModel.getStatDate(startD, endD);

    function summarizeVisits(visits) {
      // 날짜별로 데이터를 그룹화합니다.
      const groups = visits.reduce((acc, visit) => {
        // UTC 시간으로 파싱합니다.
        const utcDate = new Date(visit.sta_regtime);
        // 9시간(32400초)을 더하여 KST로 변환합니다.
        const kstDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000));
        // 날짜만 추출합니다 (시간 정보는 제거).
        const date = kstDate.toISOString().split('T')[0];
        // 해당 날짜의 그룹이 없으면 초기화합니다.
        if (!acc[date]) {
          acc[date] = {std_date: date, std_count: 0, std_mobile: 0};
        }
        // 총 방문자 수를 증가시킵니다.
        acc[date].std_count += 1;
        // 모바일 사용자라면 모바일 방문자 수도 증가시킵니다.
        if (visit.sta_is_mobile === 'Y') {
          acc[date].std_mobile += 1;
        }
        return acc;
      }, {});
      // 결과를 배열로 변환합니다.
      return Object.values(groups);
    }

    const summarizedData = summarizeVisits(result);
    // console.log(summarizedData);
    // console.log(result);
    // 결과 반환
    return res.json(summarizedData);
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: "Failed to fetch date statistics"});
  }
}
//사용자 접속 로그 보기
superController.getStatVisit = async (req, res) => {
  try {
    const {startdate, enddate} = req.query; // 쿼리에서 시작 및 종료 날짜를 가져옵니다.
    const result = await superModel.getStatVisit(startdate, enddate);
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: "Failed to fetch visit statics"});
  }
}
/** 문의*/
superController.getInq = async (req, res) => {
  try {
    const keyword = req.params.keyword ? req.params.keyword : null;
    if (!keyword || keyword == null) {
      return res.status(401).json({error: "keyword 값을 보내주세요."});
    }
    // const query = req.query
    //const { startdate, enddate } = req.query; // 쿼리에서 시작 및 종료 날짜를 가져옵니다.
    const result = await superModel.getInq(keyword);
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: "Failed to fetch inquires"});
  }
}
superController.replyInq = async (req, res) => {
  let repData = req.body
  try {
    const result = await superModel.replyInq(repData)
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: "Failed to fetch reply"});
  }
}
/** 주문*/
//주문 관리
superController.getOrders = async (req, res) => {
  try {
    const {startdate, enddate} = req.query; // 쿼리에서 시작 및 종료 날짜를 가져옵니다.
    const result = await superModel.getOrders(startdate, enddate);
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: "Failed to fetch orders"});
  }
}
//주문 상세보기
superController.getOdId = async (req, res) => {
  const oid = req.params.od_id
  try {
    const result = await superModel.getOdInfo(oid);
    if (result == null) {
      return res.status(500).json({error: "주문 정보를 찾을 수 없습니다."});
    }
    return res.status(200).json(result[0])
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: "Failed to fetch order"});
  }
}
//장바구니 상태 수정
superController.updateCarStatustItem = async (req, res) => {
  let updatedcartItem = null;
  try {
    await db.transaction(async trx => {
      const updatedItemData = req.body.modifyList;
      console.log('updatedItemData :');
      console.log(updatedItemData);
      updatedcartItem = await shopModel.updateCartStatus(updatedItemData);
      if (!updatedcartItem) {
        return res.status(404).json({error: "shop not found"});
      }
      console.log('updatedcartItem :');
      console.log(updatedcartItem);
    });  // 트랜잭션 종료
    return res.status(200).json({success_cart_ids: updatedcartItem});
  } catch (error) {
    console.error("Error updating shop:", error);
    return res.status(500).json({error: "Failed to update shop"});
  }
}
/**상품 재고 관리*/
superController.getStocks = async (req, res) => {
  try {
    const {cat_id, prd_sell_status, prd_status, stxt} = req.query; // 쿼리에서 시작 및 종료 날짜를 가져옵니다.
    const result = await superModel.getStocks(cat_id, prd_sell_status, prd_status, stxt);
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: "Failed to fetch stocks"});
  }
}
//재고량 수정
superController.putStocks = async (req, res) => {
  try {
    const stocks = req.body;
    if (!stocks) {
      return res.status(500).json({error: "변경할 재고 데이터가 없습니다."});
    }
    const stData = await superModel.putStocks(stocks);
    return res.status(200).json(stData);
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: "Failed to edit stocks"});
  }
}

//TODO: 트랜잭션 처리 필요
//주문 수정
superController.putOrders = async (req, res) => {
  try {
    const check_cost_minimum = 10000 //회원 등급 카운트 확인할 때 사용할 주문 금액 최저 기준(현재: 1만원)
    const check_order_status = '배송완료'
    const orders = req.body;
    if (!orders) {
      return res.status(500).json({error: "변경할 주문 데이터가 없습니다."});
    }
    //* 동일한 order id를 가진 order정보 가져오기
    const beforeOrderDetail = await superModel.getOdInfo(orders.od_id)
    if (!beforeOrderDetail) {
      return res.status(500).json({error: "변경할 주문 정보를 찾을 수 없습니다."});
    }
    const cartList = await shopModel.getCartListByOdId(orders.mem_idx, orders.od_id);
    //* 주문과 동일 건의 cart 내역 status 변경
    if (orders.od_status && beforeOrderDetail.od_status != orders.od_status) {
      //* cart_status도 변경하기
      if (!cartList) {
        return res.status(500).json({error: "cart에서 주문을 찾을 수 없습니다."});
      }
      const modifyCartStatusList = [];
      for (let i = 0; i < cartList.length; i++) {
        const cartStatusItem = {};
        cartStatusItem.cart_id = cartList[i].cart_id;
        cartStatusItem.cart_status = orders.od_status;
        modifyCartStatusList.push(cartStatusItem);
      }

      const changedCartStatus = await shopModel.updateCartStatus(modifyCartStatusList);
      if (!changedCartStatus) {
        return res.status(500).json({error: "cart_status 변경에 실패하였습니다."});
      }
    }
    //* 주문 수정
    const odData = await superModel.putOrders(orders);
    const odDataDetail = odData[0]
    console.log('od_delivery_num:' + odDataDetail.od_delivery_num);
    console.log('od_cart_price:' + odDataDetail.od_cart_price);
    let changeMemLevel
    //* 주문 상태 수정 후, 회원 등급 확인 및 변경
    if (odDataDetail.od_delivery_num && odDataDetail.od_cart_price >= check_cost_minimum) {
      changeMemLevel = await superController.changeLevelAuto(odDataDetail, check_cost_minimum, check_order_status);
      console.log('레벨 변경됐니?: ' + changeMemLevel); //만약 레벨이 변경되었다면 true 아니라면 false
    }
    //*레벨 변경 시, 쿠폰 부여
    if (changeMemLevel) {
      const memberInfo = await membersModel.getMemberById(orders.mem_idx);
      const memberLevel = memberInfo.lev_idx;
      let couIdx;
      if (memberLevel === 2) {
        couIdx = 2;
      } else if (memberLevel === 3) {
        couIdx = 3;
      } else if (memberLevel === 4) {
        couIdx = 4;
      }
      const cdata = {
        cou_id: couIdx,
        mem_idx: orders.mem_idx
      };
      const giveNewCoupon = await couponModel.giveMemCou(cdata)
      console.log('새로 발급된 쿠폰 idx: ' + giveNewCoupon);
    }
    return res.status(200).json(odDataDetail);
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: "Failed to fetch orders"});
  }
}
//배송관리
superController.putStatus = async (req, res) => {
  try {
    const orders = req.body;
    if (!orders) {
      return res.status(500).json({error: "변경할 배송 데이터가 없습니다."});
    }
    const odData = await superModel.putStatus(orders);
    return res.status(200).json(odData);
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: "Failed to fetch status"});
  }
}
/* 회원 등급 관리 ---------------------------*/
//회원의 등급을 변경하는 함수 컨트롤러
superController.changeLevelAuto = async (odDataDetail, check_cost_minimum, check_order_status) => {
  try {
    console.log('회원 등급 변경 시작')
    //회원 id, check_cost_minimum, check_order_status 조건을 모두 만족하는 list를 받아온다.
    const countingList = await superModel.getListForLevelCount(odDataDetail.mem_idx, check_cost_minimum, check_order_status)
    const countingLength = countingList.length;
    console.log('countingLength:' + countingLength);
    //사이트 등급 목록을 모두 받아온다.
    const levelInfoList = await superModel.getMemberLevelInfo();
    const memberInfo = await membersModel.getMemberById(odDataDetail.mem_idx);
    let changeLevelChk = false;
    for (let i = 0; i < levelInfoList.length; i++) {
      if (levelInfoList[i].lev_idx < memberInfo.lev_idx) continue; //만약 변경할 레벨보다 현재 멤버 레벨이 높으면 continue;
      if (levelInfoList[i].lev_check <= countingLength) { //만약 멤버의 구매 횟수가 lev_check 갯수를 넘어섰다면 회원 등급 변경으로
        if (levelInfoList[i].lev_idx === memberInfo.lev_idx) continue; //하지만 변경할 레벨과 현재 멤버 레벨이 같다면 continue;
        const db = database();
        await db
          .from('wb_member')
          .where('mem_idx', odDataDetail.mem_idx)
          .update({
            lev_idx: levelInfoList[i].lev_idx
          })
          .catch((e) => {
            console.log(e);
            return null;
          });
        console.log(`회원 레벨 변경 완료 : ${levelInfoList[i].lev_name}`);
        changeLevelChk = true;
        break;
      }
    }
    return changeLevelChk
  } catch (e) {
    console.error(e);
  }
}
/**
 *
 * @returns {Promise<*>}
 */
superController.getLevelList = async (req, res) => {
  console.log('hohohoh111')
  try {

    const levList = await superModel.getLevelList();

    if(!levList) {
      return res.status(500).json({error: "Failed to Get level"});
    }


    return res.status(200).json(levList)
  } catch (e) {
    console.error("Error updating level:", e);
    return res.status(500).json({error: "Failed to Get level"});
  }
}
//회원의 등급 수동으로 변경
superController.changeMemLevel = async (req, res) => {
  try {
    const changeLevelItem = req.body;
    if (changeLevelItem == null || !changeLevelItem) {
      return res.status(401).json({error: "변경할 정보를 찾을 수 없습니다."});
    }
    //만약 changeLevelItem.lev_idx 의 값이 mem_level에 없는 값이라면 error 처리해야 함
    const levelExists = await superModel.checkLevelExist(changeLevelItem.lev_idx)
    if (levelExists == null || !levelExists) {
      return res.status(401).json({error: "존재하지 않는 레벨입니다."});
    }
    const changedMemInfo = await superModel.changeMemLevel(changeLevelItem);
    console.log('changedMemInfo: ');
    console.log(changedMemInfo);
    if (!changedMemInfo || changedMemInfo == null) {
      return res.status(401).json({error: "변경 된 회원 정보를 찾을 수 없습니다."});
    }
    return res.status(200).json(changedMemInfo);
  } catch (error) {
    console.error("Error updating level:", error);
    return res.status(500).json({error: "Failed to update level"});
  }
}
//새로운 등급 추가
superController.addNewLevel = async (req, res) => {
  try {
    const addlevelData = req.body;
    if (addlevelData == null) {
      return res.status(500).json({error: "등록할 레벨 데이터가 없습니다."})
    }
    const newLevelId = await superModel.addNewLevel(addlevelData);
    console.log(newLevelId)
    if (newLevelId == null) {
      return res.status(500).json({error: "레벨 데이터 등록에 실패했습니다."})
    }
    // 생성 성공 메세지 반환
    return res.status(200).json({message: `${newLevelId} 번째 정보 생성 성공`});
  } catch (error) {
    console.error("Error adding level:", error);
    return res.status(500).json({error: "Failed to add level"});
  }
}
//기존 등급 이름/기준 수정
superController.updateLevelInfo = async (req, res) => {
  try {
    const updateLevelItem = req.body;
    if (updateLevelItem == null || !updateLevelItem) {
      return res.status(401).json({error: "변경할 정보를 찾을 수 없습니다."});
    }
    //만약 changeLevelItem.lev_idx 의 값이 mem_level에 없는 값이라면 error 처리해야 함
    const levelExists = await superModel.checkLevelExist(updateLevelItem.lev_idx)
    if (levelExists == null || !levelExists) {
      return res.status(401).json({error: "존재하지 않는 레벨입니다."});
    }
    const changedLevelId = await superModel.updateLevelInfo(updateLevelItem);
    console.log(`${changedLevelId.lev_idx}게시글 수정 성공`)
    if (!changedLevelId || changedLevelId == null) {
      return res.status(401).json({error: "변경 된 레벨 정보를 찾을 수 없습니다."});
    }
    return res.status(200).json(changedLevelId);
  } catch (error) {
    console.error("Error updating level:", error);
    return res.status(500).json({error: "Failed to update level"});
  }
}
superController.deleteLevel = async (req, res) => {
  try {
    const lev_idx = req.body.lev_idx;
    console.log(lev_idx)
    if(!lev_idx) {
      res.status(501).json({'error': 'lev_idx를 입력해주세요.'});
      return;
    }
    const check = await superModel.delCheck(lev_idx);

    if(!!check) {
      res.status(501).json({'error': '기존 등급을 사용중에 있습니다. 사용중이지 않는 등급을 삭제해주세요.'});
      return;
    }
    const result = await superModel.delLevel(lev_idx)

    if(!result) {
      res.status(501).json({'error': '삭제 실패'});
      return;
    }

    res.status(200).json(result);
  }catch (e) {
    console.error("Error updating level:", e);
    return res.status(500).json({error: e});
  }
}

/*관리자 -> 회원 정보 수정*/
superController.updateMemInfo = async (req, res) => {
  try {
    const updateData = req.body
    if (!updateData) {
      return res.status(401).json({error: "변경할 정보를 찾을 수 없습니다."});
    }
    const memExists = await membersModel.getMemberById(updateData.mem_idx)
    if (!memExists) {
      return res.status(500).json({error: "회원 정보를 찾을 수 없습니다."});
    }
    const updatedInfo = await superModel.updateMemberInfo(updateData);
    if (!updatedInfo) {
      return res.status(500).json({error: "회원 정보 업데이트에 실패하였습니다."});
    }
    return res.status(200).json(updatedInfo);
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: "Failed to update memInfo"});
  }
}

/** 회원 권한 */
//회원 권한 목록 받아오기
superController.getAuthList = async (req, res) => {
  try {
    const result = await superModel.getAuthListModel();
    return res.status(200).json({list: result});
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: `목록 불러오기 실패 : ${e}`});
  }
}

superController.updateMemAuth = async (req, res) => {
  try{
    /*
    1. 권한을 부여할 회원 번호를 받는다.
    2. 부여할 권한이 7인지 10인지 체크한다.
    3. 실제 존재하는 회원인지 확인 && 실제 존재하는 권한인지 확인
    4. 권한 변경
    */ 

    const mem_idx = req.body.mem_idx;
    const change_auth = req.body.mem_auth;
    
    if(!mem_idx && !change_auth){
      return res.status(401).json({error: `권한 변경에 필요한 정보를 모두 보내주세요.`});
    }

    const chkExistMem = await membersModel.getMemberById(mem_idx)
    const chkExistAuth = await superModel.getAuthById(change_auth)

    if(!chkExistMem || !chkExistAuth) {
      return res.status(500).json({error: `권한변경 실패`});
    }

    const changedAuth = await superModel.updateMemAuth(mem_idx, change_auth);

    if(!changedAuth || changedAuth === null){

    }

    return res.status(200).json(changedAuth)
  } catch(error) {
    console.error(error);
    return res.status(500).json({error: `권한변경 실패: ${error}`});
  }
}

/* 상품 리뷰관리 ---------------------------*/
superController.updateReview = async (req, res) => {
  try {
    const updateReviewItem = req.body;
    //실제로 있는 글인지 검증
    const checkInfoExist = await productModel.getReviewDetail(updateReviewItem.rev_idx);
    if (checkInfoExist == null) {
      return res.status(500).json({error: "업데이트할 리뷰가 존재하지 않습니다."});
    }
    //데이터 업데이트
    const updatedReviewItem = await superModel.updateProdReview(updateReviewItem);
    console.log('updatedReviewItem :')
    console.log(updatedReviewItem)
    if (!updatedReviewItem) {
      return res.status(404).json({error: "review item not found"});
    }
    console.log(`${updatedReviewItem.rev_idx}게시글 수정 성공`)
    return res.status(200).json(updatedReviewItem)
  } catch (error) {
    console.error("Error updating review best:", error);
    return res.status(500).json({error: "Failed to update review best"});
  }
}
/* 상품 문의관리 ---------------------------*/
//상품 문의 관리
superController.getQas = async (req, res) => {
  try {
    const query = req.query;
    const result = await superModel.getQas(query)
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: "Failed to fetch qas"});
  }
}
//상품 문의 답변
superController.ansQa = async (req, res) => {
  try {
    let qaAns = req.body;
    const result = await superModel.ansQa(qaAns)
    return res.status(200).json({success: `문의 답변 성공`});
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: e.message});
  }
}
//문의 답변 수정하기
superController.editQaAns = async (req, res) => {
  try {
    let qaAns = req.body;
    if (qaAns.qa_is_answer == "N") {
      return res.status(500).json({error: "수정할 답변이 없습니다."});
    }
    const result = await superModel.editQaAns(qaAns)
    return res.status(200).json({success: `문의 답변 수정 성공`});
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: "Failed to fetch qa answer"});
  }
}
//상품 리뷰 관리
superController.getRevs = async (req, res) => {
  try {
    const query = req.query;
    const result = await superModel.getRevs(query)
    return res.json(result);
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: "Failed to fetch reviews"});
  }
}
//상품 리뷰 상태 변경 처리
superController.hideRev = async (req, res) => {
  try {
    let rv = req.body.rev_idx;
    let rev_status = req.body.rev_status;
    const rev_best = req.body.rev_best;
    if (!rv && !rev_status && !rev_best) {
      return res.status(501).json({error: "Failed to fetch review"});
    }
    const result = await superModel.hideRev(rv, rev_status, rev_best)
    if (!result) {
      return res.status(501).json({error: "Failed to fetch review"});
    }
    return res.status(200).json({hide: `${rv}번 리뷰 상태변경 처리`});
  } catch (e) {
    console.error(e);
    return res.status(500).json({error: "Failed to fetch review"});
  }
}

module.exports = superController;