const router = require('express').Router()
const controller = loadModule('coupon', 'controller');

router.get('/list', controller.getCouList); // 쿠폰 조회 경로
router.get('/list/:cou_id', controller.getCouUseList); // 쿠폰 조회 경로
router.post('/create', controller.createCoupon); //쿠폰 생성
router.get('/detail/:cou_id',controller.getCouDetail) //쿠폰 상세보기
router.delete('/del', controller.delCoupon)//쿠폰 삭제

/** 회원쿠폰*/
router.get('/mem/:mem_id', controller.getMemCouList); //회원별 쿠폰 리스트
router.post('/give', controller.giveMemCou); //회원에게 쿠폰 발급
router.put('/mem/edit', controller.editMemCou)//회원 보유 쿠폰 수정
router.delete('/remove', controller.removeCou)//회원 보유 쿠폰 삭제

/**
 * 객체 내보내기
 */
module.exports = router
