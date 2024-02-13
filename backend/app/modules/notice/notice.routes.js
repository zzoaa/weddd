const router = require('express').Router()
const controller = loadModule('notice', 'controller');

router.get('/list', controller.getPostList);//공지글 목록 조회
router.get('/post/:not_idx', controller.getPost); //공지글 개별 조회
router.post('/write', controller.submitPost); //공지 추가
router.put('/edit', controller.editPost); //포스트 수정
router.put('/delete', controller.deletePost);//게시글 삭제하기
/**
 * 객체 내보내기
 */
module.exports = router