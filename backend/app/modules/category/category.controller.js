/**
 * category Controller
 * --------------------------------------------------------------------------------
 * 사용자 컨트롤러
 *
 * getStatics   접속
 * postStatics  사용자 접속시 통계데이타를 입력처리
 *
 * @namespace category
 * @author 장선근
 * @version 1.0.0.
 */

const productController = require('../products/products.controller');
const productModel = loadModule('products', 'model');
const membersModel = loadModule('members', 'model')

const categoryController = {};
const categoryModel = loadModule('category', 'model')
const db = database()

/**
 * Global Middleware
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */

/*카테고리 등록*/
categoryController.addCat = async (req, res) => {
    try {
        const addCatData = req.body;
        console.log(addCatData,111)
        if (addCatData == null) {
            return res.status(500).json({ error: '등록할 카테고리 데이터가 없습니다.' });
        }
        console.log(req.file,222)
        // 파일 업로드 경로 생성
        const iconFilePath = req.file ? `/files/images/category/${req.file.filename}` : '';
        console.log(iconFilePath,333)
        // 카테고리 데이터에 파일 경로 추가
        addCatData.icon_filepath = iconFilePath;

        // 카테고리 등록
        const newCategoryId = await categoryModel.addCat(addCatData);

        console.log(newCategoryId);

        // 생성 성공 메세지 반환
        return res.status(200).json({ message: `${newCategoryId} 카테고리가 생성되었습니다.` });
    } catch (error) {
        console.error('Error add category:', error);
        return res.status(500).json({ error: 'Failed to add category' });
    }
};

/* 카테고리 내 상품 불러오기 */
categoryController.getCatItemsById = async(req, res) => {
    try {        // 상위 id 값을 가진 카테고리 목록을 조회
        const cat_id = req.params?.cat_id ?? null;
        const page = req.query.page || 0; // 페이지 쿼리가 없다면 기본값은 0입니다.
        const mem_idx = req.loginUser? req.loginUser.id : 0;

        if(!cat_id){
            return res.status(403).json({ error: "조회할 카테고리의 번호를 보내주세요." });
        }

        //카테고리에 등록된 상품 목록 조회
        const catData = await categoryModel.getCatItemsById(cat_id, page);

        if (!catData || catData === null) {
            return res.status(403).json({ error: "product list에 관한 정보를 찾을 수 없습니다." });
        }

        if(mem_idx > 0){
        //멤버 정보
            const memInfo = await membersModel.getMemberById(mem_idx);

            if (!catData || !memInfo || catData === null || memInfo === null) {
                return res.status(403).json({ error: "product list 혹은 로그인 한 member에 관한 정보를 찾을 수 없습니다." });
            }

            for(let i = 0; i < catData.length; i++){
                    //멤버 등급에 따른 상품 할인가 구하기
                const memDiscountPrice = await productController.getMemDiscountPrice(memInfo.levelInfo.lev_discount, catData[i].prd_price);

                if (!memDiscountPrice || memDiscountPrice === null) {
                    return res.status(403).json({ error: "등급별 할인가를 구할 수 없습니다." });
                }

                catData[i].prd_discount_price = memDiscountPrice;
            }
        } else {
            for(let i = 0; i < catData.length; i++){
                catData[i].prd_discount_price = null;
                catData[i].prd_price = null;
            }
        }

        // 상품 목록 반환
        return res.status(200).json(catData);
    } catch (error) {
        console.error("Error fetching cart items:", error);
        return res.status(500).json({ error: "Failed to fetch cart items" });
    }
};
//카테고리 목록 불러오기
categoryController.getCatList = async(req, res) => {
    try{
        const catList = await categoryModel.getCatList();
        return res.status(200).json(catList)
    }catch (error) {
        console.error("Error fetching cart list:", error);
        return res.status(500).json({ error: "Failed to fetch cart list" });
    }
}

