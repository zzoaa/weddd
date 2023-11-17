const healthtipModel = {};
const db = database();
const currentDatetime = new Date(); // 현재 날짜 및 시간 얻기

//건강 팁 등록
healthtipModel.addhealthtipItem = async (tipData) => {
    let newTip = null;

    const tipRecord = {
        tip_type : tipData.tip_type,
        tip_title : tipData.tip_title,
        tip_sub_title : tipData.tip_sub_title,
        tip_content : tipData.tip_content ?? '',
        ox_content : tipData.ox_content ?? '',
        ox_answer : tipData.ox_answer ?? 'O',
        ox_comment : tipData.ox_comment ?? '',
        thumb_filepath : tipData.thumb_filepath,
        cou_id : tipData.cou_id ?? 0, //*쿠폰 고유번호 설정에 따라 컬럼명 변경해주세요
        reg_user : tipData.reg_user,
        reg_date : currentDatetime
    };

    await db
        .insert(tipRecord)
        .into('wb_health_tip')
        .then((insertedId) => {
            newTip = insertedId;
        })
        .catch((e) => {
            console.log(e);
        });

    return newTip;
};

/*건강 팁 목록 불러오기*/
healthtipModel.getHealthtipList = async (keyword) => {
    const db = database();
    let tipList = null;

    if (keyword === 'all') {
        // 'all' 또는 ''(빈문자열)인 경우 전체 배열을 불러옴
        await db
            .select('tip.*', 'cou.cou_name')
            .from('wb_health_tip as tip')
            .leftJoin('wb_coupon as cou', 'tip.cou_id', 'cou.cou_id')
            .where('tip_status', '=', 'Y')
            .then(rows => {
                tipList = (rows.length > 0) ? rows : [];
            })
            .catch((e) => {
                console.log(e);
                tipList = null;
            });
    } else {
        // 조건에 맞는 행을 선택
        await db
            .select('*')
            .from('wb_health_tip')
            //cont_type 필드 혹은 cont_text 필드에 '광고'라는 문자열이 포함되어 있는 경우, 코드를 어떻게 수정하면 좋을까?
            .andWhere('tip_status', '=', 'Y')
            .andWhere('tip_type', 'LIKE', `%${keyword}%`)
            .then(rows => {
                tipList = (rows.length > 0) ? rows : [];
            })
            .catch((e) => {
                console.log(e);
                tipList = null;
            });
    }

    return tipList;
};

//건강 팁 상세 불러오기
healthtipModel.getTipById = async (tip_idx, trx) => {
    const db = database();
    let tipById = null;

    await db
        .select('H.*', 'cou.*')
        .from('wb_health_tip AS H')
        .leftJoin('wb_coupon AS cou', 'H.cou_id', 'cou.cou_id')
        .where('tip_idx', '=', tip_idx)
        .andWhere('tip_status', '=' ,'Y')
        .limit(1)
        .then(rows => {
            tipById = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            tipById = null;
        });

    return tipById;
}

//건강 팁 수정
healthtipModel.updateTipItem = async(updateTipItem) => {
    const db = database();

    await db('wb_health_tip')
            .where('tip_idx', updateTipItem.tip_idx)
            .andWhere('tip_status', '=' ,'Y')
            .update({
                tip_title: updateTipItem.tip_title,
                tip_sub_title: updateTipItem.tip_sub_title,
                tip_type: updateTipItem.tip_type,
                tip_content: updateTipItem.tip_content,
                ox_content: updateTipItem.ox_content,
                ox_answer: updateTipItem.ox_answer,
                ox_comment: updateTipItem.ox_comment,
                thumb_filepath: updateTipItem.thumb_filepath,
                cou_id: updateTipItem.cou_id
            })
            .catch((e) => {
                console.log(e);
                return null;
            });

    // 업데이트된 내용(id와 title)을 반환합니다.
    return { "tip_idx": updateTipItem.tip_idx }; // 또는 필요에 따라 업데이트된 내용 반환
};

// 1. 정답 인풋 모델
healthtipModel.createLog = async (mem_idx, tip_idx, mem_answer, trx) => {
    return db('wb_health_tip_log').insert({
        mem_idx: mem_idx,
        tip_idx: tip_idx,
        mem_answer: mem_answer
    });
};

// 2. 쿠폰 정보 모델
healthtipModel.getCouIdByTipIdx = async (tip_idx) => {
    const result = await db('wb_health_tip AS HT')
        .join('wb_coupon AS C', 'HT.cou_id', 'C.cou_id')
        .where('HT.tip_idx', tip_idx)
        .select('C.cou_id')
        .first();
    return result ? result.cou_id : null;
};

// 3. 쿠폰 지급 모델
healthtipModel.giveCoupon = async (cou_id, mem_idx, exp_datetime) => {
    return db('wb_member_coupon').insert({
        cou_id: cou_id,
        mem_idx: mem_idx,
        exp_datetime: exp_datetime,
    });
};

/* ---------------------------- */

// 회원이 해당 OX 퀴즈를 풀었는지 확인
healthtipModel.checkLogDetail = async(tip_idx, mem_idx) => {
    try{
        const db = database();
        let logById = null;

        /*
        tipDetail을 들고 오면서 회원이 이 문제를 풀었는지 아닌지 정보도 들고와야 하는데..
        tip_idx, mem_idx 필요

        1. wb_health_tip이라는 table에서 다음의 정보를 찾는다.
            1-1. tip_idx의 값으로 해당 tip의 정보를 찾는다.
            1-2. tip_type은 QUIZ이고, status는 Y여야 함.
        2. wb_health_tip_log에서 다음의 정보를 찾는다.
            2-1. tip_idx 필드의 값이 1에서 찾아낸 tip_idx와 동일한 값을 가진 데이터
            2-2. 단, mem_idx 필드의 값이 인자로 받은 mem_idx와 동일해야 함.
        */

        await db
            .select('H.*')
            .from('wb_health_tip_log AS H')
            .where('tip_idx', '=', tip_idx)
            .andWhere('mem_idx', '=' , mem_idx)
            .limit(1)
            .then(rows => {
                logById = (rows.length > 0) ? rows[0] : [];
            })
            .catch((e) => {
                console.log(e);
                logById = null;
            });

            return logById;
    } catch (e) {
        console.error(e)
        return null;
    }
}


module.exports = healthtipModel
