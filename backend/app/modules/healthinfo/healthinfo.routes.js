/**
 * healthInfoModel Routes
 * --------------------------------------------------------------------------------
 * healthInfoModel에 관련된 라우팅 설정
 */

const router = require('express').Router()
const controller = loadModule('healthinfo', 'controller');
/*  -------------------------------------- */

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
        const uploadDir = path.join(__dirname, '../../files/images/health_info/category');
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

const funcFoodstorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../files/images/health_info/funcfood');
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
        if (req.body.thumb_filepath) {
            req.body.thumb_filepath = `${newFileName}${fileExtension}`;
        }

        cb(null, `${newFileName}${fileExtension}`);
    }
});

const foodStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const food_idx = req.body.food_idx;  // 여기에서 사용
        const uploadDir = path.join(__dirname, '../../files/images/health_info/food');
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
        cb(null, `${newFileName}${fileExtension}`);
    }
});

const recipeStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../files/images/health_info/recipe');
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
        if (req.body.thumb_filepath) {
            req.body.thumb_filepath = `${newFileName}${fileExtension}`;
        }

        cb(null, `${newFileName}${fileExtension}`);
    }
});

const exerciseStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const ex_idx = req.body.ex_idx;  // 여기에서 사용
        const uploadDir = path.join(__dirname, '../../files/images/health_info/exercise');
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
const funcFoodUpload = multer({ storage: funcFoodstorage, fileFilter: fileFilter });
const foodUpload = multer({ storage: foodStorage, fileFilter: fileFilter })
const recipeUpload = multer({ storage: recipeStorage, fileFilter: fileFilter })
const exerciseUpload = multer({ storage: exerciseStorage, fileFilter: fileFilter })


/*  -------------------------------------- */
const db = database()

/*카테고리 등록*/
router.post('/category', upload.single('icon_filepath'), controller.addCategory)
/*부모 ID에 따른 카테고리 목록 불러오기*/
router.get('/category/list/:parent_id', controller.getCatListById)
/*카테고리 ID에 따른 아이템 1개 불러오기*/
router.get('/category/:cat_id', controller.getCategoryItem);
/* 카테고리 이름 검색 */
router.get('/category/search/:keyword', controller.getCatListByKeyword)
/* 카테고리 상세 불러오기 */
router.get('/category/:cat_idx', controller.getCatDetailById)
/* 카테고리 내용 수정 */
router.put('/category', upload.single('icon_filepath'), controller.updateCategoryItem)
//TODO: sort 수정 업데이트 여지 있음.
/* 카테고리 삭제 */
router.post('/category/delete', controller.deleteCategoryItem)

/*  -------------------------------------- */

/* 상세 글 등록 */
router.post('/post', controller.addInfo)
/* 상세 글 불러오기 */
router.get('/post/:cat_idx', controller.getInfoById)
/* 상세 글 수정(내용 + 카테고리) */
router.put('/post', controller.updateInfoItem)

/*  -------------------------------------- */
//TODO: 건강 기능 식품
/* 건강 기능 식품 등록 */
router.post('/funcfood', funcFoodUpload.single('thumb_filepath'), controller.addFuncFood)
/* 건강 기능 식품 목록 불러오기 */
router.get('/funcfood/list/:keyword', controller.getFuncFoodList)
/* 건강 기능 식품 상세 불러오기 */
router.get('/funcfood/:food_idx', controller.getFuncFoodInfoById)
/* 건강 기능 식품 수정 */
router.put('/funcfood', funcFoodUpload.single('thumb_filepath'), controller.updateFuncFoodItem)
/* 건강 기능 식품 삭제 */
router.post('/funcfood/delete', controller.deleteFuncFoodItem)


/*  -------------------------------------- */
//TODO: 건강 식품
/* 건강 식품 파일 추가 라우트 */
router.post('/food/addAttachment', foodUpload.array('files'), controller.addAttachment);
/* 건강 식품 등록 */
router.post('/food', controller.addFood)
/* 건강 식품 목록 불러오기 */
router.get('/food/list/:keyword', controller.getFoodList)
/* 건강 식품 상세 불러오기 */
router.get('/food/:food_idx', controller.getFoodInfoById)
/* 건강 식품 수정 */
router.put('/food', controller.updateFoodItem)
/* 건강 식품 삭제 */
router.post('/food/delete', controller.deleteFoodItem)


/*  -------------------------------------- */
//TODO: 추천 레시피
/* 추천 레시피 등록 */
router.post('/recipe', recipeUpload.single('thumb_filepath'), controller.addRecipe)
/* 추천 레시피 목록 불러오기 */
router.get('/recipe/list/:keyword', controller.getRecipeList)
/* 추천 레시피 상세 불러오기 */
router.get('/recipe/:rec_idx', controller.getRecipeInfoById)
/* 추천 레시피 수정 */
router.put('/recipe', recipeUpload.single('thumb_filepath'), controller.updateRecipeItem)
/* 추천 레시피 삭제 */
router.post('/recipe/delete', controller.deleteRecipeItem)


/*  -------------------------------------- */
//TODO: 추천 운동
/* 추천 운동 파일 추가 라우트 */
router.post('/exercise/addAttachment', exerciseUpload.array('files'), controller.addAttachment);
/* 추천 운동 등록 */
router.post('/exercise', controller.addExercise)
/* 추천 운동 목록 불러오기 */
router.get('/exercise/list/:keyword', controller.getExerciseList)
/* 추천 운동 상세 불러오기 */
router.get('/exercise/:ex_idx', controller.getExerciseInfoById)
/* 추천 운동 수정 */
router.put('/exercise', controller.updateExerciseItem)
/* 추천 운동 삭제 */
router.post('/exercise/delete', controller.deleteExerciseItem)

/*  -------------------------------------- */
// 파일 삭제 라우트
router.post('/deleteAttachment', controller.deleteAttachment);

/**
 * 객체 내보내기
 */
module.exports = router