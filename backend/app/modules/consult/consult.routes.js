const router = require('express').Router()
const controller = loadModule('consult', 'controller');
const uploadConfig = require('../../libraries/upload.library');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 파일명 생성 함수
function makeNewFileName() {
    const newFileName = uuidv4();
    return newFileName;
}

// 파일 업로드를 위한 Multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const cst_id = req.body.cst_id;  // 여기에서 사용
        console.log('cst_id:', cst_id);
        let dir  = path.join(__dirname, '../../files/images/consult');//cst_id살려써야함..
        try {                // 디렉토리가 없는 경우 생성+
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log('Generated path:', dir);  // 생성된 경로를 로깅
            }
        } catch (err) {
            console.error('디렉토리 생성 중 에러 발생:', err);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const newFileName = makeNewFileName();
        const fileExtension = path.extname(file.originalname);
        cb(null, `${newFileName}${fileExtension}`);
    }
});

//내가 원하는 확장자만 올릴 수 있도록 하는 필터
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

/*이미지를 등록할 router*/
router.post('/addAttachment', upload.array('files'), controller.addAttachment)
															//icon 부분은 자신이 어떤 이름으로 body에 file을 담았는지에 따라 바꿔줘야 함
// 파일 삭제 라우트
router.post('/deleteAttachment', controller.deleteAttachment);

router.post('/write', controller.addConst); //문의 추가
router.put('/edit', controller.editConst); //문의글 수정
router.delete('/del', controller.deleteConst);//문의글 삭제하기
router.post('/list', controller.getConsts); // 문의글들을 보여줄 경로
router.post('/details', controller.getConstDetails) //문의글 개별 불러오기
router.post('/manage', controller.manageConst); //1대1 영양상담 보기 TODO:페이징 필요
router.post('/answer', controller.addAnswer); //1대1 영양상담 답변 작성하기
/**
 * 객체 내보내기
 */
module.exports = router