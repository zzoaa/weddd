/**
 * Health Controller
 * --------------------------------------------------------------------------------
 * 사용자 컨트롤러
 *
 * getStatics   접속
 * postStatics  사용자 접속시 통계데이타를 입력처리
 *
 * @namespace healthinfo
 * @author
 * @version 1.0.0.
 */

const healthinfoController = {};
const healthinfoModel = loadModule('healthinfo', 'model')
const productModel = loadModule('products', 'model')

const path = require('path');

/**
 * Global Middleware
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */

/*카테고리 등록*/
healthinfoController.addCategory = async (req, res) => {
    try {
        const addCategoryItem = req.body;

        if (addCategoryItem == null) {
            return res.status(403).json({ error: '등록할 카테고리 데이터가 없습니다.' });
        }

        // 파일 업로드 경로 생성
        const iconFilePath = req.file ? `/files/images/health_info/category/${req.file.filename}` : '';

        // 카테고리 데이터에 파일 경로 추가
        addCategoryItem.icon_filepath = iconFilePath;

        // 카테고리 등록
        const newCategoryId = await healthinfoModel.addCategory(addCategoryItem);

        console.log(newCategoryId);

        // 생성 성공 메세지 반환
        return res.status(200).json({ message: `${newCategoryId} 카테고리가 생성되었습니다.` });
    } catch (error) {
        console.error('Error add category:', error);
        return res.status(500).json({ error: 'Failed to add category' });
    }
};


healthinfoController.getCategoryItem = async (req, res) => {
    try {
        const catId = req.params?.cat_id ?? null;


        const result = await healthinfoModel.getCategoryItem(catId);


        if(!result) {
            return res.status(501).json('cat_id 를 확인 해주세요.')
        }


        return res.status(200).json(result)
    }catch (e) {

    }
}

/*부모 ID에 따른 카테고리 목록 불러오기*/
healthinfoController.getCatListById = async(req, res) => {
    try {
        // 상위 id 값을 가진 카테고리 목록을 조회
        const cat_parent_id = req.params?.parent_id ?? null;
        console.log('cat_parent_id: ' + cat_parent_id)

        if(cat_parent_id == null) {
            return res.status(500).json({ error: "조회 할 상위 카테고리 값이 없습니다." })
        }

        const cartegoryList = await healthinfoModel.getCatListById(cat_parent_id);

        console.log(cartegoryList)

        // 상품 목록 반환
        return res.status(200).json(cartegoryList);
    } catch (error) {
        console.error("Error fetching category list:", error);
        return res.status(500).json({ error: "Failed to fetch category list" });
    }
};

/* 카테고리 이름 검색 */
healthinfoController.getCatListByKeyword = async(req, res) => {
    try {
        // 상위 id 값을 가진 카테고리 목록을 조회
        const keyword = req.params?.keyword ?? null;
        console.log('cat_parent_id: ' + keyword)

        if(keyword == null) {
            return res.status(500).json({ error: "조회 할 상위 카테고리 값이 없습니다." })
        }

        const searchList = await healthinfoModel.getCatListByKeyword(keyword);

        console.log(searchList)

        // 상품 목록 반환
        return res.status(200).json(searchList);
    } catch (error) {
        console.error("Error fetching category list:", error);
        return res.status(500).json({ error: "Failed to fetch category search list" });
    }
}

/* 카테고리 상세 불러오기 */
healthinfoController.getCatDetailById = async(req, res) => {
    try {
        // console.log('오긴 오나');
        // 상위 id 값을 가진 카테고리 목록을 조회
        const cat_idx = req.params?.cat_idx ?? null;

        if(cat_idx == null) {
            return res.status(500).json({ error: "조회 할 카테고리 값이 없습니다." })
        }

        const cartegoryItem = await healthinfoModel.getCatDetailById(cat_idx);

        console.log(cartegoryItem)

        // 상품 목록 반환
        return res.status(200).json(cartegoryItem);
    } catch (error) {
        console.error("Error fetching cart list:", error);
        return res.status(500).json({ error: "Failed to fetch cart list" });
    }
};

/* 카테고리 내용 수정 */
healthinfoController.updateCategoryItem = async(req, res) => {
    try {
        const updateCatItem = req.body;

        // 카테고리가 실존하는지 || cat_status 상태가 Y인지 검증 및 기존 카테고리 정보 get ------------------

        const checkCatItemExist = await healthinfoModel.getCatDetailById(updateCatItem.cat_idx);

        if (!checkCatItemExist) {
            return res.status(500).json({ error: `선택한 카테고리는 존재하지 않습니다.` })
        } else {
            console.log(`카테고리 확인!`)
        }

        if(req.file){ //req.file 이 있을 때만 아래 로직 진행
            
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
            const iconFilePath = req.file ? `/files/images/health_info/category/${req.file.filename}` : '';
            if(iconFilePath.length > 0) {
                updateCatItem.icon_filepath = iconFilePath;
            }
        }

        
        // 카테고리 수정  -------------------------------------------------------
        const updatedCatItem = await healthinfoModel.updateCategoryItem(updateCatItem);

        if (!updatedCatItem) {

            return res.status(404).json({ error: "faq not found" });
        }
        
        console.log(`${updatedCatItem.cat_idx}의 카테고리 수정 성공`)

        return res.status(200).json(updatedCatItem);
    } catch (error) {
        console.error("Error updating faq category:", error);
        return res.status(500).json({ error: "Failed to update category" });
    }
};

