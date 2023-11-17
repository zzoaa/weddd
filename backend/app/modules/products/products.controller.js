/**
 * products Controller
 * --------------------------------------------------------------------------------
 * 사용자 컨트롤러
 *
 * getStatics   접속
 * postStatics  사용자 접속시 통계데이타를 입력처리
 *
 * @namespace products
 * @author 장선근
 * @version 1.0.0.
 */

const productController = {};
const productModel = loadModule('products', 'model')
const filesModel = loadModule('files', 'model')
const memberController = loadModule('members', 'controller');

const path = require('path');
const uploadLibrary = require('../../libraries/upload.library.js');

const membersModel = loadModule('members', 'model')
/**
 * Global Middleware
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */


/* 파일 ------------------------------------------------- */
// 파일 추가
productController.addAttachment = async (req, res) => {
    try {
        let insertedFiles  = [];
        const files = req.files;
        console.log('files: ')
        console.dir(files);
        let att_target_type;
        let att_target;
        let filepath;
        if (req.route.path === '/addAttachment') {
            att_target_type = 'PRODUCTS';
            att_target = req.body.prd_idx;
            filepath = '/files/images/products/';
        } else if (req.route.path === '/addReviewFile') {
            att_target_type = 'PRODUCTS_REVIEW';
            att_target = req.body.rev_idx;
            filepath = '/files/images/prodreview/';
        } else if (req.route.path === '/addQnaFile') {
            att_target_type = 'PRODUCTS_QNA';
            att_target = req.body.qa_idx;
            filepath = '/files/images/prodqna/';
        }

        console.log('att_target_type: ' + att_target_type)
        console.log('att_target: ' + att_target)
        
        for (let file of files) {

            // console.log('file::')
            // console.dir(file)

            const fileData = {
                att_target_type: att_target_type,
                att_target: att_target,// -> write폼에서 Value로 가져오도록 수정
                att_origin: file.originalname,
                att_filepath: `${filepath}${file.filename}`,
                att_ext: path.extname(file.originalname).substring(1),  // 확장자 추출
                // att_is_image: file.mimetype.startsWith('image/') ? 'Y' : 'N' //*원본
                att_is_image: 'Y'
                    /*현재 router쪽에서 확장자 검사를 하고있기 때문에
                        && flutter apk에서 파일을 전송하면 오는 파일의 mimetype이 application으로 시작하는 문제를
                        해결하기 위해 products에서는 강제로 'Y'값 주도록 처리
                    */
                
                //TODO : att_sort값. //여러개가 올라가면 어떻게 되지?
                //만약 미리보기상에서 체크박스 대표이미지로 지정을 체크했다면?
            };
            const insertedId = await productModel.insertAttachment(fileData);
            console.log("File added successfully with ID:", insertedId[0]);
        // res.json({ success: true, att_idx: lastInsertedIds });
        // 파일 정보 객체를 생성하고 배열에 추가합니다.
        insertedFiles.push({ idx: insertedId[0], path: fileData.att_filepath });
        }


        /*
        만약 req.route.path === '/addReviewFile' 라면
        wb_products_review 테이블의 rev_photo를 Y로 변경한다.
        */
        if(att_target_type === 'PRODUCTS_REVIEW' ) {
            const updateReviewItem = {
                rev_idx: att_target,
                rev_photo: 'Y'
            }
            const update_photo_chk = await productModel.updateProdReview(updateReviewItem)
            console.log(update_photo_chk);
        }

        res.json(insertedFiles);
    } catch (error) {
        console.error("Error adding attachment:", error);
    }
};

