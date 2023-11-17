/**
 * banner Routes
 * --------------------------------------------------------------------------------
 * 배너에 관련된 라우팅 설정
 */

const router = require('express').Router()
const controller = loadModule('banner', 'controller');
const db = database();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// 파일명 생성 함수
function makeNewFileName() {
    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    const twoDigit = (number) => (number < 10 ? `0${number}` : `${number}`);
    const newFileName = `${year}${twoDigit(monthIndex)}${twoDigit(day)}${twoDigit(hours)}${twoDigit(minutes)}${twoDigit(seconds)}${twoDigit(milliseconds).slice(0, 2)}`;

    return newFileName;
}
// 파일 업로드를 위한 Multer 설정
const storage = multer.diskStorage({
    //TODO: 확장자 명에 따라 특정 확장자 파일만 받을 수 있도록 개선 필요(jpg, jpeg, png, webp, svg)
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../files/images/banner');
        try {
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
        } catch (err) {
            console.error('디렉토리 생성 중 에러 발생:', err);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const newFileName = makeNewFileName();
        const fileExtension = path.extname(file.originalname);
        // req.body에 banner_filepath 필드가 있다면 해당 값을 변경
        if (req.body.banner_filepath) {
            req.body.banner_filepath = `${newFileName}${fileExtension}`;
        }

        cb(null, `${newFileName}${fileExtension}`);
    }
});
const upload = multer({ storage: storage });

//배너 그룹 key 중복 체크
router.post('/groups/check-dup', controller.checkDuplicateGroup)
//배너 그룹 추가
router.post('/groups', controller.addBannerGroups)
//배너 그룹 목록 보기
router.get('/groups', controller.getBannerGroups)
//배너 그룹 상세 보기
router.get('/groups/:bng_idx', controller.getBannerGroupsDetail)
//배너 그룹 수정
router.put('/groups', controller.updateBannerGroups)
//배너 그룹 추가
router.post('/groups/delete', controller.deleteBannerGroups)

/* ---------------------------------*/
//bng_idx로 배너 목록 보기
router.get('/:bng_id/list', controller.getBanners)
//배너 등록하기
router.post('/add',upload.single('ban_filepath'),controller.addBanner)
//배너 수정하기
router.put('/edit',upload.single('ban_filepath'),controller.editBanner)
//배너 삭제하기
router.delete('/del',controller.delBanner)
/**
 * 객체 내보내기
 */
module.exports = router