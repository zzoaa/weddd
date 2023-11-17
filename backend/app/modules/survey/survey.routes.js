/**
 * Products Routes
 * --------------------------------------------------------------------------------
 * Products에 관련된 라우팅 설정
 */

const router = require('express').Router()
const controller = loadModule('survey', 'controller');

const db = database()

//설문조사 질문 등록
router.post('/', controller.addQuestItem)
//설문조사 목록(전체) 불러오기
router.get('/', controller.getSurveyList)

// //설문조사 수정
// router.put('/', controller.updateSurveyItem)
// //설문조사 삭제
// router.post('/delete', controller.deleteSurveyItem)


/* 설문조사 결과 ----------------------*/

//설문조사 결과 등록
router.post('/result', controller.addSurveyResult)
//설문조사 결과 목록 불러오기
router.get('/result/list/:mem_idx', controller.getResultListById)
//설문조사 결과 상세 불러오기
router.get('/result/:result_idx', controller.getResultDetailById)

/**
 * 객체 내보내기
 */
module.exports = router