// 파일 삭제 라우트
productController.deleteAttachment = async(req, res) => {
    try{
        const att_target_type = req.body.att_target_type; //ex: PRODUCTS, PRODUCTS_REVIEW ...
        const att_path = req.body.att_path;//파일 경로
        const att_idx = req.body.att_idx; //att_idx
        const rev_idx = req.body.rev_idx ?? null;

        if(!att_idx || !att_target_type || !att_path) {
            return res.status(500).json({ error: "삭제에 필요한 데이터를 보내주세요." })
        }

        // 이미지 파일이 존재하면 삭제
        const path = require('path');
        const fs = require('fs');

        const imagePath = path.join(__dirname, '../../', att_path);
        console.log('imagePath: ' + imagePath);

        try {
            fs.unlinkSync(imagePath);
            console.log(`이전 이미지 파일 삭제: ${imagePath}`);
        } catch (error) {
            console.error(`이전 이미지 파일 삭제 실패: ${error}`);
        }


        console.log('att_idx:' + att_idx)

        const deletResult = await productModel.deleteAttachment(att_target_type, att_idx);

        console.log('deletResult' + deletResult);

        if (deletResult) {

        /*
        만약 req.route.path === '/addReviewFile' 라면
        wb_attach에 att_target_type && att_idx 를 가진 데이터가 있는지 확인하고
        하나도 없다면  
        wb_products_review 테이블의 rev_photo를 N로 변경한다.
        */
        if(att_target_type === 'PRODUCTS_REVIEW' ) {

            const findAttachment = await filesModel.getInfoByTypeNTarget(att_target_type, att_idx)

            console.log('findAttachment::')
            console.log(findAttachment)

            if(!findAttachment || findAttachment === null) {
                console.log('여기 오긴 오나요')
                const updateReviewItem = {
                    rev_idx: rev_idx,
                    rev_photo: 'N'
                }
                const update_photo_chk = await productModel.updateProdReview(updateReviewItem)
                console.log(update_photo_chk);
            };
        }

            return res.status(200).send('첨부파일이 성공적으로 삭제되었습니다.');
        } else {
            return res.status(500).json({ error: "첨부파일 삭제 실패." });
        }
    } catch(error) {
        console.error("Error deleting product att:", error);
        return res.status(500).json({ error: "product att delete err." })
    }
}

/* 추가 함수 -----------------------------------------------------*/
//멤버의 등급에 따른 판매가 할인율 계산
productController.getMemDiscountPrice = async (lev_discount, prd_price) => {
    try{
        const discountPrice = Math.floor(prd_price * (1 - lev_discount / 100));
        return discountPrice;
    } catch(error){
        console.error("Error fetching product:", error);
        return null;
    }

};


/* 상품 ------------------------------------------------- */

/*상품목록*/
productController.getProducts = async(req, res) => {
    try {
        const page = req.query.page || 0; // 페이지 쿼리가 없다면 기본값은 0입니다.
        const pagerow = req.query.pagerow || 10;

        // 데이터베이스에서 상품 목록을 조회
        const products = await productModel.getProducts(page, pagerow);
        //TODO: 카테고리 depth name도 가져올 수 있도록 처리 필요.

        //토탈 카운트 구하기
        const totalProducts = await productModel.getProducts(0, null);

        const totalCount = totalProducts.length;
        console.log('totalCount' + totalCount);
        // console.log(products)

        // 상품 목록 반환
        return res.json({totalCount: totalCount, products: products});
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ error: "Failed to fetch products" });
    }
};

/* 특정상품조회 */
productController.getProductById = async(req, res) => {
    try {
        const prd_idx = req.params.id;
        const mem_idx = req.loginUser? req.loginUser.id : 0;

        if(!prd_idx){
            return res.status(403).json({ error: "조회할 상품의 번호를 보내주세요." });
        }

        //상품 정보
        const product = await productModel.getProductById(prd_idx);

        if (!product || product === null) {
            return res.status(403).json({ error: "product에 관한 정보를 찾을 수 없습니다." });
        }

        if(mem_idx > 0){
            //멤버 정보
            const memInfo = await membersModel.getMemberById(mem_idx);

            if (!product || !memInfo || product === null || memInfo === null) {
                return res.status(403).json({ error: "product 혹은 로그인 한 member에 관한 정보를 찾을 수 없습니다." });
            }

            //멤버 등급에 따른 상품 할인가 구하기
            const memDiscountPrice = await productController.getMemDiscountPrice(memInfo.levelInfo.lev_discount, product.prd_price);

            if (!memDiscountPrice || memDiscountPrice === null) {
                return res.status(403).json({ error: "등급별 할인가를 구할 수 없습니다." });
            }

            product.prd_discount_price = memDiscountPrice;
        } else {
            product.prd_discount_price = null;
            product.prd_price = null;

        }


        return res.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({ error: "Failed to fetch product" });
    }
};

// 상품 등록 처리
productController.createProduct = async (req, res) => {
    const newProduct = {
        prd_status: 'T',
        reg_datetime: new Date(),
        prd_content : '',
        prd_mobile_content : '',
        prd_extra_info : '',
        prd_item_options : '',        
        // 기타 필드들은 DB에서 default 값으로 설정
    };

    try {
        const insertedprd_idx = await productModel.insertNewProduct(newProduct);
        res.json({ success: true, prd_idx: insertedprd_idx });
    } catch (error) {
        console.error("Error creating product:", error);
    }
};

