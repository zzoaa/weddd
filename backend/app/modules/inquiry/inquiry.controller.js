const inquiryModel = loadModule('inquiry', 'model')
loadModule('products', 'model')
const inquiryController = {};
const path = require('path');

const productModel = loadModule('products', 'model');

/*파일 추가 라우트 */
inquiryController.addAttachment = async (req, res) => {
    try {
        let insertedFiles  = [];
        const files = req.files;
        console.dir(files);
        let att_target_type;
        let att_target;
        let att_filepath;
        console.log('req.route.path' + req.route.path);
        if (req.route.path === '/addAttachment') {
            att_target_type = 'INQUIRY';
            att_target = req.body.cst_id; //PK 값
            att_filepath = `/files/images/inquiry/`
        }

        for (let file of files) {
            const fileData = {
                att_target_type: att_target_type,
                att_target: att_target,// -> write폼에서 Value로 가져오도록 수정
                att_origin: file.originalname,
                att_filepath: `${att_filepath}${file.filename}`,
                att_ext: path.extname(file.originalname).substring(1), // 확장자 추출
                // att_is_image: file.mimetype.startsWith('image/') ? 'Y' : 'N'
                att_is_image: 'Y' 
            };
            const insertedId = await productModel.insertAttachment(fileData);
            console.log("File added successfully with ID:", insertedId[0]);
        // 파일 정보 객체를 생성하고 배열에 추가합니다.
        insertedFiles.push({ idx: insertedId[0], path: fileData.att_filepath });
        }
        res.json(insertedFiles);
    } catch (error) {
        console.error("Error adding attachment:", error);
    }
};

// 파일 삭제 라우트
inquiryController.deleteAttachment = async(req, res) => {
    try{
        const att_target_type = req.body.target_type; //ex: PRODUCTS, PRODUCTS_REVIEW ...
        const att_path = req.body.att_path;//파일 경로
        const att_idx = req.body.att_idx; //att_idx

        if(!att_idx || !att_target_type) {
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
            return res.status(200).send('첨부파일이 성공적으로 삭제되었습니다.');
        } else {
            return res.status(500).json({ error: "첨부파일 삭제 실패." });
        }
    } catch(error) {
        console.error("Error deleting product att:", error);
        return res.status(500).json({ error: "product att delete err." })
    }
}

/* ------------------------------ */


// 모든 문의내역 조회
inquiryController.getConsts = async (req, res) => {
    try {
        const mem_id = req.body.mem_id;
        const posts = await inquiryModel.getConsts(mem_id);
    if (!posts) {
        return res.status(200).json({ message: "문의 내역이 없습니다" });
    }
        return res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching inquiries:", error);
        return res.status(500).json({ error: "Failed to fetch inquiries" });
    }
};

//문의글 개별 불러오기
inquiryController.getConstDetails = async(req, res) => {
    try{
        const cst_id = req.body.cst_id;
        
        if(!cst_id) {
            return res.status(200).json({ message: "상세글 PK를 전송해주세요." });
        }

        const cstInfo = await inquiryModel.getConstDetails(cst_id);

        console.log('cstInfo::')
        console.log(cstInfo)
        
        if(!cstInfo){
            return res.status(500).json({ error: "문의글 상세 데이터를 찾을 수 없습니다." });  
        }

        return res.status(200).json(cstInfo)
    }catch (e) {
        console.error("Error fetching inquiry:", error);
        return res.status(500).json({ error: "Failed to fetch inquiry" });  
    }
 }

// 문의글 쓰기
inquiryController.addConst = async (req, res) => {
    try {
        const {cst_title, cat_id, cst_content, mem_id} = req.body;

        if (!req.body) {
            return res.status(400).json({ error: "내용이 없습니다." });
        }
        const post = await inquiryModel.addConst(cst_title, cat_id, cst_content, mem_id);
        if (!post) {
            return res.status(500).json({ error: "문의 데이터 오류" });
        }
        return res.status(200).json(post);
    } catch (error) {
        console.error("Error adding post:", error);
        return res.status(500).json({ error: "문의 추가 실패" });
    }
};
//공지글 수정하기
inquiryController.editConst = async (req, res) => {
    try {
        const {mem_id, cst_id, cst_title, cst_content} = req.body;
        const updated = await inquiryModel.editConst(mem_id, cst_id, cst_title, cst_content);

        if (!updated) {
            return res.status(500).json({ error: "업데이트 데이터 없음" });
        }
        if (updated === "super") {
            return res.json({ success: false, message: '답변완료 문의글은 수정할 수 없습니다.' });
        } else if(updated) {
        return res.json({"success": true, "message": "Post updated successfully!"}
        )}else {
            throw new Error("Failed to edit const in database");
        }
    } catch (error) {
        console.error("Error editing post:", error);
        return res.status(500).json({ error: "Failed to edit post" });
    }
};
//문의글 삭제하기v
inquiryController.deleteConst = async (req, res) => {
    try {
        const {mem_idx, cst_id} = req.body;

        if(!mem_idx || !cst_id) {
            return res.status(401).json({error: '삭제에 필요한 정보를 보내주세요.'});
        }


        // 글이 실존하는지 || status 상태가 Y인지 검증 ------------------------------
        const deleteFileColumn = await inquiryModel.getConstDetails(cst_id);

        if (!deleteFileColumn) {
            return res.status(500).json({ error: `선택한 상담은 존재하지 않습니다.` })
        } else {
            console.log(`상담 상세 글 확인!`)
        }

        const result = await inquiryModel.deleteConst(mem_idx, cst_id);

        if (result === "super") {
            return res.json({ success: false, message: '답변완료 문의글은 삭제할 수 없습니다.' });
        } else if (result) {

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
                    const deletResult = await productModel.deleteAttachment('INQUIRY', attachList[i].att_idx);
                    console.log('deletResult' + deletResult);
                }
            }

            return res.json({ success: true, message: "문의글 삭제 완료" });
        } else {
            throw new Error("Failed to delete const in database");
        }
    } catch (error) {
        console.error("Error deleting post:", error);
        return res.status(500).json({ success: false, message: '삭제 도중 에러 발생' });
    }
};

//문의 카테고리 목록 불러오기
inquiryController.getCatList = async (req, res) => {
    try {
        const categoryList = await inquiryModel.getCatList()

        return res.status(200).json(categoryList)
    } catch (error) {
        console.error("Error fetching inquiries:", error);
        return res.status(500).json({ error: "Failed to fetch inquiries" });
    }
};

module.exports = inquiryController;
