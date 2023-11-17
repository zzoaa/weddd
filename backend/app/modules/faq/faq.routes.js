/**
 * Products Routes
 * --------------------------------------------------------------------------------
 * Products에 관련된 라우팅 설정
 */

const router = require('express').Router()
const controller = loadModule('faq', 'controller');

const db = database()

//FAQ 카테고리 등록
router.post('/category/add', controller.addFaqCategory)
//FAQ 카테고리 목록 불러오기
router.get('/category', controller.getFaqCategoryList)
//FAQ 카테고리 상세 보기
router.get('/category/:facIdx', controller.getFacItemById)
//FAQ 카테고리 수정
router.put('/category', controller.updateFaqCategoryItem)
//FAQ 카테고리 삭제
router.post('/category/delete', controller.deleteFaqCategoryItem)

//FAQ 글 등록
router.post('/post', controller.addFaqCategoryItem)
//FAQ 글 목록 불러오기
router.get('/post/list/:facIdx', controller.getFaqListById)
//FAQ 특정 글 불러오기(상세보기)
router.get('/post/:faqIdx', controller.getFaqById)
//FAQ 글 수정
router.put('/post', controller.updateFaqItem)
//FAQ 글 삭제
router.post('/post/delete', controller.deleteFaqItem)


/**
 * 객체 내보내기
 */
module.exports = router
