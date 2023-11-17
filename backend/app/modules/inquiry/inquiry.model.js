const inquiryModel = {};
const db = database();


// 문의 작성하기(쓰기)v
inquiryModel.addConst = async (cst_title, cat_id, cst_content, mem_id) => {
    const db = database();

    let post = null;
    await db('wb_inquiry').insert({
        mem_idx : mem_id,
        cst_title: cst_title,
        cat_id: cat_id,
        cst_content: cst_content,
        cst_regtime: db.fn.now()
    })
    .then((insertedId) => {
        post = insertedId;
    })
    .catch((e) => {
        console.log(e);
        post = null;
    });
    return await inquiryModel.getConstDetail(post[0]);
};

//문의글 수정하기 (PUT)
inquiryModel.editConst = async (mem_id, cst_id, cst_title, cst_content) => {
    const db = database();    
    let result = null;
    try {
        const inquiry = await db('wb_inquiry')
            .where('cst_name', mem_id)
            .andWhere('cst_id', cst_id)
            .first();
            if (inquiry.cst_step === "답변완료") {
                console.error("답변완료 문의글은 수정할 수 없습니다.");
                return "super";
            }
            const editPost = await db('wb_inquiry')
                .where('cst_name', mem_id)
                .andWhere('cst_id', cst_id)
                .update({
                    cst_title: cst_title,
                    cst_content: cst_content,
                })
            return editPost;
    }catch (error) {
        console.error("Failed to edit inquiry:", error);
        return false;
    }
};
// 문의 목록 가져오기v
inquiryModel.getConsts = async (mem_id) => {
    const db = database();
    let post = [];
    await db
        .select('N.*', 'M.mem_nickname')
        .from('wb_inquiry AS N')
        .join('wb_member AS M', 'N.mem_idx', 'M.mem_idx') // JOIN을 추가합니다.
        .where('N.mem_idx', mem_id)
        .whereNot('N.cst_status', 'N')//추후 필드 교체
        .then(async rows => {
            if (rows.length > 0) {
                for (let row of rows) {
                    if (row.cst_step === '답변완료') {
                        const answer = await db
                            .select('*')
                            .from('wb_inquiry_answer')
                            .where('cst_id', row.cst_id)
                            .first();
                        row.answer = answer;
                    }
                }
                post = rows;
            } else {
                post = null;
            }
        })
        .catch(e => {
            console.error(e);
            post = null;
        });

        // 상품 정보가 있을 경우에만 추가 정보 가져오기
        if (post) {
            for(let i = 0; i < post.length; i++) {
                // 이미지 정보를 가져옵니다.
                await db
                .select('ATT.att_filepath as thumbnail_path', 'ATT.att_idx')
                .from('wb_attach AS ATT')
                .join('wb_inquiry AS I', 'I.cst_id', '=', 'ATT.att_target')
                .where('ATT.att_is_image', 'Y')
                .where('ATT.att_target_type', 'INQUIRY')
                .where('ATT.att_target', post[i].cst_id)
                .then(rows => {
                    console.log('Rows: ', rows);  // 추가된 코드
                    if (rows.length > 0) {
                        // 이미지 정보가 하나 이상 존재할 경우
                        post[i].thumbnail = [
                            { att_idx: rows[0].att_idx,
                                att_filepath: rows[0].thumbnail_path }
                        ];
                    } else {
                        post[i].thumbnail = null;
                    }
                })
                .catch((e) => {
                    console.log(e);
                });    
            }
        }
    return post;
};

//문의글 개별 불러오기
inquiryModel.getConstDetails = async (cst_id) => {
    let cstById = null;

    await db
        .select('I.*', 'M.mem_nickname')
        .from('wb_inquiry AS I')
        .where('cst_id', '=', cst_id)
        .andWhere('cst_status', '=' ,'Y')
        .join('wb_member AS M', 'I.mem_idx', 'M.mem_idx')
        .limit(1)
        .then(async rows => {
            cstById = (rows.length > 0) ? rows[0] : [];

                if (rows[0].cst_step === '답변완료') {
                    // 2. 두 번째 쿼리: wb_inquiry_answer에서 답변 데이터 가져오기
                    const answerData = await db
                            .select('*')
                            .from('wb_inquiry_answer')
                            .where('cst_id', rows[0].cst_id)
                            .first();
                    cstById.answer = answerData;

                } else {
                    cstById.answer = null;
                }     
        })
        .catch((e) => {
            console.log(e);
            cstById = null;
        });

    // 상품 정보가 있을 경우에만 추가 정보 가져오기
    if (cstById) {
        // 이미지 정보를 가져옵니다.

        await db
        .select('ATT.att_filepath as thumbnail_path', 'ATT.att_idx')
        .from('wb_attach AS ATT')
        .join('wb_inquiry AS I', 'I.cst_id', '=', 'ATT.att_target')
        .where('ATT.att_is_image', 'Y')
        .where('ATT.att_target_type', 'INQUIRY')
        .where('ATT.att_target', cst_id)
        .then(rows => {
            console.log('Rows: ', rows);  // 추가된 코드
            if (rows.length > 0) {
                // 이미지 정보가 하나 이상 존재할 경우

                cstById.thumbnail = [
                    { att_idx: rows[0].att_idx,
                        att_filepath: rows[0].thumbnail_path }
                ];
                
                cstById.attach_path = rows.map(row => ({
                    att_idx: row.att_idx,
                    att_filepath: row.thumbnail_path
                }));
            } else {
                cstById.thumbnail = null;
                cstById.attach_path = null;
            }
        })
        .catch((e) => {
            console.log(e);
        });   
    } 

    return cstById;
}

//문의 상세 가져오기
inquiryModel.getConstDetail = async(cst_id) => {
    const db = database();
    let cstById = null;

    await db
        .select('I.*')
        .from('wb_inquiry AS I')
        .where('cst_id', '=', cst_id)
        .andWhere('cst_status', '=' ,'Y')
        .limit(1)
        .then(rows => {
            cstById = (rows.length > 0) ? rows[0] : [];
        })
        .catch((e) => {
            console.log(e);
            cstById = null;
        });
        
    return cstById;
}

//문의글 지우기v
inquiryModel.deleteConst = async (mem_idx, cst_id) => {
    try {
        const inquiry = await db('wb_inquiry')
            .where('mem_idx', mem_idx)
            .andWhere('cst_id', cst_id)
            .first(); // 첫 번째 결과만 가져옵니다.
        // 만약 cst_step 값이 "답변완료"인 경우, 삭제를 중단하고 false를 반환합니다.
        if (inquiry.cst_step === "답변완료") {
            console.error("답변완료 문의글은 삭제할 수 없습니다.");
            return "super";
        }
        // 그렇지 않은 경우, cst_status 값을 'N'으로 업데이트합니다.
        const deletePost = await db('wb_inquiry')
            .where('mem_idx', mem_idx)
            .andWhere('cst_id', cst_id)
            .update({cst_status: 'N' });
        return deletePost;
    } catch (error) {
        console.error("Failed to delete inquiry:", error);
        return false;
    }
};

//문의 카테고리 목록 불러오기
inquiryModel.getCatList = async () => {
    let cartegoryList = null;

    await db
    .select('*')
    .from('wb_inquiry_category')
    .then(rows => {
        cartegoryList = (rows.length > 0) ? rows : [];
    })
    .catch((e) => {
        console.log(e);
        cartegoryList = null;
    });

    return cartegoryList;
}

module.exports = inquiryModel;