//상품 복사하기
productController.copyProduct = async (req, res) => {
    try{
        const prd_idx = req.body.prd_idx;
        const mem_idx = req.loginUser? req.loginUser.id : null;
        //TODO: 로그인 된 회원의 auth가 super인지 확인 필요

        if(!mem_idx || mem_idx === null){
            return res.status(500).json({ error: "사용자 로그인 정보가 유효하지 않습니다" });
        }

        if(!prd_idx){
            return res.status(401).json({ error: "조회할 상품의 번호를 보내주세요." });
        }

        const originProd = await productModel.getProductById(prd_idx);
        if(!originProd || originProd === null){
            return res.status(404).json({ error: "상품 정보를 찾을 수 없습니다." });   
        }

        console.log('originProd::')
        console.log(originProd)

        const copyProduct = {
            prd_status: 'H',
            prd_sell_status: 'D',
            cat_id: originProd.cat_id,
            prd_sort: originProd.prd_sort,
            prd_type: originProd.prd_type,
            prd_sell_count: originProd.prd_sell_count,
            prd_use_options: originProd.prd_use_options,
            prd_price: originProd.prd_price,
            prd_cust_price: originProd.prd_cust_price,
            prd_name: `${originProd.prd_name} (복사)`,
            prd_maker: originProd.prd_maker,
            prd_origin: originProd.prd_origin,
            prd_brand: originProd.prd_brand,
            prd_model: originProd.prd_model,
            prd_summary: originProd.prd_summary,
            prd_thumbnail: 0,
            prd_content: originProd.prd_content,
            prd_mobile_content: originProd.prd_mobile_content,
            prd_extra_info: originProd.prd_extra_info,
            prd_item_group: originProd.prd_item_group,
            prd_item_options: originProd.prd_item_options,
            prd_sc_type: originProd.prd_sc_type,
            prd_sc_method: originProd.prd_sc_method,
            prd_sc_price: originProd.prd_sc_price,
            prd_sc_minimum: originProd.prd_sc_minimum,
            prd_sc_qty: originProd.prd_sc_qty,
            reg_user: mem_idx,
            reg_datetime: new Date(),
            prd_extra_1: originProd.prd_extra_1,
            prd_extra_2: originProd.prd_extra_2,
            prd_extra_3: originProd.prd_extra_3,
            prd_extra_4: originProd.prd_extra_4,
            prd_extra_5: originProd.prd_extra_5,
            prd_extra_6: originProd.prd_extra_6,
            prd_extra_7: originProd.prd_extra_7,
            prd_extra_8: originProd.prd_extra_8,
            prd_extra_9: originProd.prd_extra_9,
            prd_extra_10: originProd.prd_extra_10,        
            // 기타 필드들은 DB에서 default 값으로 설정
        };
        
        const copyIdx = await productModel.insertNewProduct(copyProduct);

        if(!copyIdx){
            return res.status(500).json({ error: '상품 복사 실패'});
        }

        console.log('copyIdx::' + copyIdx)

        return res.status(200).json({new_idx: copyIdx})
    } catch(error) {
        console.error("Error copying product:", error);
        return res.status(500).json({ error: error });
    }
}
/*
<front>
1. 상품 복사하기를 클릭한다.
2. 복사할 상품의 prd_idx를 보낸다.
<backend>
1. 요청 데이터의 prd_idx로 어떤 상품을 찾는 것인지 getProductById 모델로 확인한다.
2. 동일 데이터의 객체를 만들어서
3. insertNewProduct모델에 인자로 보내, 신규 상품 등록 처리한다. 
*/

// 상품 수정
productController.updateProduct = async (req, res) => {
    try{
        if (!req.body.prd_idx) {
            return res.status(400).send('상품 ID가 필요합니다.');
        }
        // 상품 데이터 업데이트
        let updatedData = req.body
        // att_idx 값을 가져옵니다.
        // const prd_thumbnail = await productModel.getAttachmentId(updatedData.prd_idx);
        // console.log(prd_thumbnail,1234);
        // updatedData.prd_thumbnail = prd_thumbnail  //att_idx 값
    
        const updateResult = await productModel.updateProduct(updatedData);
        if (updateResult) {
            res.json({ success: true, message: '상품 정보가 성공적으로 수정되었습니다.' });
        } else {
            res.status(500).send('상품 수정 중 에러 발생');
        }
    }catch(error){
        console.error("Error updating product:", error);
        return res.status(500).json({ error: "product update err." });
    }
};

