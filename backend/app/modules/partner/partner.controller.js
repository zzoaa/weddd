/**
 * partners Controller
 * --------------------------------------------------------------------------------
 * 사용자 컨트롤러
 *
 * getStatics   접속
 * postStatics  사용자 접속시 통계데이타를 입력처리
 *
 * @namespace partners
 * @author 장선근
 * @version 1.0.0.
 */

const partnerController = {};
const partnerModel = loadModule('partner', 'model')

/**
 * Global Middleware
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const db = database();
/*제휴 문의에 상품 추가*/
partnerController.addContactItem = async(req, res) => {
    try {
        const contactData = req.body;
        console.log('새로 제휴 문의에 담을 내용물: '+ contactData)

        const newContactItem = await partnerModel.addContactItem(contactData);

        return res.status(200).json({ "cont_idx" : newContactItem[0] });
    } catch (error) {
        console.error("Error adding Contact:", error);
        return res.status(500).json({ error: "Failed to add Contact" });
    }
};

/*제휴 문의 목록 불러오기*/
partnerController.getContactList = async(req, res) => {
    try {

        // 데이터베이스에서 제휴 문의 목록을 조회
        const keyword = req.params?.keyword ?? '';
        const contactList = await partnerModel.getContactList(keyword);

        console.log(contactList)

        // 제휴 문의 목록 반환
        return res.status(200).json(contactList);
    } catch (error) {
        console.error("Error fetching Contact list:", error);
        return res.status(500).json({ error: "Failed to fetch Contact list" });
    }
};

//제휴 문의 상세 불러오기
partnerController.getContactById = async(req, res) => {
    try {
        // 데이터베이스에서 제휴 문의 상세보기 조회
        const cont_idx = req.params?.cont_idx ?? '';
        const contactDetail = await partnerModel.getContactById(cont_idx);

        console.log(contactDetail)

        // 제휴 문의 상세보기 반환
        return res.status(200).json(contactDetail);
    } catch (error) {
        console.error("Error fetching Contact detail:", error);
        return res.status(500).json({ error: "Failed to fetch Contact detail" });
    }
}

//제휴 문의 수정
partnerController.updateContactItem = async(req, res) => {
    try {
        const updateContactItem = req.body;
        console.log('updateContactItem: ')
        console.log(updateContactItem)
        //cont_idx 실존하는지 || cont_status 상태가 Y인지 검증
        const contactItem = await partnerModel.getContactById(updateContactItem.cont_idx);

        console.log('contactItem: ');
        console.log(contactItem);

        if(contactItem == null) {
            return res.status(500).json({ error: "수정할 게시글을 찾을 수 없습니다." })
        }

        // 제휴 문의 수정 --------------------------------------------------
        const updatedContactItem = await partnerModel.updateContactItem(updateContactItem);

        if (!updatedContactItem || updatedContactItem == null) {
            return res.status(404).json({ error: "info item not found" });
        }
        
        console.log(`${updatedContactItem.cont_idx}의 정보 수정 성공`)

        return res.status(200).json({message: `${updatedContactItem.cont_idx}의 정보 수정 성공`});
    } catch (error) {
        console.error("Error updating faq category:", error);
        return res.status(500).json({ error: "Failed to update category" });
    }
};

/*제휴 문의 상품 정보 삭제*/
partnerController.deleteContactItem = async(req, res) => {
    try {
        const deleteIdsList = req.body.contactIds;

        if (deleteIdsList.length === 0) {
            return res.status(400).json({error: '삭제할 제휴 문의가 없습니다.'});
        }

        // deleteIdsList 배열에 있는 각 Contact_id를 사용하여 해당 행의 Contact_status를 "취소"로 업데이트합니다.
        for (const item of deleteIdsList) {
            await db('wb_partner_contact')
                .where('cont_idx', item)
                .update({ cont_status: 'N' })
                .catch((e) => {
                    console.log(e);
                    return null;
                });
        }

        return res.status(200).json({ message: '제휴 문의가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error("Error deleting partner:", error);
        return res.status(500).json({ error: "Failed to delete partner" });
    }
};

module.exports = partnerController
