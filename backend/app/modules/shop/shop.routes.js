/**
 * Products Routes
 * --------------------------------------------------------------------------------
 * Products에 관련된 라우팅 설정
 */

const router = require('express').Router()
const controller = loadModule('shop', 'controller');

const db = database()

//장바구니 등록
router.post('/cart/add', controller.addCartItem)
//장바구니 목록 불러오기
router.get('/cart/list', controller.getCartList)
//장바구니 수정
router.put('/cart', controller.updateCartItem)
//장바구니 삭제
router.post('/cart/delete', controller.deleteCartItem)

//장바구니 -> 구매하기로 상품 보낼 때
router.put('/cart/addorderid', controller.addOrderId)

//바로구매
router.post('/cart/directBuy', controller.directBuy)


//구매할 목록 불러오기(주문서)
router.post('/order/list', controller.getOrderList)
//결제 성공한 상품 등록
router.post('/order/payedSuccess', controller.addOrderItem)
//결제 성공한 주문 list 불러오기
router.post('/order/payedOrder', controller.getPayedOrder)
//결제 성공한 주문 상세 불러오기
router.post('/order/payedDetail', controller.getPayedOrderDetail)

//가상계좌 입금 완료 처리
router.post('/order/chkVbankPaid', controller.chkVbankPaid)

//결제 취소 & 환불 요청(일반 결제)
router.post('/cancelOrderItem', controller.cancelOrderItem)



/* -------------------------------- 구독 */
//구독 중인 회원들만 볼 수 있는 list 불러오기
router.get('/sub/list/:keyword', controller.getSubscribeList)

//구독 내역 개별 불러오기
router.post('/sub/detail', controller.getSubscribeDetail)

//구독 해지
router.post('/sub/unschedule', controller.subReservCancel)
/* ------------------------- 포트원 요청 */

//포트원 단건 영수증 조회
router.get('/getPaymentInfo/:impUid', controller.getPortOneOrderDetail)

// //포트원 상품 결제 취소하기(일반환불&부분환불)
// router.post('/refundPayment', controller.refundPayment)

// //결제 예약
// router.post('/subscribe/payments/schedule', controller.subReservation)

// //결제 예약 취소
// router.post('/subscribe/payments/unschedule', controller.subReservCancel)


/**
 * 객체 내보내기
 */
module.exports = router
