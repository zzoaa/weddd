/**
 * categoryModel Routes
 * --------------------------------------------------------------------------------
 * categoryModel에 관련된 라우팅 설정
 */

const router = require('express').Router()
const controller = loadModule('category', 'controller');
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
        const uploadDir = path.join(__dirname, '../../files/images/category');
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

        // req.body에 icon_filepath 필드가 있다면 해당 값을 변경
        if (req.body.icon_filepath) {
            req.body.icon_filepath = `${newFileName}${fileExtension}`;
        }

        cb(null, `${newFileName}${fileExtension}`);
    }
});

const fileFilter = function (req, file, cb) {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
    const fileExtension = path.extname(file.originalname);

    if (allowedExtensions.includes(fileExtension)) {
        cb(null, true); // 허용된 확장자인 경우 true 반환
    } else {
        cb(new Error('허용되지 않는 파일 형식입니다.'), false); // 허용되지 않는 확장자인 경우 false 반환
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

/*  -------------------------------------- */
const db = database()

/*카테고리 등록*/
router.post('/add', upload.single('icon_filepath'), controller.addCat)
/*카테고리 목록 불러오기*/
router.get('/list', controller.getCatList)
//카테고리 뎁스 목록 불러오기
router.get('/list/depth', controller.getCatDepthList);
/* 카테고리 상세 불러오기 */
router.get('/:cat_id', controller.getCatItemsById)
/* 카테고리 내용 수정 */
router.put('/edit', upload.single('icon_filepath'), controller.updateCat)
//TODO: sort 수정 업데이트 여지 있음.
/* 카테고리 삭제 */
router.delete('/del', controller.delCat)



/**
 * 객체 내보내기
 */
module.exports = router