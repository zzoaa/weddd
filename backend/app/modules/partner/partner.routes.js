/**
 * Products Routes
 * --------------------------------------------------------------------------------
 * Products에 관련된 라우팅 설정
 */

const router = require('express').Router()
const controller = loadModule('partner', 'controller');

const db = database()

//제휴 문의 등록
router.post('/contact', controller.addContactItem)
//제휴 문의 목록 불러오기
router.get('/contact/list/:keyword', controller.getContactList)
//제휴 문의 상세 불러오기
router.get('/contact/:cont_idx', controller.getContactById)
//제휴 문의 수정
router.put('/contact', controller.updateContactItem)
//제휴 문의 삭제
router.post('/contact/delete', controller.deleteContactItem)


/**
 * 객체 내보내기
 */
module.exports = router
