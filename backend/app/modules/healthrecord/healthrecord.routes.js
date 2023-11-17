/**
 * Products Routes
 * --------------------------------------------------------------------------------
 * Products에 관련된 라우팅 설정
 */

const router = require('express').Router()
const controller = loadModule('healthrecord', 'controller');

const db = database()

//약품정보 웹뷰
router.get('/webview/:type', controller.getWebView)

/*  -------------------------------------- */

//건강검진 기록 등록
router.post('/medicheck', controller.addMediChkItem)
//건강검진 기록 목록 불러오기
router.get('/medicheck/list/:record_type', controller.getMediChkList)
//건강검진 기록 개별 불러오기
router.post('/medicheck/detail', controller.getMediChkById)
//건강검진 메모 수정
router.put('/medicheck',controller.updateMediChkItem)


/**
 * 객체 내보내기
 */
module.exports = router