/* 카테고리 삭제 */
healthinfoController.deleteCategoryItem = async(req, res) => {
    try {
        const deleteIdsList = req.body.catIds;
        const currentDatetime = new Date();

        console.log('deleteIdsList 배열의 상태: ');
        console.log(deleteIdsList);

        if(deleteIdsList.length < 1) {
            return res.status(400).json({error: '삭제할 카테고리 아이템이 없습니다.'});
        }

        // 카테고리가 실존하는지 || cat_status 상태가 Y인지 검증 ------------------------------


        for (const item of deleteIdsList) {
            const deleteFileColumn = await healthinfoModel.getCatDetailById(item);

            if (!deleteFileColumn) {
                return res.status(500).json({ error: `선택한 카테고리는 존재하지 않습니다.` })
            } else {
                console.log(`카테고리 확인!`)
            }
            
        // 카테고리 아이콘 파일 삭제 처리 ---------------------------------------------------
            if (deleteFileColumn && deleteFileColumn.icon_filepath !== '') {
                const path = require('path');
                const fs = require('fs');
    
                // 이미지 파일이 존재하면 삭제
                const imagePath = path.join(__dirname, '../../', deleteFileColumn.icon_filepath);
                console.log('imagePath: ' + imagePath);
    
                try {
                    fs.unlinkSync(imagePath);
                    console.log(`이전 이미지 파일 삭제: ${imagePath}`);
                } catch (error) {
                    console.error(`이전 이미지 파일 삭제 실패: ${error}`);
                }
            }
        }

        // 카테고리 삭제 처리 --------------------------------------------------------------
        const db = database()

        // deleteIdsList 배열에 있는 각 cat_idx를 사용하여 해당 행의 status를 "취소"로 업데이트합니다.
        for (const item of deleteIdsList) {
            //*카테고리
            await db('wb_health_info_category')
                .where('cat_idx', item)
                .update({
                    cat_status: 'N',
                    icon_filepath: '',
                    upd_datetime: currentDatetime
                });

            //*상세글
            await db('wb_health_info')
                .where('cat_idx', item)
                .andWhere('info_status', '=', 'Y')
                .update({
                    info_status: 'N',
                    upd_datetime: currentDatetime
                });
        }

        return res.status(200).json({ message: '카테고리가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error("Error deleting category:", error);
        return res.status(500).json({ error: "Failed to delete category" });
    }
};

/*  -------------------------------------- */

/* 상세 글 등록  */
healthinfoController.addInfo = async(req, res) => {
    try {
        // console.log('오긴 오나');
        // 상위 id 값을 가진 카테고리 목록을 조회
        const addInfoItem = req.body;

        if(addInfoItem == null) {
            return res.status(500).json({ error: "등록할 카테고리 데이터가 없습니다." })
        }

        //addInfoItem.cat_idx 가 가진 값을 가진 상세글이 이미 있는지 체크
        const checkCatIdx = await healthinfoModel.getInfoById(addInfoItem.cat_idx);

        if(checkCatIdx) {
            return res.status(403).json({ error: "카테고리는 개당 1개 씩의 상세 글만 가질 수 있습니다." })
        }

        //-----------------------------

        const newInfoId = await healthinfoModel.addInfo(addInfoItem);

        console.log(newInfoId)

        if(newInfoId == null) {
            return res.status(500).json({ error: "상세내용 등록에 실패했습니다." })
        }

        // 생성 성공 메세지 반환
        return res.status(200).json({ message: `${newInfoId} 번째 정보 생성 성공` });
    } catch (error) {
        console.error("Error add cartegory:", error);
        return res.status(500).json({ error: "Failed to add category" });
    }
}

/* 상세 글 불러오기 */
healthinfoController.getInfoById = async(req, res) => {
    try {
        // console.log('오긴 오나');
        // 상위 id 값을 가진 카테고리 목록을 조회
        const cat_idx = req.params?.cat_idx ?? null;

        if(cat_idx == null) {
            return res.status(500).json({ error: "조회 할 게시글 ID가 없습니다." })
        }

        const infoItem = await healthinfoModel.getInfoById(cat_idx);

        if(infoItem == null) {
            return res.status(500).json({ error: "조회 할 게시글을 찾을 수 없습니다." })
        }

        console.log(infoItem)

        // 건강 기능 식품, 건강 식품, 추천 레시피, 추천 운동 내역 불러오기 --------------
        for(let i =0; i < infoItem.health_func_food.length; i++) { //건강 기능 식품
            const food_idx = infoItem.health_func_food[i]
            const funcFoodInfo = await healthinfoModel.getFuncFoodInfoById(food_idx)

            if(funcFoodInfo == null){
                return res.status(500).json({ error: "건강 기능 식품을 찾을 수 없습니다." })
            }

            infoItem.health_func_food[i] = funcFoodInfo
        }

        for(let i =0; i < infoItem.health_food.length; i++) { //건강 식품
            const food_idx = infoItem.health_food[i]
            const foodInfo = await healthinfoModel.getFoodInfoById(food_idx)

            if(foodInfo == null){
                return res.status(500).json({ error: "건강 식품을 찾을 수 없습니다." })
            }

            infoItem.health_food[i] = foodInfo
        }

        for(let i =0; i < infoItem.rec_recipe.length; i++) { //추천 레시피
            const rec_idx = infoItem.rec_recipe[i]
            const recipeInfo = await healthinfoModel.getRecipeInfoById(rec_idx)

            if(recipeInfo == null){
                return res.status(500).json({ error: "추천 레시피를 찾을 수 없습니다." })
            }

            infoItem.rec_recipe[i] = recipeInfo
        }

        for(let i =0; i < infoItem.rec_exercise.length; i++) { //추천 레시피
            const ex_idx = infoItem.rec_exercise[i]
            const exerciseInfo = await healthinfoModel.getExerciseInfoById(ex_idx)

            if(exerciseInfo == null){
                return res.status(500).json({ error: "추천 레시피를 찾을 수 없습니다." })
            }

            infoItem.rec_exercise[i] = exerciseInfo
        }

        console.log('변경된 infoItem :')
        console.log(infoItem)
 
        // 상품 목록 반환
        return res.status(200).json(infoItem);
    } catch (error) {
        console.error("Error fetching post:", error);
        return res.status(500).json({ error: "Failed to fetch post" });
    }
};

/* 상세 글 수정(내용 + 카테고리) */
healthinfoController.updateInfoItem = async(req, res) => {
    try {
        const updateInfoItem = req.body;
        //info_idx가 실존하는지 || info_status 상태가 Y인지 검증
        const infoItem = await healthinfoModel.getInfoById(updateInfoItem.cat_idx);
        // console.log('infoItem: '+ infoItem);

        console.log('infoItem: ');
        console.log(infoItem);

        if(infoItem == null) {
            return res.status(500).json({ error: "수정할 게시글을 찾을 수 없습니다." })
        }

        // 카테고리가 실존하는지 || cat_status 상태가 Y인지 검증
        let checkArray = []
        checkArray.push({ "cat_idx": updateInfoItem.cat_idx });

        console.log('checkArray 배열의 상태: ');
        console.log(checkArray);

        const checkCatIdExist = await healthinfoModel.checkCatIdExist(checkArray);

        if (!checkCatIdExist) {
            return res.status(500).json({ error: `수정하려는 카테고리는 존재하지 않습니다.` })
        } else {
            console.log(`카테고리 확인!`)
        }
        
        // 카테고리 수정
        const updatedInfoItem = await healthinfoModel.updateInfoItem(updateInfoItem);

        if (!updatedInfoItem || updateInfoItem == null) {
            return res.status(403).json({ error: "info item not found" });
        }
        
        console.log(`${updatedInfoItem.info_idx}의 정보 수정 성공`)

        return res.status(200).json(updatedInfoItem);
    } catch (error) {
        console.error("Error updating faq category:", error);
        return res.status(500).json({ error: "Failed to update category" });
    }
};

/*  -------------------------------------- */
//TODO: 건강 기능 식품
// 건강 기능 식품 등록
healthinfoController.addFuncFood = async(req, res) => {
    try {
        const addFuncFoodItem = req.body;

        if(addFuncFoodItem == null) {
            return res.status(500).json({ error: "등록할 건강 기능 식품 데이터가 없습니다." })
        }

        // 파일 업로드 경로 생성
        const thumbFilePath = req.file ? `/files/images/health_info/funcfood/${req.file.filename}` : '';

        // 데이터에 파일 경로 추가
        addFuncFoodItem.thumb_filepath = thumbFilePath;
                
        

        const newFuncFoodId = await healthinfoModel.addFuncFood(addFuncFoodItem);

        console.log(newFuncFoodId)

        if(newFuncFoodId == null) {
            return res.status(500).json({ error: "건강 기능 식품 글 등록에 실패했습니다." })
        }

        // 생성 성공 메세지 반환
        return res.status(200).json({ message: `${newFuncFoodId} 번째 정보 생성 성공` });
    } catch (error) {
        console.error("Error add functional food:", error);
        return res.status(500).json({ error: "Failed to add functional food" });
    }
}

//건강 기능 식품 목록 불러오기
healthinfoController.getFuncFoodList = async(req, res) => {
    try {
        // 상위 id 값을 가진 카테고리 목록을 조회
        const keyword = req.params?.keyword ?? null;
        console.log('keyword: ' + keyword)

        if(keyword == null) {
            return res.status(500).json({ error: "목록을 조회할 키워드가 없습니다." })
        }

        const funcFoodList = await healthinfoModel.getFuncFoodList(keyword);

        console.log(funcFoodList)

        // 상품 목록 반환
        return res.status(200).json(funcFoodList);
    } catch (error) {
        console.error("Error fetching functional food list:", error);
        return res.status(500).json({ error: "Failed to fetch functional food list" });
    }
};

//건강 기능 식품 상세 불러오기
healthinfoController.getFuncFoodInfoById = async(req, res) => {
    try {
        const food_idx = req.params?.food_idx ?? null;

        if(food_idx == null) {
            return res.status(500).json({ error: "조회 할 건강 기능 식품 PK값이 없습니다." })
        }

        const funcFoodItem = await healthinfoModel.getFuncFoodInfoById(food_idx);

        console.log(funcFoodItem)

        // 목록 반환
        return res.status(200).json(funcFoodItem);
    } catch (error) {
        console.error("Error finding funcFoodItem:", error);
        return res.status(500).json({ error: "Failed to find funcFoodItem" });
    }
}

//건강 기능 식품 수정
healthinfoController.updateFuncFoodItem = async(req, res) => {
    try {
        console.log('오긴오나')
        const updateFuncFoodItem = req.body;

        //실제로 있는 글인지 검증
        const checkInfoExist = await healthinfoModel.getFuncFoodInfoById(updateFuncFoodItem.food_idx);

        if(checkInfoExist == null) {
            return res.status(500).json({ error: "업데이트할 건강 기능 식품 글이 존재하지 않습니다." });
        }

        if(req.file){ //req.file 이 있을 때만 아래 로직 진행
            
            // 이미지 파일 삭제 로직 추가 ---------------------------------------------------------
            if (checkInfoExist && checkInfoExist.thumb_filepath !== '') {
                const path = require('path');
                const fs = require('fs');

                // 이미지 파일이 존재하면 삭제
                const imagePath = path.join(__dirname, '../../', checkInfoExist.thumb_filepath);
                console.log('imagePath: ' + imagePath);

                try {
                    fs.unlinkSync(imagePath);
                    console.log(`이전 이미지 파일 삭제: ${imagePath}`);
                } catch (error) {
                    console.error(`이전 이미지 파일 삭제 실패: ${error}`);
                }
            }

            // 파일 업로드 경로 생성
            const thumbFilePath = req.file ? `/files/images/health_info/funcfood/${req.file.filename}` : '';
            if(thumbFilePath.length > 0) {
                updateFuncFoodItem.thumb_filepath = thumbFilePath;
            }
        }
        
        //데이터 업데이트
        const updatedFuncFoodItem = await healthinfoModel.updateFuncFoodItem(updateFuncFoodItem);

        if (!updatedFuncFoodItem) {
            return res.status(404).json({ error: "func food not found" });
        }
        
        console.log(`${updatedFuncFoodItem.food_idx}게시글 수정 성공`)

        return res.status(200).json(updatedFuncFoodItem);
    } catch (error) {
        console.error("Error updating func food:", error);
        return res.status(500).json({ error: "Failed to update func food" });
    }
};

//건강 기능 식품 삭제
healthinfoController.deleteFuncFoodItem = async(req, res) => {
    try {
        const db = database();
        const deleteIdsList = req.body.funcFoodIds;

        if (deleteIdsList.length === 0) {
            return res.status(400).json({error: '삭제할 건강 기능 식품이 없습니다.'});
        }

        
        // 글이 실존하는지 || status 상태가 Y인지 검증 ------------------------------
        for (const item of deleteIdsList) {
            const deleteFileColumn = await healthinfoModel.getFuncFoodInfoById(item);

            if (!deleteFileColumn) {
                return res.status(500).json({ error: `선택한 건강 기능 식품 상세 글은 존재하지 않습니다.` })
            } else {
                console.log(`건강 식품 상세 글 확인!`)
            }
            
        //아이콘 파일 삭제 처리 ---------------------------------------------------
            if (deleteFileColumn && deleteFileColumn.thumb_filepath !== '') {
                const path = require('path');
                const fs = require('fs');
    
                // 이미지 파일이 존재하면 삭제
                const imagePath = path.join(__dirname, '../../', deleteFileColumn.thumb_filepath);
                console.log('imagePath: ' + imagePath);
    
                try {
                    fs.unlinkSync(imagePath);
                    console.log(`이전 이미지 파일 삭제: ${imagePath}`);
                } catch (error) {
                    console.error(`이전 이
                    미지 파일 삭제 실패: ${error}`);
                }
            }
        }  

        for (const item of deleteIdsList) {
            //게시글 삭제
            await db('wb_health_func_food')
                .where('food_idx', item)
                .update({
                    food_status: 'N',
                    thumb_filepath: '',
                })
                .catch((e) => {
                    console.log(e);
                    return null;
                });

            //게시글 idx를 가진 건강정보 상세글 필드 수정 -----------------------------------------------

            const column_name = 'health_func_food';
            const deleted_idx = item;
        
            console.log('column_name: ' + column_name)
            console.log('deleted_idx: ' + deleted_idx)
        
            const modifyList = await healthinfoModel.getInfoListForDelInfoIdx(column_name, deleted_idx)
        
            if(!modifyList || modifyList === null){
                return res.status(503).json({message: 'idx값을 가진 필드 검색 중 문제 발생!'})
            }
        
            if(modifyList.length === 0){
                continue;
            }

            for(let i = 0 ; i < modifyList.length ; i++){
        
                // console.log('before  test[i].health_func_food ::')
                // console.log(test[i].health_func_food)
        
                const modifyArray = JSON.parse(modifyList[i].health_func_food)
        
                    // deleted_idx와 같은 값을 찾아서 삭제
                const indexToDelete = modifyArray.indexOf(deleted_idx);
        
                if (indexToDelete !== -1) {
                    modifyArray.splice(indexToDelete, 1);
                    console.log(`Deleted ${deleted_idx} from modifyArray`);
                } else {
                    console.log(`${deleted_idx} not found in modifyArray`);
                }
        
                // 수정된 modifyArray를 다시 modifyList[i].health_func_food 저장
                modifyList[i].health_func_food = modifyArray;
        
                // console.log('after  modifyList[i].health_func_food ::')
                // console.log(modifyList[i].health_func_food)
                
                const updateInfoItem = {
                    cat_idx: modifyList[i].cat_idx,
                    info_idx : modifyList[i].info_idx,
                    health_func_food : modifyList[i].health_func_food
                }
                const updatedInfo = healthinfoModel.updateInfoItem(updateInfoItem)
        
                if(!updatedInfo || updatedInfo === null){
                    return res.status(503).json({error:"배열에서 아이템 삭제 실패"})
                }
            }
        }

        return res.status(200).json({ message: '건강 기능 식품이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error("Error deleting func food:", error);
        return res.status(500).json({ error: "Failed to delete func food" });
    }
};

/*  -------------------------------------- */
//건강 식품 등록
healthinfoController.addFood = async(req, res) => {
    try {
        const addFoodItem = req.body;

        if(addFoodItem == null) {
            return res.status(500).json({ error: "등록할 건강 식품 데이터가 없습니다." })
        }

        const newFoodId = await healthinfoModel.addFood(addFoodItem);

        console.log(newFoodId)

        if(newFoodId == null) {
            return res.status(500).json({ error: "건강 식품 글 등록에 실패했습니다." })
        }

        // 생성 성공 메세지 반환
        return res.status(200).json({ newId: newFoodId[0] });
    } catch (error) {
        console.error("Error add food:", error);
        return res.status(500).json({ error: "Failed to add food" });
    }
}

//건강 식품 목록 불러오기
healthinfoController.getFoodList = async(req, res) => {
    try {
        // 상위 id 값을 가진 카테고리 목록을 조회
        const keyword = req.params?.keyword ?? null;
        console.log('keyword: ' + keyword)

        if(keyword == null) {
            return res.status(500).json({ error: "목록을 조회할 키워드가 없습니다." })
        }

        const foodList = await healthinfoModel.getFoodList(keyword);

        if(foodList == null) {
            return res.status(500).json({ error: "Failed to finding food list" });
        }

        if(foodList){
            for(let i = 0; i < foodList.length; i++) {
                const parsed_summary = JSON.parse(foodList[i].food_summary);
                // console.log('parsed_summary type: ' + typeof(parsed_summary));
                foodList[i].food_summary = parsed_summary;
            }
        }

        // console.log(foodList)

        // 상품 목록 반환
        return res.status(200).json(foodList);
    } catch (error) {
        console.error("Error fetching food list:", error);
        return res.status(500).json({ error: "Failed to fetch food list" });
    }
};

//건강 식품 상세 불러오기
healthinfoController.getFoodInfoById = async(req, res) => {
    try {
        const food_idx = req.params?.food_idx ?? null;

        if(food_idx == null) {
            return res.status(500).json({ error: "조회 할 건강 식품 PK값이 없습니다." })
        }

        const foodItem = await healthinfoModel.getFoodInfoById(food_idx);

        if(foodItem == null) {
            return res.status(500).json({ error: "Failed to find foodItem" });
        }

        foodItem.food_summary = JSON.parse(foodItem.food_summary);

        console.log(foodItem)

        // 목록 반환
        return res.status(200).json(foodItem);
    } catch (error) {
        console.error("Error finding foodItem:", error);
        return res.status(500).json({ error: "Failed to find foodItem" });
    }
}

//건강 식품 수정
healthinfoController.updateFoodItem = async(req, res) => {
    try {
        const updateFoodItem = req.body;

        //실제로 있는 글인지 검증
        const checkInfoExist = await healthinfoModel.getFoodInfoById(updateFoodItem.food_idx);

        if(checkInfoExist == null) {
            return res.status(500).json({ error: "업데이트할 건강 식품 글이 존재하지 않습니다." });
        }

        //데이터 업데이트

        if(updateFoodItem.food_summary){
            let before_summary = null;
            if(typeof(updateFoodItem.food_summary) === 'string') {
                before_summary = JSON.parse(updateFoodItem.food_summary);
            } else {
                before_summary = updateFoodItem.food_summary;
            }
            updateFoodItem.food_summary = before_summary.map(item => `#${item}`);
        }

        const updatedFoodItem = await healthinfoModel.updateFoodItem(updateFoodItem);
        console.log('updatedFoodItem :')
        console.log(updatedFoodItem)

        if (!updatedFoodItem) {
            return res.status(404).json({ error: "func food not found" });
        }
        
        console.log(`${updatedFoodItem.food_idx}게시글 수정 성공`)

        return res.status(200).json(updatedFoodItem);
    } catch (error) {
        console.error("Error updating func food:", error);
        return res.status(500).json({ error: "Failed to update func food" });
    }
};

//건강 식품 삭제
healthinfoController.deleteFoodItem = async(req, res) => {
    try {
        const db = database();
        const deleteIdsList = req.body.foodIds;

        if (deleteIdsList.length === 0) {
            return res.status(400).json({error: '삭제할 건강 식품이 없습니다.'});
        }

        // 글이 실존하는지 || status 상태가 N이 아닌지 검증 ------------------------------


        for (const item of deleteIdsList) {
            const deleteFileColumn = await healthinfoModel.getFoodInfoById(item);

            if (!deleteFileColumn) {
                return res.status(500).json({ error: `선택한 건강 식품 상세 글은 존재하지 않습니다.` })
            } else {
                console.log(`건강 식품 상세 글 확인!`)
            }

            // 이미지 파일 삭제 로직 추가 ---------------------------------------------------------
            if (deleteFileColumn.icon_filepath) {
                const path = require('path');
                const fs = require('fs');

                // 이미지 파일이 존재하면 삭제
                const imagePath = path.join(__dirname, '../../', deleteFileColumn.icon_filepath);
                console.log('imagePath: ' + imagePath);

                try {
                    fs.unlinkSync(imagePath);
                    console.log(`이전 이미지 파일 삭제: ${imagePath}`);
                } catch (error) {
                    console.error(`이전 이미지 파일 삭제 실패: ${error}`);
                }
            }

            if (deleteFileColumn.thumb_filepath) {
                const path = require('path');
                const fs = require('fs');

                // 이미지 파일이 존재하면 삭제
                const imagePath = path.join(__dirname, '../../', deleteFileColumn.thumb_filepath);
                console.log('imagePath: ' + imagePath);

                try {
                    fs.unlinkSync(imagePath);
                    console.log(`이전 이미지 파일 삭제: ${imagePath}`);
                } catch (error) {
                    console.error(`이전 이미지 파일 삭제 실패: ${error}`);
                }
            }


            await db('wb_health_food')
                .where('food_idx', item)
                .update({
                    food_status: 'N',
                    icon_idx: null,
                    thumb_idx: null,
                })
                .catch((e) => {
                    console.log(e);
                    return null;
                });

            if(deleteFileColumn.icon_idx || deleteFileColumn.icon_idx !== null) {
                const deletIconPath = await productModel.deleteAttachment('HEALTH_INFO_FOOD', deleteFileColumn.icon_idx);
                
                if(deletIconPath){
                    console.log('아이콘 삭제 성공')
                }
            }
            if(deleteFileColumn.thumb_idx || deleteFileColumn.thumb_idx !== null) {
                const deletThumbPath = await productModel.deleteAttachment('HEALTH_INFO_FOOD', deleteFileColumn.thumb_idx);
                
                if(deletThumbPath){
                    console.log('썸네일 삭제 성공')
                }    
            }  


             //게시글 idx를 가진 건강정보 상세글 필드 수정 -----------------------------------------------

             const column_name = 'health_food';
             const deleted_idx = item;
         
             console.log('column_name: ' + column_name)
             console.log('deleted_idx: ' + deleted_idx)
         
             const modifyList = await healthinfoModel.getInfoListForDelInfoIdx(column_name, deleted_idx)
         
             if(!modifyList || modifyList === null){
                 return res.status(503).json({message: 'idx값을 가진 필드 검색 중 문제 발생!'})
             }
         
             if(modifyList.length === 0){
                 continue;
             }
 
             for(let i = 0 ; i < modifyList.length ; i++){
         
                 // console.log('before  test[i].health_food ::')
                 // console.log(test[i].health_food)
         
                 const modifyArray = JSON.parse(modifyList[i].health_food)
         
                     // deleted_idx와 같은 값을 찾아서 삭제
                 const indexToDelete = modifyArray.indexOf(deleted_idx);
         
                 if (indexToDelete !== -1) {
                     modifyArray.splice(indexToDelete, 1);
                     console.log(`Deleted ${deleted_idx} from modifyArray`);
                 } else {
                     console.log(`${deleted_idx} not found in modifyArray`);
                 }
         
                 // 수정된 modifyArray를 다시 modifyList[i].health_food 저장
                 modifyList[i].health_food = modifyArray;
         
                 // console.log('after  modifyList[i].health_food ::')
                 // console.log(modifyList[i].health_food)
                 
                 const updateInfoItem = {
                     cat_idx: modifyList[i].cat_idx,
                     info_idx : modifyList[i].info_idx,
                     health_food : modifyList[i].health_food
                 }
                 const updatedInfo = healthinfoModel.updateInfoItem(updateInfoItem)
         
                 if(!updatedInfo || updatedInfo === null){
                     return res.status(503).json({error:"배열에서 아이템 삭제 실패"})
                 }
             }
        }

        return res.status(200).json({ message: '건강 식품이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error("Error deleting food:", error);
        return res.status(500).json({ error: "Failed to delete food" });
    }
};

/*  -------------------------------------- */
//TODO: 추천 레시피
healthinfoController.addRecipe = async(req, res) => {
    try {
        const addRecipeItem = req.body;

        if(addRecipeItem == null) {
            return res.status(500).json({ error: "등록할 건강 레시피 데이터가 없습니다." })
        }

        // 파일 업로드 경로 생성
        const thumbFilePath = req.file ? `/files/images/health_info/recipe/${req.file.filename}` : '';

        // 데이터에 파일 경로 추가
        addRecipeItem.thumb_filepath = thumbFilePath;

        console.log('addRecipeItem.thumb_filepath' + addRecipeItem.thumb_filepath);

        const newRecipeId = await healthinfoModel.addRecipe(addRecipeItem);

        console.log(newRecipeId)

        if(newRecipeId == null) {
            return res.status(500).json({ error: "건강 레시피 등록에 실패했습니다." })
        }

        // 생성 성공 메세지 반환
        return res.status(200).json({ message: `${newRecipeId} 번째 정보 생성 성공` });
    } catch (error) {
        console.error("Error add Recipe:", error);
        return res.status(500).json({ error: "Failed to add Recipe" });
    }
}

//추천 레시피 목록 불러오기
healthinfoController.getRecipeList = async(req, res) => {
    try {
        // 상위 id 값을 가진 카테고리 목록을 조회
        const keyword = req.params?.keyword ?? null;
        console.log('keyword: ' + keyword)

        if(keyword == null) {
            return res.status(500).json({ error: "목록을 조회할 키워드가 없습니다." })
        }

        const recipeList = await healthinfoModel.getRecipeList(keyword);

        console.log(recipeList)

        // 상품 목록 반환
        return res.status(200).json(recipeList);
    } catch (error) {
        console.error("Error fetching recipe list:", error);
        return res.status(500).json({ error: "Failed to fetch recipe list" });
    }
};

//추천 레시피 상세 불러오기
healthinfoController.getRecipeInfoById = async(req, res) => {
    try {
        const rec_idx = req.params?.rec_idx ?? null;

        if(rec_idx == null) {
            return res.status(500).json({ error: "조회 할 추천 레시피 PK값이 없습니다." })
        }

        const recipeItem = await healthinfoModel.getRecipeInfoById(rec_idx);

        console.log(recipeItem)

        // 목록 반환
        return res.status(200).json(recipeItem);
    } catch (error) {
        console.error("Error finding recipeItem:", error);
        return res.status(500).json({ error: "Failed to find recipeItem" });
    }
}

//추천 레시피 수정
healthinfoController.updateRecipeItem = async(req, res) => {
    try {
        const updateRecipeItem = req.body;

        //실제로 있는 글인지 검증
        const checkInfoExist = await healthinfoModel.getRecipeInfoById(updateRecipeItem.rec_idx);

        if(checkInfoExist == null) {
            return res.status(500).json({ error: "업데이트할 레시피 글이 존재하지 않습니다." });
        }
        
        if(req.file){ //req.file 이 있을 때만 아래 로직 진행
            
            // 이미지 파일 삭제 로직 추가 ---------------------------------------------------------
            if (checkInfoExist && checkInfoExist.thumb_filepath !== '') {
                const path = require('path');
                const fs = require('fs');

                // 이미지 파일이 존재하면 삭제
                const imagePath = path.join(__dirname, '../../', checkInfoExist.thumb_filepath);
                console.log('imagePath: ' + imagePath);

                try {
                    fs.unlinkSync(imagePath);
                    console.log(`이전 이미지 파일 삭제: ${imagePath}`);
                } catch (error) {
                    console.error(`이전 이미지 파일 삭제 실패: ${error}`);
                }
            }

            // 파일 업로드 경로 생성
            const thumbFilePath = req.file ? `/files/images/health_info/recipe/${req.file.filename}` : '';
            if(thumbFilePath.length > 0) {
                updateRecipeItem.thumb_filepath = thumbFilePath;
            }
        }

        //데이터 업데이트
        const updatedRecipeItem = await healthinfoModel.updateRecipeItem(updateRecipeItem);

        if (!updatedRecipeItem) {
            return res.status(404).json({ error: "recipe not found" });
        }
        
        console.log(`${updatedRecipeItem.rec_idx}게시글 수정 성공`)

        return res.status(200).json(updatedRecipeItem);
    } catch (error) {
        console.error("Error updating recipe:", error);
        return res.status(500).json({ error: "Failed to update recipe" });
    }
};

//추천 레시피 삭제
healthinfoController.deleteRecipeItem = async(req, res) => {
    try {
        const db = database();
        const deleteIdsList = req.body.recipeIds;

        if (deleteIdsList.length === 0) {
            return res.status(400).json({error: '삭제할 레시피가 없습니다.'});
        }


        // 글이 실존하는지 || status 상태가 Y인지 검증 ------------------------------


        for (const item of deleteIdsList) {
            const deleteFileColumn = await healthinfoModel.getRecipeInfoById(item);

            if (!deleteFileColumn) {
                return res.status(500).json({ error: `선택한 추천 레시피 상세 글은 존재하지 않습니다.` })
            } else {
                console.log(`추천 레시피 상세 글 확인!`)
            }
            
        //아이콘 파일 삭제 처리 ---------------------------------------------------
            if (deleteFileColumn && deleteFileColumn.thumb_filepath !== '') {
                const path = require('path');
                const fs = require('fs');
    
                // 이미지 파일이 존재하면 삭제
                const imagePath = path.join(__dirname, '../../', deleteFileColumn.thumb_filepath);
                console.log('imagePath: ' + imagePath);
    
                try {
                    fs.unlinkSync(imagePath);
                    console.log(`이전 이미지 파일 삭제: ${imagePath}`);
                } catch (error) {
                    console.error(`이전 이미지 파일 삭제 실패: ${error}`);
                }
            }
        }  

        for (const item of deleteIdsList) {
            await db('wb_health_recipe')
                .where('rec_idx', item)
                .update({
                    rec_status: 'N',
                    thumb_filepath: '',
                })
                .catch((e) => {
                    console.log(e);
                    return null;
                });


            //게시글 idx를 가진 건강정보 상세글 필드 수정 -----------------------------------------------

            const column_name = 'rec_recipe';
            const deleted_idx = item;
        
            console.log('column_name: ' + column_name)
            console.log('deleted_idx: ' + deleted_idx)
        
            const modifyList = await healthinfoModel.getInfoListForDelInfoIdx(column_name, deleted_idx)
        
            if(!modifyList || modifyList === null){
                return res.status(503).json({message: 'idx값을 가진 필드 검색 중 문제 발생!'})
            }
        
            if(modifyList.length === 0){
                continue;
            }

            for(let i = 0 ; i < modifyList.length ; i++){
        
                // console.log('before  test[i].rec_recipe ::')
                // console.log(test[i].rec_recipe)
        
                const modifyArray = JSON.parse(modifyList[i].rec_recipe)
        
                    // deleted_idx와 같은 값을 찾아서 삭제
                const indexToDelete = modifyArray.indexOf(deleted_idx);
        
                if (indexToDelete !== -1) {
                    modifyArray.splice(indexToDelete, 1);
                    console.log(`Deleted ${deleted_idx} from modifyArray`);
                } else {
                    console.log(`${deleted_idx} not found in modifyArray`);
                }
        
                // 수정된 modifyArray를 다시 modifyList[i].rec_recipe 저장
                modifyList[i].rec_recipe = modifyArray;
        
                // console.log('after  modifyList[i].rec_recipe ::')
                // console.log(modifyList[i].rec_recipe)
                
                const updateInfoItem = {
                    cat_idx: modifyList[i].cat_idx,
                    info_idx : modifyList[i].info_idx,
                    rec_recipe : modifyList[i].rec_recipe
                }
                const updatedInfo = healthinfoModel.updateInfoItem(updateInfoItem)
        
                if(!updatedInfo || updatedInfo === null){
                    return res.status(503).json({error:"배열에서 아이템 삭제 실패"})
                }
            }
        }

        return res.status(200).json({ message: '레시피가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error("Error deleting recipe:", error);
        return res.status(500).json({ error: "Failed to delete recipe" });
    }
};

/*  -------------------------------------- */
//TODO: 추천 운동
/* 추천 운동 등록 */
healthinfoController.addExercise = async(req, res) => {
    try {
        const addExerciseItem = req.body;

        console.log('addExerciseItem');
        console.log(addExerciseItem);

        if(addExerciseItem == null) {
            return res.status(500).json({ error: "등록할 건강 운동 데이터가 없습니다." })
        }
        
        const newExerciseId = await healthinfoModel.addExercise(addExerciseItem);

        console.log(newExerciseId)

        if(newExerciseId == null) {
            return res.status(500).json({ error: "건강 운동 글 등록에 실패했습니다." })
        }

        // 생성 성공 메세지 반환
        return res.status(200).json({ newId: newExerciseId[0] });
    } catch (error) {
        console.error("Error add exercise:", error);
        return res.status(500).json({ error: "Failed to add exercise" });
    }
}

//추천 운동 목록 불러오기
healthinfoController.getExerciseList = async(req, res) => {
    try {
        // 상위 id 값을 가진 카테고리 목록을 조회
        const keyword = req.params?.keyword ?? null;
        console.log('keyword: ' + keyword)

        if(keyword == null) {
            return res.status(500).json({ error: "목록을 조회할 키워드가 없습니다." })
        }

        const exerciseList = await healthinfoModel.getExerciseList(keyword);

        if(exerciseList == null) {
            return res.status(500).json({ error: "Failed to fetch exercise list" });  
        }

        for(let i = 0; i < exerciseList.length; i++) {
            const parsed_summary = JSON.parse(exerciseList[i].ex_summary);
            console.log('parsed_summary type: ' + typeof(parsed_summary));
            exerciseList[i].ex_summary = parsed_summary;
        }

        console.log(exerciseList)

        // 상품 목록 반환
        return res.status(200).json(exerciseList);
    } catch (error) {
        console.error("Error fetching exercise list:", error);
        return res.status(500).json({ error: "Failed to fetch exercise list" });
    }
};

//추천 운동 상세 불러오기
healthinfoController.getExerciseInfoById = async(req, res) => {
    try {
        const ex_idx = req.params?.ex_idx ?? null;

        if(ex_idx == null) {
            return res.status(500).json({ error: "조회 할 추천 운동 PK값이 없습니다." })
        }

        const exerciseItem = await healthinfoModel.getExerciseInfoById(ex_idx);

        if(exerciseItem == null) {
            return res.status(500).json({ error: "Failed to find exerciseItem" });
        }

        exerciseItem.ex_summary = JSON.parse(exerciseItem.ex_summary);

        console.log(exerciseItem)

        // 목록 반환
        return res.status(200).json(exerciseItem);
    } catch (error) {
        console.error("Error finding exerciseItem:", error);
        return res.status(500).json({ error: "Failed to find exerciseItem" });
    }
}

//추천 운동 수정
healthinfoController.updateExerciseItem = async(req, res) => {
    try {
        const updateExerciseItem = req.body;

        //실제로 있는 글인지 검증
        const checkInfoExist = await healthinfoModel.getExerciseInfoById(updateExerciseItem.ex_idx);

        if(checkInfoExist == null) {
            return res.status(500).json({ error: "업데이트할 운동 글이 존재하지 않습니다." });
        }
        
        //데이터 업데이트

        if(updateExerciseItem.ex_summary){
            let before_summary = null;
            if(typeof(updateExerciseItem.ex_summary) === 'string') {
                before_summary = JSON.parse(updateExerciseItem.ex_summary);
            } else {
                before_summary = updateExerciseItem.ex_summary;
            }
            updateExerciseItem.ex_summary = before_summary.map(item => `#${item}`);
        }

        const updatedExerciseItem = await healthinfoModel.updateExerciseItem(updateExerciseItem);

        if (!updatedExerciseItem) {
            return res.status(404).json({ error: "recipe not found" });
        }
        
        console.log(`${updatedExerciseItem.ex_idx}게시글 수정 성공`)

        return res.status(200).json(updatedExerciseItem);
    } catch (error) {
        console.error("Error updating updatedExerciseItem:", error);
        return res.status(500).json({ error: "Failed to update updatedExerciseItem" });
    }
};


//추천 운동 삭제
healthinfoController.deleteExerciseItem = async(req, res) => {
    try {
        const db = database();
        const deleteIdsList = req.body.exerciseIds;

        if (deleteIdsList.length === 0) {
            return res.status(400).json({error: '삭제할 운동이 없습니다.'});
        }

        // 글이 실존하는지 || status 상태가 Y인지 검증 ------------------------------


        for (const item of deleteIdsList) {
            const deleteFileColumn = await healthinfoModel.getExerciseInfoById(item);

            if (!deleteFileColumn) {
                return res.status(500).json({ error: `선택한 추천 운동 상세 글은 존재하지 않습니다.` })
            } else {
                console.log(`추천 운동 상세 글 확인!`)
            }

            // 이미지 파일 삭제 로직 추가 ---------------------------------------------------------
            if (deleteFileColumn.icon_filepath) {
                const path = require('path');
                const fs = require('fs');

                // 이미지 파일이 존재하면 삭제
                const imagePath = path.join(__dirname, '../../', deleteFileColumn.icon_filepath);
                console.log('imagePath: ' + imagePath);

                try {
                    fs.unlinkSync(imagePath);
                    console.log(`이전 이미지 파일 삭제: ${imagePath}`);
                } catch (error) {
                    console.error(`이전 이미지 파일 삭제 실패: ${error}`);
                }
            }

            if (deleteFileColumn.thumb_filepath) {
                const path = require('path');
                const fs = require('fs');

                // 이미지 파일이 존재하면 삭제
                const imagePath = path.join(__dirname, '../../', deleteFileColumn.thumb_filepath);
                console.log('imagePath: ' + imagePath);

                try {
                    fs.unlinkSync(imagePath);
                    console.log(`이전 이미지 파일 삭제: ${imagePath}`);
                } catch (error) {
                    console.error(`이전 이미지 파일 삭제 실패: ${error}`);
                }
            }
            
            await db('wb_health_exercise')
                .where('ex_idx', item)
                .update({
                    ex_status: 'N',
                    icon_idx: null,
                    thumb_idx: null,
                })
                .catch((e) => {
                    console.log(e);
                    return null;
                });

            if(deleteFileColumn.icon_idx || deleteFileColumn.icon_idx !== null) {
                const deletIconPath = await productModel.deleteAttachment('HEALTH_INFO_EX', deleteFileColumn.icon_idx);
                
                if(deletIconPath){
                    console.log('아이콘 삭제 성공')
                }
            }

            if(deleteFileColumn.thumb_idx || deleteFileColumn.thumb_idx !== null) {
                const deletThumbPath = await productModel.deleteAttachment('HEALTH_INFO_EX', deleteFileColumn.thumb_idx);
                
                if(deletThumbPath){
                    console.log('썸네일 삭제 성공')
                }    
            }
            
            //게시글 idx를 가진 건강정보 상세글 필드 수정 -----------------------------------------------
            
            const column_name = 'rec_exercise';
            const deleted_idx = item;
        
            console.log('column_name: ' + column_name)
            console.log('deleted_idx: ' + deleted_idx)
        
            const modifyList = await healthinfoModel.getInfoListForDelInfoIdx(column_name, deleted_idx)
        
            if(!modifyList || modifyList === null){
                return res.status(503).json({message: 'idx값을 가진 필드 검색 중 문제 발생!'})
            }
        
            if(modifyList.length === 0){
                continue;
            }

            for(let i = 0 ; i < modifyList.length ; i++){
        
                // console.log('before  test[i].rec_exercise ::')
                // console.log(test[i].rec_exercise)
        
                const modifyArray = JSON.parse(modifyList[i].rec_exercise)
        
                  // deleted_idx와 같은 값을 찾아서 삭제
                const indexToDelete = modifyArray.indexOf(deleted_idx);
        
                if (indexToDelete !== -1) {
                    modifyArray.splice(indexToDelete, 1);
                    console.log(`Deleted ${deleted_idx} from modifyArray`);
                } else {
                    console.log(`${deleted_idx} not found in modifyArray`);
                }
        
                // 수정된 modifyArray를 다시 modifyList[i].rec_exercise에 저장
                modifyList[i].rec_exercise = modifyArray;
        
                // console.log('after  modifyList[i].rec_exercise ::')
                // console.log(modifyList[i].rec_exercise)
                
                const updateInfoItem = {
                    cat_idx: modifyList[i].cat_idx,
                    info_idx : modifyList[i].info_idx,
                    rec_exercise : modifyList[i].rec_exercise
                }
                const updatedInfo = healthinfoModel.updateInfoItem(updateInfoItem)
        
                if(!updatedInfo || updatedInfo === null){
                    return res.status(503).json({error:"배열에서 아이템 삭제 실패"})
                }
            }
    
        }

        return res.status(200).json({ message: '운동이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error("Error deleting exercise:", error);
        return res.status(500).json({ error: "Failed to delete exercise" });
    }
};


/* ------------------------------- */
/* 건강 식품 & 추천 운동 파일 추가 라우트 */
healthinfoController.addAttachment = async (req, res) => {
    try {
        let insertedFiles  = [];
        const files = req.files;
        console.dir(files);
        let att_target_type;
        let att_target;
        let att_filepath;
        console.log('req.route.path' + req.route.path);
        if (req.route.path === '/food/addAttachment') {
            att_target_type = 'HEALTH_INFO_FOOD';
            att_target = req.body.food_idx;
            att_filepath = `/files/images/health_info/food/`
        }
        else if (req.route.path === '/exercise/addAttachment') {
            att_target_type = 'HEALTH_INFO_EX';
            att_target = req.body.ex_idx;
            att_filepath = `/files/images/health_info/exercise/`
        }
        for (let file of files) {
            const fileData = {
                att_target_type: att_target_type,
                att_target: att_target,// -> write폼에서 Value로 가져오도록 수정
                att_origin: file.originalname,
                att_filepath: `${att_filepath}${file.filename}`,
                att_ext: path.extname(file.originalname).substring(1), // 확장자 추출
                att_is_image: file.mimetype.startsWith('image/') ? 'Y' : 'N'
                //TODO : att_sort값. //여러개가 올라가면 어떻게 되지?
                //만약 미리보기상에서 체크박스 대표이미지로 지정을 체크했다면?
            };
            const insertedId = await productModel.insertAttachment(fileData);
            console.log("File added successfully with ID:", insertedId[0]);
        // res.json({ success: true, att_idx: lastInsertedIds });
        // 파일 정보 객체를 생성하고 배열에 추가합니다.
        insertedFiles.push({ idx: insertedId[0], path: fileData.att_filepath });
        }
        res.json(insertedFiles);
    } catch (error) {
        console.error("Error adding attachment:", error);
    }
};

// 파일 삭제 라우트
healthinfoController.deleteAttachment = async(req, res) => {
    try{
        const att_target_type = req.body.target_type; //ex: PRODUCTS, PRODUCTS_REVIEW ...
        const att_idx = req.body.att_idx; //att_idx

        if(!att_idx || !att_target_type) {
            return res.status(500).json({ error: "삭제에 필요한 데이터를 보내주세요." })
        }

        console.log('att_idx:' + att_idx)

        const deletResult = await productModel.deleteAttachment(att_target_type, att_idx);

        console.log('deletResult' + deletResult);

        if (deletResult) {
            return res.status(200).send('첨부파일이 성공적으로 삭제되었습니다.');
        } else {
            return res.status(500).json({ error: "첨부파일 삭제 실패." });
        }
    } catch(error) {
        console.error("Error deleting product att:", error);
        return res.status(500).json({ error: "product att delete err." })
    }
}

module.exports = healthinfoController
