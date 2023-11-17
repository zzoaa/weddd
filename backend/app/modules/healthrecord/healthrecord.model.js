const healthrecordModel = {};
const db = database();
const currentDatetime = new Date(); // 현재 날짜 및 시간 얻기

//건강검진 기록 등록
healthrecordModel.addMediChkItem = async (mem_idx, record_type, health_record) => {
    let newrecordId = null;

    const recordRecord = {
        mem_idx: mem_idx,
        record_type : record_type,
        health_record: JSON.stringify(health_record),
        mem_memo: '',
        reg_datetime : currentDatetime
    };

    await db
        .insert(recordRecord)
        .into('wb_record_medicheck')
        .then((insertedId) => {
            newrecordId = insertedId;
        })
        .catch((e) => {
            console.log(e);
        });

    return newrecordId;
};

/*건강검진 기록 목록 불러오기*/
healthrecordModel.getMediChkList = async (mem_idx, record_type) => {
    const db = database();
    let recordList = null;

        await db
        .select('R.*', 'M.mem_nickname')
        .from('wb_record_medicheck AS R')
        .where('R.mem_idx', mem_idx)
        .andWhere('R.record_type', record_type)
        .join('wb_member AS M', 'R.mem_idx', '=', 'M.mem_idx')
        .then(rows => {
            recordList = (rows.length > 0) ? rows : [];
        })
        .catch((e) => {
            console.log(e);
            recordList = null;
        });

    return recordList;
};

//건강검진 기록 상세 불러오기
healthrecordModel.getMediChkById = async (chk_idx, mem_idx, record_type) => {
    const db = database();
    let recordById = null;

    await db
        .select('H.*')
        .from('wb_record_medicheck AS H')
        .where('chk_idx', chk_idx)
        .andWhere('mem_idx', mem_idx)
        .andWhere('record_type', record_type)
        .limit(1)
        .then(rows => {
            recordById = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            recordById = null;
        });
        
    return recordById;
}

//건강검진 기록 수정
healthrecordModel.updateMediChkItem = async(updaterecordItem, mem_idx) => {
    const db = database();

    await db('wb_record_medicheck')
            .where('chk_idx', updaterecordItem.chk_idx)
            .andWhere('mem_idx', mem_idx)
            .andWhere('record_type', updaterecordItem.record_type)
            .update({
                mem_memo: updaterecordItem.mem_memo,
                upd_datetime: currentDatetime
            })
            .catch((e) => {
                console.log(e);
                return null;
            });

    // 업데이트된 내용(id와 title)을 반환합니다.
    return await healthrecordModel.getMediChkById(updaterecordItem.chk_idx, mem_idx, updaterecordItem.record_type); // 또는 필요에 따라 업데이트된 내용 반환
};


module.exports = healthrecordModel