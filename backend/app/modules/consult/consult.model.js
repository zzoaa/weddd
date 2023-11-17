const consultModel = {};
const db = database();


// 문의 작성하기(쓰기)v
consultModel.addConst = async (cst_title, cst_content, mem_idx) => {
    const db = database();

    let newConst = null;

    // let post = null;
    await db('wb_consult').insert({
        mem_idx : mem_idx,
        cst_title: cst_title,
        cst_content: cst_content,
        cst_regtime: db.fn.now()
    })
    .then((insertedId) => {
        console.log(insertedId)
        newConst = insertedId;
        // post = {cst_name:mem_idx, cst_title: cst_title, cst_content: cst_content};
    })
    .catch((e) => {
        console.log(e);
        // post = null;
    });
    return newConst;
};
//문의글 수정하기 (PUT)
consultModel.editConst = async (mem_id, cst_id, cst_title, cst_content) => {
    const db = database();
    try {
        const consult = await db('wb_consult')
            .where('cst_name', mem_id)
            .andWhere('cst_id', cst_id)
            .first();
            if (consult.cst_step === "답변완료") {
                console.error("답변완료 문의글은 수정할 수 없습니다.");
                return "super";
            }
            const editPost = await db('wb_consult')
                .where('cst_name', mem_id)
                .andWhere('cst_id', cst_id)
                .update({
                    cst_title: cst_title,
                    cst_content: cst_content,
                })
            return editPost;
    }catch (error) {
        console.error("Failed to edit consult:", error);
        return false;
    }
};
// 문의 목록 가져오기v
consultModel.getConsts = async (mem_id) => {
    const db = database();
    let post = [];
    await db
        .select('N.*')
        .from('wb_consult AS N')
        .where('mem_idx', mem_id)//추후 필드 교체
        .whereNot('cst_status', 'N')
        .then(async rows => {
            if (rows.length > 0) {
                for (let row of rows) {
                    if (row.cst_step === '답변완료') {
                        const answer = await db
                            .select('*')
                            .from('wb_consult_answer')
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
            .join('wb_consult AS I', 'I.cst_id', '=', 'ATT.att_target')
            .where('ATT.att_is_image', 'Y')
            .where('ATT.att_target_type', 'CONSULT')
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
consultModel.getConstDetails = async (cst_id) => {
    let cstById = null;

    await db
        .select('C.*', 'M.mem_nickname')
        .from('wb_consult AS C')
        .where('cst_id', '=', cst_id)
        .andWhere('cst_status', '=' ,'Y')
        .join('wb_member AS M', 'C.mem_idx', 'M.mem_idx')
        .limit(1)
        .then(async rows => {
            cstById = (rows.length > 0) ? rows[0] : [];

                if (rows[0].cst_step === '답변완료') {
                    // 2. 두 번째 쿼리: wb_consult_answer에서 답변 데이터 가져오기
                    const answerData = await db
                            .select('*')
                            .from('wb_consult_answer')
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
        .join('wb_consult AS C', 'C.cst_id', '=', 'ATT.att_target')
        .where('ATT.att_is_image', 'Y')
        .where('ATT.att_target_type', 'CONSULT')
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

//문의글 지우기v
consultModel.deleteConst = async (mem_idx, cst_id) => {
    try {
        const consult = await db('wb_consult')
            .where('mem_idx', mem_idx)
            .andWhere('cst_id', cst_id)
            .first(); // 첫 번째 결과만 가져옵니다.
        // 만약 cst_step 값이 "답변완료"인 경우, 삭제를 중단하고 false를 반환합니다.
        if (consult.cst_step === "답변완료") {
            console.error("답변완료 문의글은 삭제할 수 없습니다.");
            return "super";
        }
        // 그렇지 않은 경우, cst_status 값을 'N'으로 업데이트합니다.
        const deletePost = await db('wb_consult')
            .where('mem_idx', mem_idx)
            .andWhere('cst_id', cst_id)
            .update({cst_status: 'N' });
        return deletePost;
    } catch (error) {
        console.error("Failed to delete consult:", error);
        return false;
    }
};
/** 매니저*/
consultModel.manageConst = async (mem_auth) => {
    if (mem_auth >=7){
        try{
            const list = await db
            .select('C.*', 'CA.csa_id', 'CA.csa_status', 'CA.csa_content', 'CA.reg_user', 'CA.reg_datetime', 'CA.upd_user', 'CA.upd_datetime', 'M.mem_nickname')
                .from('wb_consult AS C')
                .where('C.cst_status', '=', 'Y')
                .join('wb_member AS M', 'C.mem_idx', 'M.mem_idx')
                .leftJoin('wb_consult_answer AS CA', 'C.cst_id', 'CA.cst_id');
            return list
        }catch (e) {
            console.error(e)
        }
    }else
        return {fail : "권한이 없습니다."}
}
//답변하기
consultModel.addAnswer= async(inq) => {
    if(!inq.mem_idx) {
        return null;
    }
    const mem_idx = inq.mem_idx;
    const mem = await db('wb_member')
      .where('mem_idx', mem_idx)

    // mem이 배열인지, 그리고 원소가 있는지 확인합니다.
    if(mem && mem.length > 0) {
        const member = mem[0]; // 첫 번째 멤버를 가져옵니다.

        // member 객체 내의 mem_auth 속성의 값을 확인합니다.
        if(member.mem_auth >= 7) {
            const data = await db('wb_consult_answer').insert({
                cst_id: inq.cst_id,
                reg_user: inq.mem_idx,
                csa_content: inq.csa_content,
                reg_datetime : db.fn.now()
            });

            await db('wb_consult')
              .where('cst_id', '=', inq.cst_id)
              .update({
                  cst_step: '답변완료'
              });

            console.log(data);
            return data[0]; // 삽입된 row의 ID 또는 삽입 결과 객체를 반환합니다.
        } else {
            // 권한이 7 미만일 경우 오류 메시지를 반환합니다.
            return { fail: "권한이 없습니다." };
        }
    } else {
        // mem 배열이 비어 있거나 존재하지 않을 경우 오류 메시지를 반환합니다.
        return { fail: "사용자를 찾을 수 없습니다." };
    }


    // if (mem_auth >=7) {
    //     try {
    //         const data = await db('wb_consult_answer').insert({
    //             // mem_auth: mem_auth,
    //             cst_id: inq.cst_id,
    //             reg_user: inq.reg_user,
    //             upd_user: inq.upd_user,
    //             csa_content : inq.csa_conten
    //         })
    //         await db('wb_consult')
    //             .where('cst_id', '=', inq.cst_id)
    //             .update({
    //                 cst_step: '답변완료'
    //             })
    //         return data[0]
    //     } catch (e) {
    //         console.error(e)
    //     }
    // }else    return {fail : "권한이 없습니다."}
}

module.exports = consultModel;
