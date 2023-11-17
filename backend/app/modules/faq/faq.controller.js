/**
 * Users Controller
 * --------------------------------------------------------------------------------
 * 사용자 컨트롤러
 *
 * getStatics   접속
 * postStatics  사용자 접속시 통계데이타를 입력처리
 *
 * @namespace users
 * @author 장선근
 * @version 1.0.0.
 */

const faqController = {};
const faqModel = loadModule('faq', 'model')

/**
 * Global Middleware
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */

/*FAQ 카테고리 등록*/
faqController.addFaqCategory = async(req, res) => {
    try {
        const fac_idx = req.body?.fac_idx ?? '' ;
        const fac_title = req.body?.fac_title ?? '' ;
        const mem_idx = req.body?.mem_idx ?? '';

        const newfaqCatetory = await faqModel.addfaqCategory(fac_idx, fac_title, mem_idx);

        console.log (newfaqCatetory);
        return res.status(200).json({ message: `${newfaqCatetory.categoryIdx} 카테고리가 생성되었습니다.` });
    } catch (error) {
        console.error("Error adding faq category:", error);
        return res.status(500).json({ error: "Failed to add faq category." });
    }
};

/*FAQ 카테고리 목록 불러오기*/
faqController.getFaqCategoryList = async(req, res) => {
    try {
        // 데이터베이스에서 상품 목록을 조회
        const allFaqCategories = await faqModel.getAllFaqCategory();

        console.log(allFaqCategories)

        // 상품 목록 반환
        return res.json(allFaqCategories);
    } catch (error) {
        console.error("Error fetching  faq category:", error);
        return res.status(500).json({ error: "Failed to fetch faq category" });
    }
};

/*FAQ 카테고리 상세보기*/
faqController.getFacItemById = async(req, res) => {
    try {
        const fac_idx = req.params?.facIdx;
        const selectedFac = await faqModel.getFacItemById(fac_idx);

        console.log(selectedFac)
        
        if(!selectedFac || selectedFac == null) {
            return res.status(500).json({ error: "해당 FAQ 카테고리를 찾을 수 없습니다." })
        }

        // 상품 목록 반환
        return res.json(selectedFac);
    } catch (error) {
        console.error("Error fetching  faq:", error);
        return res.status(500).json({ error: "Failed to fetch faq" });
    }
};

/*FAQ 카테고리 수정*/
faqController.updateFaqCategoryItem = async(req, res) => {
    try {
        const updateFac = req.body;

        const updatedfaqItem = await faqModel.updateFaqCategoryItem(updateFac);

        if (!updatedfaqItem) {
            return res.status(404).json({ error: "faq not found" });
        }
        
        console.log(`${updatedfaqItem.fac_idx}의 카테고리명 수정 성공`)

        return res.status(200).json(updatedfaqItem);
    } catch (error) {
        console.error("Error updating faq category:", error);
        return res.status(500).json({ error: "Failed to update faq category" });
    }
};