//상품삭제
productController.deleteProduct = async(req, res) => {
    try {
        const prd_idx = req.body.prd_idx;
        if (!prd_idx) {
            return res.status(400).send('상품 ID가 필요합니다.');
        }
        const deleted = await productModel.deleteProduct(prd_idx);

        if (!deleted) {
            return res.status(404).json({ error: "Model Error" });
        }
        res.json({ success: true, message: '상품 정보가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ error: "product delete err." });
    }
};

/* 상품 리뷰 ---------------------------------------- */

//상품 리뷰 개별 불러오기
productController.getReviewDetail = async(req, res) => {
    try{
        const rev_idx = req.params.rev_idx;

        const revInfo = await productModel.getReviewDetail(rev_idx);

        if(!revInfo){
            return res.status(500).json({ error: "리뷰를 찾을 수 없습니다." });
        }
        
        return res.status(200).json(revInfo)
    } catch (error) {
        console.error("Error finding prd review:", error);
        return res.status(500).json({ error: "Failed to find prd review" });
    }
}

//상품 리뷰 목록
productController.getProdReviewList = async(req, res) => {
    try{
        const prd_idx = req.params.prd_idx;
        const page = req.query.page || 0; // 페이지 쿼리가 없다면 기본값은 0입니다.
        const keyword = req.query.keyword || 'latest';

        console.log('keyword :: ' + keyword);

        if(!prd_idx){
            return res.status(401).json({ error: "조회할 상품의 번호를 보내주세요." });
        }

        //리뷰 리스트 기본 가져오기
        const reviewList = await productModel.getProdReviewList(prd_idx, page, keyword);

        //리뷰 리스트 토탈 카운트용
        const reviewTotal = await productModel.getProdReviewList(prd_idx, 0);
        const totalReviewCount = reviewTotal.length;

        //평점 평균 구하기
        let totalScore = 0;
        for (let i = 0; i < totalReviewCount; i++) {
            totalScore += parseFloat(reviewTotal[i].rev_score);
        }
        
        const averageScore = parseFloat((totalScore / totalReviewCount).toFixed(1));

        // console.log('averageScore: ' + averageScore);

        //베스트 리뷰만 가져오기
        const reviewBests = await productModel.getProdReviewBests(prd_idx);

        if(!reviewList || !reviewBests){
            return res.status(500).json({ error: "리뷰 찾기 도중 오류 발생!" });
        }

        // console.log('totalcount: ' + reviewTotal.length)

        return res.status(200).json({ totalcount: totalReviewCount, averageScore: averageScore, reviewBests: reviewBests, reviewList: reviewList});
    } catch (error) {
        console.error("Error fetching product review list:", error);
        return res.status(500).json({ error: "Failed to fetch product review list" });
    }
}

//상품 리뷰 수정하기
productController.updateProdReview = async(req, res) => {
    try {
        const updateReviewItem = req.body;

        //실제로 있는 글인지 검증
        const checkInfoExist = await productModel.getReviewDetail(updateReviewItem.rev_idx);

        if(checkInfoExist == null) {
            return res.status(500).json({ error: "업데이트할 리뷰가 존재하지 않습니다." });
        }
        if(updateReviewItem.mem_idx != checkInfoExist.mem_idx || !updateReviewItem.mem_idx){
            return res.status(401).json({ error: "자신이 작성한 글만 수정 가능합니다." });
        }

        //데이터 업데이트
        const updatedReviewItem = await productModel.updateProdReview(updateReviewItem);
        console.log('updatedReviewItem :')
        console.log(updatedReviewItem)

        if (!updatedReviewItem) {
            return res.status(404).json({ error: "review item not found" });
        }
        
        console.log(`${updatedReviewItem.rev_idx}게시글 수정 성공`)

        return res.status(200).json(updatedReviewItem);
    } catch (error) {
        console.error("Error updating review:", error);
        return res.status(500).json({ error: "Failed to update review" });
    }
}

//상품 리뷰 삭제하기
productController.deleteReview = async(req, res) => {
    try{
        const deleteId = req.body.rev_idx;
        const deleteMem = req.body.mem_idx;

        if(!deleteId) {
            return res.status(401).json({error: '삭제할 리뷰 번호를 보내주세요.'});
        }

        // 글이 실존하는지 || status 상태가 Y인지 검증 ------------------------------
        const deleteFileColumn = await productModel.getReviewDetail(deleteId);

        if(deleteFileColumn.mem_idx != deleteFileColumn.deleteMem || !deleteMem){
            return res.status(401).json({ error: "자신이 작성한 글만 수정 가능합니다." });
        }

        if (!deleteFileColumn) {
            return res.status(500).json({ error: `선택한 리뷰는 존재하지 않습니다.` })
        } else {
            console.log(`리뷰 상세 글 확인!`)
        }

        if(deleteFileColumn.attach_path && deleteFileColumn.attach_path.length > 0) {
            let attachList = deleteFileColumn.attach_path;
            for(let i = 0; i < attachList.length; i++){
                const path = require('path');
                const fs = require('fs');

                // 이미지 파일이 존재하면 삭제
                const imagePath = path.join(__dirname, '../../', attachList[i].att_filepath);
                console.log('imagePath: ' + imagePath);

                try {
                    fs.unlinkSync(imagePath);
                    console.log(`이전 이미지 파일 삭제: ${imagePath}`);
                } catch (error) {
                    console.error(`이전 이미지 파일 삭제 실패: ${error}`);
                }

                //wb_attach에서 삭제
                const deletResult = await productModel.deleteAttachment('PRODUCTS_REVIEW', attachList[i].att_idx);
                console.log('deletResult' + deletResult);
            }
        }

        const deleteReview = await productModel.deleteReview(deleteId, deleteMem);

        if(!deleteReview || deleteReview === null){
            return res.status(500).json({ error: `리뷰 삭제 실패` })
        }
        
        return res.status(200).json(deleteReview);
    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({ error: "Failed to delete review" });
    }
}


/* 상품 문의 ---------------------------------------- */
//상품 문의 작성하기
productController.makeQa = async(req,res) =>{
    try{
        const qa = req.body
        console.log(qa)
        if(!qa){
            return res.status(500).json({error : '등록할 상품문의 데이터가 없습니다.'})
        }
        let qaPost = await productModel.makeQa(qa);
        return res.status(200).json(qaPost);
    }catch (e){
        console.error(e);
        return res.status(500).json({error : 'Failed to post qa'})
    }
}

//상품 문의 목록
productController.getProdQnaList = async(req, res) => {
    try{
        const prd_idx = req.params.prd_idx;
        const page = req.query.page ? req.query.page : 0; // 페이지 쿼리가 없다면 기본값은 0입니다.

        let mem_idx = req.loginUser? req.loginUser.id : 0 ;

        if(!prd_idx){
            return res.status(401).json({ error: "조회할 상품의 번호를 보내주세요." });
        }

        const qnaList= await productModel.getProdQnaList(mem_idx, prd_idx, page);
        const qnaTotal = await productModel.getProdQnaList(mem_idx, prd_idx, 0);
        const qnaTotalCount = qnaTotal.length;

        console.log('qnaList')
        console.log(qnaList)

        if(!qnaList){
            return res.status(500).json({ error: "리뷰 찾기 도중 오류 발생!" });
        }

        return res.status(200).json({qnaTotalCount: qnaTotalCount, qnaList: qnaList});
    } catch (error) {
        console.error("Error fetching product review list:", error);
        return res.status(500).json({ error: "Failed to fetch product review list" });
    }
}

//상품 문의 개별 불러오기
productController.getQnaDetail = async(req, res) => {
    try{
        const qa_idx = req.params.qa_idx;

        const qnaInfo = await productModel.getQnaDetail(qa_idx);

        if(!qnaInfo){
            return res.status(500).json({ error: "리뷰를 찾을 수 없습니다." });
        }
        
        return res.status(200).json(qnaInfo)
    } catch (error) {
        console.error("Error finding prd review:", error);
        return res.status(500).json({ error: "Failed to find prd review" });
    }
}

//상품 문의 수정하기
productController.updateProdQna = async(req, res) => {
    try {
        const updateQnaItem = req.body;

        //실제로 있는 글인지 검증
        const checkInfoExist = await productModel.getQnaDetail(updateQnaItem.qa_idx);

        if(checkInfoExist == null) {
            return res.status(500).json({ error: "업데이트할 문의가 존재하지 않습니다." });
        }
        if(updateQnaItem.mem_idx != checkInfoExist.mem_idx || !updateQnaItem.mem_idx){
            return res.status(401).json({ error: "자신이 작성한 글만 수정 가능합니다." });
        }

        //데이터 업데이트
        const updatedQnaItem = await productModel.updateProdQna(updateQnaItem);
        console.log('updatedQnaItem :')
        console.log(updatedQnaItem)

        if (!updatedQnaItem) {
            return res.status(404).json({ error: "qna item not found" });
        }
        
        console.log(`${updatedQnaItem.qa_idx}게시글 수정 성공`)

        return res.status(200).json(updatedQnaItem);
    } catch (error) {
        console.error("Error updating qna:", error);
        return res.status(500).json({ error: "Failed to update qna" });
    }
}

//상품 문의 삭제하기
productController.deleteQna = async(req, res) => {
    try{
        const deleteId = req.body.qa_idx;
        const deleteMem = req.body.mem_idx;

        if(!deleteId) {
            return res.status(401).json({error: '삭제할 문의 번호를 보내주세요.'});
        }

        // 글이 실존하는지 || status 상태가 Y인지 검증 ------------------------------
        const deleteFileColumn = await productModel.getQnaDetail(deleteId);

        if(deleteFileColumn.mem_idx != deleteFileColumn.deleteMem || !deleteMem){
            return res.status(401).json({ error: "자신이 작성한 글만 수정 가능합니다." });
        }

        if (!deleteFileColumn) {
            return res.status(500).json({ error: `선택한 문의는 존재하지 않습니다.` })
        } else {
            console.log(`문의 상세 글 확인!`)
        }

        if(deleteFileColumn.attach_path && deleteFileColumn.attach_path.length > 0) {
            let attachList = deleteFileColumn.attach_path;
            for(let i = 0; i < attachList.length; i++){
                const path = require('path');
                const fs = require('fs');

                // 이미지 파일이 존재하면 삭제
                const imagePath = path.join(__dirname, '../../', attachList[i].att_filepath);
                console.log('imagePath: ' + imagePath);

                try {
                    fs.unlinkSync(imagePath);
                    console.log(`이전 이미지 파일 삭제: ${imagePath}`);
                } catch (error) {
                    console.error(`이전 이미지 파일 삭제 실패: ${error}`);
                }

                //wb_attach에서 삭제
                const deletResult = await productModel.deleteAttachment('PRODUCTS_QNA', attachList[i].att_idx);
                console.log('deletResult' + deletResult);
            }
        }

        const deleteReview = await productModel.deleteQna(deleteId, deleteMem);

        if(!deleteReview || deleteReview === null){
            return res.status(500).json({ error: `문의 삭제 실패` })
        }
        
        return res.status(200).json(deleteReview);
    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({ error: "Failed to delete review" });
    }
}


/**상품 옵션 ------------------------------------------*/
//옵션 재고관리 컬럼 생성 
productController.makeOption = async (req,res) =>{
    try{
        let opData = req.body;
        const opList = await productModel.makeOption(opData);
        return res.json(opList);
    }catch (error){
        console.error("옵션 생성 에러",error)
        return res.status(500).json({error:"Failed to fetch option POST"})
    }
}

//옵션 GET
productController.getOptions = async (req, res) => {
    try { //옵션재고쪽을 보는 모델함수 호출, 필터 : 상품분류, 판매상태, 표시상태, 상품명 검색
      const {cat_id, prd_sell_status, prd_status, stxt} = req.query;
      const result = await productModel.getOptions(cat_id, prd_sell_status, prd_status, stxt)
      return res.json(result);
    } catch (e) {
      console.error(e);
      return res.status(500).json({error: "Failed to fetch option stocks"});
    }
  }

//옵션재고수정
productController.editOptStocks = async (req, res) => {
        //TODO: 옵션 명 수정 시 어떻게 할 것인지 생각해야 함
try {
    const stocks = req.body;

    if (!stocks || !stocks.opt_idx) {
        return res.status(500).json({error: "변경할 옵션 데이터가 없습니다."});
    }

    const optionExist = await productModel.getOptDetail(stocks.opt_idx);

    if(!optionExist){
        return res.status(503).json({error: "존재하지 않는 옵션입니다."});
    }

    const stData = await productModel.editOptStocks(stocks);

    console.log('stData::')
    console.log(stData)

    if(!stData){
        return res.status(503).json({error: "옵션 수정 실패"});
    }

    return res.status(200).json(stData);
} catch (e) {
    console.error(e);
    return res.status(500).json({error: "Failed to fetch option stocks"});
}
}

/**진열장 List GET*/
productController.getDisplayList = async (req,res) => {
    try{
        const displayList = await productModel.getDisplayList();
        return res.json(displayList);
    }catch (error){
        console.error("진열장 목록 GET 에러",error)
        return res.status(500).json({error:"Failed to fetch 진열장 목록"})
    }
}
//진열장 show
productController.getDisplay = async(req,res) => {
    try {
        const displayId = req.params.id;
        const page = req.query.page || 0; // 페이지 쿼리가 없다면 기본값은 0입니다.
        const mem_idx = req.loginUser? req.loginUser.id : 0;

        if(!displayId){
            return res.status(403).json({ error: "조회할 진열장의 번호를 보내주세요." });
        }

        //DB에서 상품 목록 조회
        const products = await productModel.getDisplay(displayId, page); // 페이지 쿼리를 모델로 전달합니다.

        if (!products || products === null) {
            return res.status(403).json({ error: "product list에 관한 정보를 찾을 수 없습니다." });
        }

        if(mem_idx > 0){
            //멤버 정보
                const memInfo = await membersModel.getMemberById(mem_idx);
    
                if (!products || !memInfo || products === null || memInfo === null) {
                    return res.status(403).json({ error: "product list 혹은 로그인 한 member에 관한 정보를 찾을 수 없습니다." });
                }
    
                for(let i = 0; i < products.length; i++){
                        //멤버 등급에 따른 상품 할인가 구하기
                    const memDiscountPrice = await productController.getMemDiscountPrice(memInfo.levelInfo.lev_discount, products[i].prd_price);
    
                    if (!memDiscountPrice || memDiscountPrice === null) {
                        return res.status(403).json({ error: "등급별 할인가를 구할 수 없습니다." });
                    }
    
                    products[i].prd_discount_price = memDiscountPrice;
                }
            } else {
                for(let i = 0; i < products.length; i++){
                    products[i].prd_discount_price = null;
                    products[i].prd_price = null;
                }
            }

        //상품 리스트 반환
        return res.json(products)
    } catch(error){
        console.error("진열장 아이템 에러",error)
        return res.status(500).json({ error: "Failed to fetch 진열장 아이템" });
    }
}
// 진열장 바깥 아이템 컨트롤러
productController.getOutsideDisplay = async(req,res) => {
    try {
        const displayId = req.params.id;
        const page = req.query.page || 0; // 페이지 쿼리가 없다면 기본값은 0입니다.

        //DB에서 상품 목록 조회
        const products = await productModel.getOutsideDisplay(displayId, page); // 페이지 쿼리를 모델로 전달합니다.

        //상품 리스트 반환
        return res.json(products)
    } catch(error){
        console.error("진열장 바깥 아이템 에러",error)
        return res.status(500).json({ error: "Failed to fetch 진열장 바깥 아이템" });
    }
}
//진열장 add
productController.createDisplay = async(req,res) =>{
    const newDisply= {
        dsp_status : 'Y',
        dsp_key : req.body.dsp_key,
        dsp_title : req.body.dsp_title,
        // 기타 필드들은 DB에서 default 값으로 설정
    };
    try{
        const insertedDisplayId = await productModel.createDisplay(newDisply);
        res.json({ success: true, dsp_id: insertedDisplayId });
    }catch(error){
        console.error(error)
        return res.status(500).json({ error: "Failed to add 진열장" });
    }
}
//진열장 수정
productController.updateDisplay = async(req,res) => {
    const dsp_id = req.body.dsp_id;
    if(!dsp_id){
        return res.status(400).send('진열장 ID가 필요합니다.');
    }
    const updatedData = {
        dsp_status : req.body.dsp_status,
        dsp_title : req.body.dsp_title,
    };
    const updateResult = await productModel.updateDisplay(dsp_id,updatedData);
    if (updateResult) {
        res.json({ success: true, message: '진열장 정보가 성공적으로 수정되었습니다.' });
    } else {
        res.status(500).send('진열장 수정 중 에러 발생');
    }
}
//진열장 삭제
productController.deleteDisplay = async(req,res) => {
    const dsp_id = req.body.dsp_id;
    if(!dsp_id){
        return res.status(400).send('진열장 ID가 필요합니다.');
    }
    const updateResult = await productModel.deleteDisplay(dsp_id);
    if (updateResult) {
        res.json({ success: true, message: '진열장 정보가 삭제되었습니다.' });
    } else {
        res.status(500).send('진열장 삭제 중 에러 발생');
    }
}
//진열장 아이템 추가
productController.addItem = async(req,res) => {
    const newItem= {
        dsp_idx : req.body.dsp_idx,
        prd_idx : req.body.prd_idx,
        // 기타 필드들은 DB에서 default 값으로 설정
    };
    try{
        const dspItemData = await productModel.addItem(newItem);
        res.json(dspItemData)
    } catch (error) {
        console.error(error);
    }
};
//진열장 아이템 삭제
productController.dropItem = async(req, res) => {
    const item = {
        dsp_idx : req.body.dsp_idx,
        prd_idx : req.body.prd_idx
    };
    try {
        const deletedItemCount = await productModel.dropItem(item);
        res.json(item);
    } catch (error) {
        console.error(error);
    }
};
/**
*찜 목록 가져오기 */
productController.getWishList = async(req,res) => {
    try{
        const mem_idx = req.loginUser? req.loginUser.id : null;

        if(!mem_idx || mem_idx === null){
            return res.status(500).json({ error: "사용자 로그인 정보가 유효하지 않습니다" });
        }

        const wishList = await productModel.getWishList(mem_idx);

        if(!wishList) {
            return res.status(500).json({error: "Failed to get wish list"});
        }

        return res.status(200).json(wishList)
    } catch (error){
        console.error(error);
        return res.status(500).json({ error: "Failed to get wish list" });
    }
}

//찜 여부 확인
productController.getWishCheck = async(req,res) => {
    try{
        const mem_idx = req.loginUser? req.loginUser.id : null ;
        const prd_idx = req.params.prd_idx
        
        if(!mem_idx || mem_idx === null || !prd_idx || prd_idx === null){
            return res.status(401).json({error: "체크에 필요한 정보를 보내주세요."});
        }

        //존재하는 찜 정보인지 확인
        const chkExistWish = await productModel.getWishCheck(mem_idx, prd_idx);

        if(!chkExistWish){
            return res.status(200).json({check: false, message: "찜 정보가 존재하지 않습니다."});
        }

        return res.status(200).json({check: true, message: "회원님이 찜한 상품입니다."})
    } catch(error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to get wish check" });        
    }
}

//찜하기
productController.addWish = async(req,res) => {
    try {
        const mem_idx = req.loginUser? req.loginUser.id : null ;
        const prd_idx = req.body.prd_idx

        if(!mem_idx || mem_idx === null || !prd_idx || prd_idx === null){
            return res.status(401).json({error: "찜하기에 필요한 정보를 보내주세요."});
        }

        //실제 존재하는 상품인지 확인
        const prdExist = await productModel.getProductById(prd_idx);

        if(!prdExist || prdExist === null){
            return res.status(500).json({error: "존재하지 않는 상품입니다."}); 
        }

        const newWishData = await productModel.addWish(mem_idx, prd_idx)

        console.log('newWishData::')
        console.log(newWishData)

        if(newWishData.wish_idx){
            return res.status(200).json({ message: '이미 찜한 상품입니다.', add_success: false });
        }
        
        return res.status(200).json({ message: '찜하기 성공.', add_success: true })
    }catch (error){
        console.error(error);
        return res.status(500).json({ error: "Failed to get wish list" });
    }
}


//찜 삭제
productController.dropWish =  async(req,res) => {
    try {

        const mem_idx = req.loginUser? req.loginUser.id : null;
        const prd_idx = req.body.prd_idx

        if(!mem_idx || mem_idx === null || !prd_idx || prd_idx === null){
            return res.status(401).json({error: "찜 삭제에 필요한 정보를 보내주세요."});
        }

        //존재하는 찜 정보인지 확인
        const chkExistWish = await productModel.getWishCheck(mem_idx, prd_idx);

        if(!chkExistWish){
            return res.status(500).json({error: "찜 정보가 존재하지 않습니다."});
        }

        const deleteWish = await productModel.dropWish(mem_idx, prd_idx)

        if(!deleteWish){
            return res.status(500).json({ error: "Failed to delete wish" });
        }

        return res.status(200).json({
            mem_idx: mem_idx,
            prd_idx: prd_idx,
            message: '찜 삭제 성공!'
        })
    }catch (error){
        console.error(error)
        return res.status(500).json({ error: "Failed to delete wish" });
    }
}


/** 상품 카테고리* --------------------------------------------------------------- */
//카테고리 추가
productController.addCat = async (req, res) => {
    try {
        const catData = req.body;
        if (catData == null) {
            return res.status(500).json({ error: '등록할 카테고리 데이터가 없습니다.' });
        }
        console.log(req.body, '000')
        // 파일 업로드 경로 생성
        const iconFilePath = req.file ? `/files/images/products/category${req.file.filename}` : '';
        console.log(req.file, 111)
        catData.icon_filepath = iconFilePath;
        console.log(catData, 222)
        // 카테고리 등록
        const newCategoryId = await productModel.addCategory(catData);
        console.log(newCategoryId, 333);
        // 생성 성공 메세지 반환
        return res.status(200).json({ message: `${newCategoryId} 카테고리가 생성되었습니다.` });
    } catch (error) {
        console.error('Error add category:', error);
        return res.status(500).json({ error: 'Failed to add category' });
    }
}

//상품 리뷰 작성하기
/**리뷰 TODO : 라우터(파일) 등의 처리*/
productController.postReview = async (req,res) => {
    try{
        const rev = req.body
        console.log(rev)
        if (!rev) {
            return res.status(500).json({error : '등록할 리뷰 데이터가 없습니다.'})
        }
        let revPost = await productModel.postReview(rev);
        return res.status(200).json({message : `${revPost}리뷰가 등록되었습니다.`})
    }catch (error){
        console.error('Error post review:', error);
        return res.status(500).json({error : 'Failed to post review'});
    }
}

/** 객체 내보내기*/
module.exports = productController
