const router = require('express').Router()
const controller = loadModule('basic', 'controller');

router.post('/post', controller.submitPost); //게시글 쓰기
router.get('/postlist', controller.getPosts); // 게시글 목록을 불러오기
router.get('/post/:idx', controller.getPostById); //게시글 상세 불러오기
router.put('/post', controller.updatePost) //게시글 수정하기
router.put('/postdelete', controller.deletePost) //게시글 삭제하기

/**
 삭제하기에 DELETE 메소드가 아니라 PUT 사용하는 이유
 1. 우리 회사의 delete는 진짜 게시글을 delete 하는 코드를 만들지 않음.
    - 실제로는 status 상태를 N으로 수정해 DB에서 추출해올 수 없는 상태로 만드는 것.

 2. 우리 회사와 다른 Backend 환경에서는 delete라는 메소드를 사용하는 것만으로도
    DB Table의 데이터가 drop(진짜 삭제)되는 경우가 있음.
    이런 경우가 있음을 고려해, 실제 동작인 수정(PUT)으로 작성
 */




/**
 * 객체 내보내기
 */
module.exports = router