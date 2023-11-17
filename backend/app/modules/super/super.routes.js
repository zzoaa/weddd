/**
 * super Routes
 * --------------------------------------------------------------------------------
 * 배너에 관련된 라우팅 설정
 */

const router = require('express').Router()
const controller = loadModule('super', 'controller');
const db = database();
/**세팅*/
//사이트 기본 설정
router.get('/setting/basic', controller.getSettingBasic)
router.post('/setting/basic', controller.postSettingBasic)
//std_date로 일자별 통계 보기
router.get('/statics/days', controller.getStatDate)
//사용자 접속 로그
router.get('/statics/visit', controller.getStatVisit)
/*관리자 -> 회원 정보 수정*/
router.put('/mem/Info', controller.updateMemInfo)

/** 회원 권한 */
//회원 권한 목록 받아오기
router.get('/auth/list', controller.getAuthList)
//회원 권한 변경하기
router.put('/auth/mem-auth-change', controller.updateMemAuth)

/**회원 등급 관리*/
router.put('/mem/level', controller.changeMemLevel) //회원의 등급 수동으로 변경
router.get('/level/list', controller.getLevelList) //사이트 등급 리스트 가져오기
router.post('/level', controller.addNewLevel)//새로운 등급 추가
router.put('/level', controller.updateLevelInfo)//기존 등급 이름/기준 수정
router.delete('/level', controller.deleteLevel)//기존 등급 삭제

/* ---------------------------------------------- */

/** 문의 관리*/
router.get('/inquiry/:keyword', controller.getInq)
router.post('/inquiry', controller.replyInq)

/** 주문 관리*/
router.get('/orders',controller.getOrders)
router.get('/orders/:od_id',controller.getOdId)//주문 상세보기
router.put('/orders',controller.putOrders)//주문 정보 수정
router.put('/cart/status', controller.updateCarStatustItem) //장바구니 상태 수정

/**상품 재고 관리*/
router.get('/products/stocks',controller.getStocks)
router.put('/products/stocks',controller.putStocks)

//배송 상태 수정
router.put('/orders/status', controller.putStatus)

/** 상품 리뷰관리 */
router.get('/itemrev',controller.getRevs)
router.put('/itemrev',controller.hideRev)

//상품 리뷰 베스트 처리


/** 상품 문의관리 */
router.get('/itemqa',controller.getQas)
router.post('/itemqa',controller.ansQa)
router.put('/itemqa',controller.editQaAns)

/**
 * 객체 내보내기
 */
module.exports = router
