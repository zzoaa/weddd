const router = require('express').Router()
const controller = loadModule('notice', 'controller');

router.get('/write/:key/:id', controller.getPost);//공지 수정 data get
router.put('/posts', controller.editPost); //포스트 수정
router.get('/posts/:id', controller.getPost);
router.delete('/del', controller.deletePost);//게시글 삭제하기
router.get('/:key/posts', controller.getPosts); // 게시글들을 보여줄 경로
router.post('/posts', controller.submitPost)
// router.post('/:key/posts/:id', controller.submitPost)
// router.post('/:key/posts/:id/comments',controller.submitComment)
// router.post('/:key/posts/:id/comments/:commentId',controller.submitComment)
// router.delete('/:key/posts/:id',controller.deletePost)
// router.delete('/:key/posts/:id/comments/:commentId',controller.deleteComment)

/**
 * 객체 내보내기
 */
module.exports = router