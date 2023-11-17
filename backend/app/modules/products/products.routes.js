/**
 * Products Routes
 * --------------------------------------------------------------------------------
 * Products에 관련된 라우팅 설정
 */
const memCont = loadModule('members', 'controller');

const router = require('express').Router()
const controller = loadModule('products', 'controller');
const uploadConfig = require('../../libraries/upload.library');
const multer = require("multer");
const path = require('path');
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
/** 파일명 생성 함수 */
function makeNewFileName() {
    const newFileName = uuidv4();
    return newFileName;
}
/** 파일 업로드를 위한 Multer 설정*/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let idx;
        let dir;
        if(req.body.prd_idx){
            idx = req.body.prd_idx;
            dir  = path.join(__dirname, '../../files/images/products');//idx..
        } else if (req.body.rev_idx) {
            idx = req.body.rev_idx;
            dir  = path.join(__dirname, '../../files/images/prodreview');//idx..
        } else if (req.body.qa_idx) {
            idx = req.body.qa_idx;
            dir  = path.join(__dirname, '../../files/images/prodqna');//idx..
        }
        
        // console.log('idx:', idx);
        
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
        console.log(file, 'hohoho');
        const newFileName = makeNewFileName();
        const fileExtension = path.extname(file.originalname);
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
const db = database()
router.use((req, res, next) => {
    if (req.params.id) {
        req.body.prd_idx = req.params.id;  // :id 파라미터를 req.body.prd_idx로 설정
    }
    next();
});
// 상품 파일 추가 라우트
router.post('/addAttachment', upload.array('files'), controller.addAttachment);
//상품목록 가져오기
router.get('/list', controller.getProducts)
// 특정 상품 정보 가져오기
router.get('/detail/:id', controller.getProductById)
//상품 수정 put
router.put('/write',  upload.array('files'), controller.updateProduct);
//상품 추가(id부여, Status : T)
router.post('/add', controller.createProduct);
//상품 복사
router.post('/copy', controller.copyProduct)
//상품 삭제
router.put('/del', controller.deleteProduct)
// 파일 삭제 라우트
router.post('/deleteAttachment', controller.deleteAttachment);

/** 상품 옵션 ---------------------------------  */
//옵션 재고관리 컬럼 생성
router.post('/options',controller.makeOption)
//옵션 가져오기
router.get('/options',controller.getOptions)
//옵션 별 금액&재고 수정
router.put('/options',controller.editOptStocks)

/* 상품 리뷰 ----------------- */
//리뷰 (파일) 추가 라우트
router.post('/addReviewFile', upload.array('files'), controller.addAttachment);
//상품 리뷰 작성하기
router.post('/postReview',controller.postReview)
//상품 리뷰 개별 불러오기
router.get('/review/:rev_idx', controller.getReviewDetail)
//상품 리뷰 목록
router.get('/review/list/:prd_idx', controller.getProdReviewList)
//상품 리뷰 수정하기
router.put('/review', controller.updateProdReview)
//상품 리뷰 삭제하기
router.post('/review/delete', controller.deleteReview)

/* 상품 문의 ----------------- */
//문의 (파일) 추가 라우트
router.post('/addQnaFile', upload.array('files'), controller.addAttachment);
//상품 문의 작성하기
router.post('/qa',controller.makeQa)
//상품 문의 목록
router.get('/qna/list/:prd_idx', controller.getProdQnaList)
//상품 문의 개별 불러오기
router.get('/qna/:qa_idx', controller.getQnaDetail)
//상품 문의 수정하기
router.put('/qna', controller.updateProdQna)
//상품 문의 삭제하기
router.post('/qna/delete', controller.deleteQna)

/**진열장 ------------------- */
//진열장 목록 가져오기
// ?page=1 - 반환할 페이지 번호입니다. 기본값은 모든 페이지를 반환합니다.
router.get('/displays',controller.getDisplayList)
router.post('/display/add',controller.createDisplay)
//진열장 수정
router.put('/display/update',controller.updateDisplay)
//진열장 삭제
router.delete('/display/del',controller.deleteDisplay)
//진열장 아이템 추가
router.post('/display/item',controller.addItem)
//진열장 아이템 삭제
router.delete('/display/drop',controller.dropItem)
// 진열장 show
router.get('/display/:id', controller.getDisplay)
//진열장 외부 아이템 보이기
router.get('/display/items/:id', controller.getOutsideDisplay)
//진열장 추가

/** 찜하기 --------------- */
//찜 생성
router.post('/wish',controller.addWish)
//찜 삭제
router.delete('/wish',controller.dropWish)
//찜 목록 가져오기 (mem_idx로 prd_idx들 가져오기)
router.get('/wish/list',controller.getWishList)
//찜 여부 확인
router.get('/wish/check/:prd_idx', controller.getWishCheck)


/**
 * 객체 내보내기
 */
module.exports = router
