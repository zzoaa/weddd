/**
 * Files Routes
 * --------------------------------------------------------------------------------
 * Files에 관련된 라우팅 설정
 */

const router = require('express').Router()
const controller = loadModule('files', 'controller');

// 특정 파일 정보 가져오기
router.get('/images/:type/:subdir?/:id', controller.getFileByPath);
// id로 파일 삭제하기
router.delete('/del',controller.delFileById);
// target과 type으로 파일 삭제하기
router.delete('/drop',controller.delFilesByTarget)
/**
 * 객체 내보내기
 */
module.exports = router