/*FAQ 카테고리 삭제*/
faqController.deleteFaqCategoryItem = async(req, res) => {
    try {
        const deleteIdsList = req.body.faqIds;

        if (deleteIdsList.length === 0) {
            return res.status(400).json({error: '삭제할 FAQ 카테고리 아이템이 없습니다.'});
        }

        const db = database()

        for( const fac_idx of deleteIdsList){
            const lowerFaqList = await faqModel.getFaqListById(fac_idx);

            if(!lowerFaqList || lowerFaqList === null){
                return res.status(500).json({ error: "하위 faq 글을 찾지 못했습니다." });
            }
            if(lowerFaqList == 0){ continue; }

            for(let i = 0; i < lowerFaqList.length; i++){
                const deletedFaq = await faqModel.deleteFaqItem(lowerFaqList[i].faq_idx);

                console.log('deletedFaq::')
                console.log(deletedFaq)

                if(!deletedFaq){
                    return res.status(500).json({ error: "FAQ 글 삭제 실패" });
                }
            }

            const deleteFac = await faqModel.deleteFacItem(fac_idx);

            if(!deleteFac){
                return res.status(500).json({ error: "FAQ 카테고리 삭제 실패" });
            }

        }


        return res.status(200).json({ message: 'FAQ 카테고리가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error("Error deleting faq:", error);
        return res.status(500).json({ error: "Failed to delete faq" });
    }
};

/* ---------------------------*/

/*FAQ 글 등록*/
faqController.addFaqCategoryItem = async(req, res) => {
    try {
        // console.log('오긴오나')
        const faqData = req.body;

        if (!faqData) {
            return res.status(500).json({ error: "추가할 FAQ 내용이 없습니다." });
        }

        const newfaqPost = await faqModel.addFaqCategoryItem(faqData);

        console.log (newfaqPost);
        return res.status(200).json({ newfaqPost });
    } catch (error) {
        console.error("Error adding faq category:", error);
        return res.status(500).json({ error: "Failed to add faq category." });
    }
};

/*FAQ 글 목록 불러오기*/
faqController.getFaqListById = async(req, res) => {
    try {
        const fac_idx = req.params?.facIdx;

        const checkFacIdxExist = await faqModel.checkFacIdxExist(fac_idx);

        if(!checkFacIdxExist) {
            return res.status(500).json({ error: `${fac_idx} 카테고리는 존재하지 않습니다.` })
        } else {
            console.log(`${fac_idx} 카테고리 확인!`)
        }
        
        // 데이터베이스에서 상품 목록을 조회
        const FaqsListById  = await faqModel.getFaqListById(fac_idx);

        console.log(FaqsListById)

        // 상품 목록 반환
        return res.json(FaqsListById);
    } catch (error) {
        console.error("Error fetching  faq category:", error);
        return res.status(500).json({ error: "Failed to fetch faq category" });
    }
};

/*FAQ 특정 글 불러오기(상세보기)*/
faqController.getFaqById = async(req, res) => {
    try {
        const faq_idx = req.params?.faqIdx;
        const selectedFaq = await faqModel.getFaqById(faq_idx);

        console.log(selectedFaq)
        
        if(!selectedFaq || selectedFaq == null) {
            return res.status(500).json({ error: "해당 FAQ를 찾을 수 없습니다." })
        }

        // 상품 목록 반환
        return res.json(selectedFaq);
    } catch (error) {
        console.error("Error fetching  faq:", error);
        return res.status(500).json({ error: "Failed to fetch faq" });
    }
};

/*FAQ 글 수정*/
faqController.updateFaqItem = async(req, res) => {
    try {
        const updateFaqData = req.body;
        const fac_idx = req.body.fac_idx;
        // const faq_idx = req.body.faq_idx;

        console.log(updateFaqData);

        //updateFaqData 내 카테고리 실존 여부 확인
        const checkFacIdxExist = await faqModel.checkFacIdxExist(fac_idx);

        if(!checkFacIdxExist) {
            return res.status(500).json({ error: `${fac_idx} 카테고리는 존재하지 않습니다.` })
        } else {
            console.log(`${fac_idx} 카테고리 확인!`)
        }

        //faq 업데이트
        const updatedfaqItem = await faqModel.updateFaqItem(updateFaqData);

        if (updatedfaqItem == null) {
            return res.status(500).json({ error: "Failed to update faq" });
        }
        
        console.log(`${updatedfaqItem.fac_idx}의 FAQ 수정 성공`)

        return res.status(200).json(updatedfaqItem);
    } catch (error) {
        console.error("Error updating faq:", error);
        return res.status(500).json({ error: "Failed to update faq" });
    }
};

/*FAQ 글 삭제*/
faqController.deleteFaqItem = async(req, res) => {
    try {
        const deleteFaqId = req.body.faq_idx;

        if(!deleteFaqId){
            return res.status(401).json({ error: "삭제할 faq의 PK값을 보내주세요." });
        }

        const deletedResult = await faqModel.deleteFaqItem(deleteFaqId)

        if(!deletedResult){
            return res.status(500).json({ error: "FAQ 글 삭제 실패" });
        }

        return res.status(200).json({ message: 'FAQ가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error("Error deleting faq:", error);
        return res.status(500).json({ error: "Failed to delete faq" });
    }
};

module.exports = faqController
