const partnerModel = {};
const db = database();
const currentDatetime = new Date(); // 현재 날짜 및 시간 얻기

// 제휴 문의 추가
partnerModel.addContactItem = async (contactData) => {
    let newContact = null;
    const contactRecord = {
        cont_type : contactData.cont_type,
        company_name : contactData.company_name,
        user_name : contactData.user_name,
        cont_phone : contactData.cont_phone,
        cont_mail : contactData.cont_mail,
        cont_text : contactData.cont_text,
        super_memo : '',
        reg_user : 4,
        reg_date : currentDatetime
    };

    await db
        .insert(contactRecord)
        .into('wb_partner_contact')
        .then((insertedId) => {
            newContact = insertedId;
        })
        .catch((e) => {
            console.log(e);
        });

    return newContact;
};

/*제휴 문의 목록 불러오기*/
partnerModel.getContactList = async (keyword) => {
    const db = database();
    let contactList = null;

    if (keyword === 'all') {
        // 'all' 또는 ''(빈문자열)인 경우 전체 배열을 불러옴
        await db
            .select('*')
            .from('wb_partner_contact')
            .where('cont_status', '=', 'Y')
            .then(rows => {
                contactList = (rows.length > 0) ? rows : [];
            })
            .catch((e) => {
                console.log(e);
                contactList = null;
            });
    } else {
        // 조건에 맞는 행을 선택
        await db
            .select('*')
            .from('wb_partner_contact')
            //cont_type 필드 혹은 cont_text 필드에 '광고'라는 문자열이 포함되어 있는 경우, 코드를 어떻게 수정하면 좋을까?
            .andWhere('cont_status', '=', 'Y')
            .andWhere(function() {
                this.where('cont_type', 'LIKE', `%${keyword}%`)
                    .orWhere('cont_text', 'LIKE', `%${keyword}%`);
            })
            .then(rows => {
                contactList = (rows.length > 0) ? rows : [];
            })
            .catch((e) => {
                console.log(e);
                contactList = null;
            });
    }

    return contactList;
};

//제휴 문의 상세 불러오기
partnerModel.getContactById = async (cont_idx) => {
    const db = database();
    let contactById = null;

    await db
        .select('C.*')
        .from('wb_partner_contact AS C')
        .where('cont_idx', '=', cont_idx)
        .andWhere('cont_status', '=' ,'Y')
        .limit(1)
        .then(rows => {
            contactById = (rows.length > 0) ? rows[0] : [];
        })
        .catch((e) => {
            console.log(e);
            contactById = null;
        });
        
    return contactById;
}

//제휴 문의 수정
partnerModel.updateContactItem = async(updateContactItem) => {
    const db = database();

    await db('wb_partner_contact')
            .where('cont_idx', updateContactItem.cont_idx)
            .andWhere('cont_status', '=' ,'Y')
            .update({
                consult_status: updateContactItem.consult_status,
                super_memo: updateContactItem.super_memo,
                upd_date: currentDatetime // 현재 날짜 및 시간 삽입
            })
            .catch((e) => {
                console.log(e);
                return null;
            });

    // 업데이트된 내용(id와 title)을 반환합니다.
    return { "cont_idx": updateContactItem.cont_idx }; // 또는 필요에 따라 업데이트된 내용 반환
};


module.exports = partnerModel