//카테고리 뎁스 목록 불러오기
categoryController.getCatDepthList = async(req, res) => {
    try{
        const firstDepthInt = 1;
        const secondDepthInt = 2;
        const thirdDepthInt = 3;

        const firstParentId = 0;

        //* 1번 째 depth List 가져오기
        const firstDepthList = await categoryModel.getCatDepthList(firstDepthInt, firstParentId);
        
        if(firstDepthList == null || !firstDepthList) {
            return res.status(500).json({ error: "1번 째 뎁스 목록을 찾을 수 없습니다." });
        }

        //* 2번 째 depth List 가져오기
        for(let i = 0; i < firstDepthList.length; i++){ 
            const secondDepthList = await categoryModel.getCatDepthList(secondDepthInt, firstDepthList[i].cat_id);

            if(secondDepthList == null || !secondDepthList) {
                return res.status(500).json({ error: "2번 째 뎁스 목록을 찾을 수 없습니다." });
            }

            //* 1번 째 cat_depth_title 가져오기
            firstDepthList[i].cat_depth_title = `${firstDepthList[i].cat_title}`

            firstDepthList[i].secondDepthList = secondDepthList;


        //* 3번 째 depth List 가져오기
            for(let j = 0; j < secondDepthList.length; j++ ) {

                //* 2번 째 cat_depth_title 가져오기
                secondDepthList[j].cat_depth_title = `${firstDepthList[i].cat_title} ▶ ${secondDepthList[j].cat_title}`

                const thirdDepthList = await categoryModel.getCatDepthList(thirdDepthInt, secondDepthList[j].cat_id);

                if(thirdDepthList == null || !thirdDepthList) {
                    return res.status(500).json({ error: "3번 째 뎁스 목록을 찾을 수 없습니다." });
                }
    
                secondDepthList[j].thirdDepthList = thirdDepthList;

                console.log('thirdDepthList.length: ' +thirdDepthList.length);

                for(let k = 0; k < thirdDepthList.length; k++) {
                    //* 3번 째 cat_depth_title 가져오기
                    thirdDepthList[k].cat_depth_title = `${firstDepthList[i].cat_title} ▶ ${secondDepthList[j].cat_title} ▶ ${thirdDepthList[k].cat_title}`
                }
            }
        }

        return res.status(200).json(firstDepthList)
    } catch (error) {
        console.error("Error fetching cart depth list:", error);
        return res.status(500).json({ error: "Failed to fetch cart depth list" });
    }
}

/* 카테고리 내용 수정 */
categoryController.updateCat = async(req, res) => {
    console.log('카테고리 수정 타는지 확인');
    try {

        const updateCatItem = req.body;
        // 카테고리가 실존하는지 || cat_status 상태가 Y인지 검증 및 기존 카테고리 정보 get ------------------
        const checkCatItemExist = await categoryModel.getCatById(updateCatItem.cat_id);

        if (!checkCatItemExist) {
            return res.status(500).json({ error: `선택한 카테고리는 존재하지 않습니다.` })
        } else {
            console.log(`카테고리 확인!`)
        }

        if(req.file){
            
            // 이미지 파일 삭제 로직 추가 ---------------------------------------------------------
            if (checkCatItemExist && checkCatItemExist.icon_filepath !== '') {
                const path = require('path');
                const fs = require('fs');

                // 이미지 파일이 존재하면 삭제
                const imagePath = path.join(__dirname, '../../', checkCatItemExist.icon_filepath);
                console.log('imagePath: ' + imagePath);

                try {
                    fs.unlinkSync(imagePath);
                    console.log(`이전 이미지 파일 삭제: ${imagePath}`);
                } catch (error) {
                    console.error(`이전 이미지 파일 삭제 실패: ${error}`);
                }
            }

            // 파일 업로드 경로 생성
            const iconFilePath = req.file ? `/files/images/category/${req.file.filename}` : '';
            if(iconFilePath.length > 0){
                updateCatItem.icon_filepath = iconFilePath;
            }
         }

        // 카테고리 수정  -------------------------------------------------------
        const updatedCatItem = await categoryModel.updateCat(updateCatItem);

        if (!updatedCatItem) {
            return res.status(404).json({ error: "category not found" });
        }

        console.log(updatedCatItem)

        return res.status(200).json(updatedCatItem);
    } catch (error) {
        console.error("Error updating prd category:", error);
        return res.status(500).json({ error: "Failed to update category" });
    }
};

