const router = require('express').Router()
const controller = loadModule('notice', 'controller');

// router.get('/list', controller.getNoticeList);
router.put('/edit', controller.editPost); //포스트 수정
router.delete('/del', controller.deletePost);//게시글 삭제하기
router.get('/posts', controller.getPosts); // 게시글들을 보여줄 경로
router.post('/write', controller.submitPost); //공지 추가

/**
 * 객체 내보내기
 */
module.exports = router