const router = require('express').Router()
const controller = loadModule('basic', 'controller');

router.post('/post', controller.submitPost); //게시글 쓰기
router.get('/postlist', controller.getPosts); // 게시글 목록을 불러오기
router.get('/post/:idx', controller.getPostById); //게시글 상세 불러오기




/**
 * 객체 내보내기
 */
module.exports = router