/* 카테고리 삭제 */
categoryController.delCat = async(req, res) => {
    try {
        const deleteId = req.body.cat_id;
        const currentDatetime = new Date();

        // 카테고리가 실존하는지 || cat_status 상태가 Y인지 검증 ------------------------------
        const deleteFileColumn = await categoryModel.getCatById(deleteId);

        console.log('deleteFileColumn::')
        console.log(deleteFileColumn)

        if (!deleteFileColumn) {
            return res.status(500).json({ error: `선택한 카테고리는 존재하지 않습니다.` })
        } else {
            console.log(`카테고리 확인!`)
        }

        //카테고리에 문제가 없다면 삭제 처리

        if(deleteFileColumn.cat_depth == 1){
            const depth2CatList = await categoryModel.getLowerCatListById(deleteId);

            if(depth2CatList){
                for(let i = 0; i < depth2CatList.length; i++){
                    const depth2CatId = depth2CatList[i].cat_id
    
                    const depth3CatList = await categoryModel.getLowerCatListById(depth2CatId);
                    
                    if(depth3CatList){
                        for(let j = 0; j < depth3CatList.length; j++){

                            console.log('depth3CatList[j]::')
                            console.log(depth3CatList[j])
                            
                            const del3DepthCat = categoryController.delCategoryRutin(depth3CatList[j])

                            if(!del3DepthCat || del3DepthCat == null){
                                return res.status(500).json({ error: "카테고리 & 하위 파일 삭제 처리 중 문제 발생" });
                            }
                        }
                    }

                    console.log('depth2CatList[i]::')
                    console.log(depth2CatList[i])
                    

                    const del2DepthCat = categoryController.delCategoryRutin(depth2CatList[i])

                    if(!del2DepthCat || del2DepthCat == null){
                        return res.status(500).json({ error: "카테고리 & 하위 파일 삭제 처리 중 문제 발생" });
                    }
                }
            }

            const del1DepthCat = categoryController.delCategoryRutin(deleteFileColumn)

            if(!del1DepthCat || del1DepthCat == null){
                return res.status(500).json({ error: "카테고리 & 하위 파일 삭제 처리 중 문제 발생" });
            }
        }

        if(deleteFileColumn.cat_depth == 2){
            const depth3CatList = await categoryModel.getLowerCatListById(deleteId);
                    
            if(depth3CatList){
                for(let i = 0; i < depth3CatList.length; i++){
                    const del3DepthCat = categoryController.delCategoryRutin(depth3CatList[i])

                    if(!del3DepthCat || del3DepthCat == null){
                        return res.status(500).json({ error: "카테고리 & 하위 파일 삭제 처리 중 문제 발생" });
                    }
                }
            }

            const del2DepthCat = categoryController.delCategoryRutin(deleteFileColumn)

            if(!del2DepthCat || del2DepthCat == null){
                return res.status(500).json({ error: "카테고리 & 하위 파일 삭제 처리 중 문제 발생" });
            }
        }

        if(deleteFileColumn.cat_depth == 3){
            const delCategory = categoryController.delCategoryRutin(deleteFileColumn)

            if(!delCategory || delCategory == null){
                return res.status(500).json({ error: "카테고리 & 하위 파일 삭제 처리 중 문제 발생" });
            }
        }

        return res.status(200).json({ message: '카테고리가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({ error: "Failed to delete category" });
    }
};


//카테고리 삭제 일괄 동작 함수
categoryController.delCategoryRutin =  async(deleteFileColumn) => {

    // 카테고리 아이콘 파일 삭제 처리 ---------------------------------------------------
    if (deleteFileColumn && deleteFileColumn.icon_filepath !== '') {
        const path = require('path');
        const fs = require('fs');

        // 이미지 파일이 존재하면 삭제 TODO : 절대경로로 바꿔야함
        const imagePath = path.join(__dirname, '../../', deleteFileColumn.icon_filepath);
        console.log('imagePath: ' + imagePath);

        try {
            fs.unlinkSync(imagePath);
            console.log(`이전 이미지 파일 삭제: ${imagePath}`);
        } catch (error) {
            console.error(`이전 이미지 파일 삭제 실패: ${error}`);
        }
    }

    // 카테고리에 등록된 상품 삭제 ----------------------------------------------------
    const deletedProds = await categoryModel.getProdsByParentId(deleteFileColumn.cat_id);
    
    console.log('deletedProds::')
    console.log(deletedProds)

    if(deletedProds){
        for(let i = 0; i < deletedProds.length; i++){
            const deletedProd = await productModel.deleteProduct(deletedProds[i].prd_idx);

            if(!deletedProd || deletedProd === null){
                return null
            }
        }
    }

    // 카테고리 삭제 처리 --------------------------------------------------------------
    await db('wb_products_category')
    .where('cat_id', deleteFileColumn.cat_id)
    .update({
        cat_status: 'N',
        icon_filepath: '',
        upd_datetime: new Date()
    });    
}
/** 모듈 내보내기 */

module.exports = categoryController
