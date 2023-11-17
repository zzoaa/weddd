const bannerModel = {};
const db = database();
const currentDatetime = new Date(); // 현재 날짜 및 시간 얻기

//배너 그룹 key 중복 체크
bannerModel.checkDuplicateGroup = async(checkKey) => {
    let bngInfo = null;

    await db
        .select('B.*')
        .from('wb_banner_group AS B')
        .where('bng_key', '=', checkKey)
        .andWhere('bng_status', '=' ,'Y')
        .limit(1)
        .then(rows => {
            bngInfo = (rows.length > 0) ? rows[0] : [];
        })
        .catch((e) => {
            console.log(e);
            bngInfo = null;
        });
        
    return bngInfo;
}

//배너 그룹 추가
bannerModel.addBannerGroups = async(newGroupData) => {
    let newId = null;

    const newBannerGroup = {
        bng_sort : newGroupData.bng_sort,
        bng_key : newGroupData.bng_key,
        bng_name : newGroupData.bng_name,
        bng_width : newGroupData.bng_width,
        bng_height : newGroupData.bng_height,

        bng_ext1 : newGroupData.bng_ext1? newGroupData.bng_ext1 : '',
        bng_ext2 : newGroupData.bng_ext2? newGroupData.bng_ext2 : '',
        bng_ext3 : newGroupData.bng_ext3? newGroupData.bng_ext3 : '',
        bng_ext4 : newGroupData.bng_ext4? newGroupData.bng_ext4 : '',
        bng_ext5 : newGroupData.bng_ext5? newGroupData.bng_ext5 : '',
        bng_ext1_use : newGroupData.bng_ext1_use? newGroupData.bng_ext1_use : 'N',
        bng_ext2_use : newGroupData.bng_ext2_use? newGroupData.bng_ext2_use : 'N',
        bng_ext3_use : newGroupData.bng_ext3_use? newGroupData.bng_ext3_use : 'N',
        bng_ext4_use : newGroupData.bng_ext4_use? newGroupData.bng_ext4_use : 'N',
        bng_ext5_use : newGroupData.bng_ext5_use? newGroupData.bng_ext5_use : 'N',

        reg_user : newGroupData.reg_user,
        reg_datetime : currentDatetime
    };

    await db
        .insert(newBannerGroup)
        .into('wb_banner_group')
        .then((insertedId) => {
            newId = insertedId;
        })
        .catch((e) => {
            console.log(e);
        });

    return newId[0];
}

//배너 그룹 목록 조회
bannerModel.getBannerGroups = async() =>{
    let bannerGroupsData = null;
    await db
        .select('*')
        .from('wb_banner_group')
        .then(rows => {
            bannerGroupsData = rows;
        })
        .catch((e) => {
            console.log(e);
        });
    return bannerGroupsData;
}

//배너 그룹 상세 보기
bannerModel.getBannerGroupsDetail = async(bng_idx) => {
    let bngInfo = null;

    await db
        .select('B.*')
        .from('wb_banner_group AS B')
        .where('bng_idx', '=', bng_idx)
        .andWhere('bng_status', '=' ,'Y')
        .limit(1)
        .then(rows => {
            bngInfo = (rows.length > 0) ? rows[0] : [];
        })
        .catch((e) => {
            console.log(e);
            bngInfo = null;
        });
        
    return bngInfo;
}

bannerModel.updateBannerGroups = async(updateBngItem) => {

    await db('wb_banner_group')
        .where('bng_idx', updateBngItem.bng_idx)
        .andWhere('bng_status', '=' ,'Y')
        .update({
            bng_name: updateBngItem.bng_name,
            bng_width: updateBngItem.tip_sub_title,
            bng_height: updateBngItem.tip_content,

            bng_ext1 : updateBngItem.bng_ext1,
            bng_ext2 : updateBngItem.bng_ext2,
            bng_ext3 : updateBngItem.bng_ext3,
            bng_ext4 : updateBngItem.bng_ext4,
            bng_ext5 : updateBngItem.bng_ext5,
            bng_ext1_use : updateBngItem.bng_ext1_use,
            bng_ext2_use : updateBngItem.bng_ext2_use,
            bng_ext3_use : updateBngItem.bng_ext3_use,
            bng_ext4_use : updateBngItem.bng_ext4_use,
            bng_ext5_use : updateBngItem.bng_ext5_use,

            upd_user: updateBngItem,
            upd_datetime: currentDatetime
        })
        .catch((e) => {
            console.log(e);
            return null;
        });

    // 업데이트된 내용(id와 title)을 반환합니다.
    return { "bng_idx": updateBngItem.bng_idx }; // 또는 필요에 따라 업데이트된 내용 반환
}

/* ---------------------------------*/

//배너 목록 조회
bannerModel.getBanners = async (bng_idx) => {
    let bannerData = null;
    await db
        .select('*')
        .from('wb_banner AS BN')
        .join('wb_banner_group AS BNG','BNG.bng_key','BN.bng_key')
        .where('bng_idx',bng_idx)
        .where('ban_status',"Y")
        .then(rows => {
            bannerData = rows;
        })
        .catch((e) => {
            console.log(e);
        });
    return bannerData;
}

//배너 등록하기
bannerModel.addBanners = async (newBanner) => {
    try {
        const [result] = await db('wb_banner').insert({
            bng_key : newBanner.bng_key  ,
            ban_name : newBanner.ban_name ,
            ban_filepath : newBanner.ban_filepath ,
            ban_link_url : newBanner.ban_link_url ,
            ban_timer_start : newBanner.ban_timer_start ,
            ban_timer_end : newBanner.ban_timer_end ,
            ban_ext1 : newBanner.ban_ext1,
            ban_ext2 : newBanner.ban_ext2,
            ban_ext3 : newBanner.ban_ext3,
            ban_ext4 : newBanner.ban_ext4,
            ban_ext5 : newBanner.ban_ext5,
            ban_status : "Y",
            reg_datetime : new Date(),
            upd_datetime : new Date()
        });return result;
    } catch (error) {
        console.error("배너 추가 실패:", error);
        return null;
    }
}
//배너 수정하기
bannerModel.editBanners = async (bannerData) => {
    try {
        // 업데이트할 데이터 생성
        const updateData = {
            ban_status : "Y",
            upd_datetime : new Date()
        };
        if (bannerData.bng_key) updateData.bng_key = bannerData.bng_key;
        if (bannerData.ban_name) updateData.ban_name = bannerData.ban_name;
        if (bannerData.ban_filepath) updateData.ban_filepath = bannerData.ban_filepath;
        if (bannerData.ban_link_url) updateData.ban_link_url = bannerData.ban_link_url;
        if (bannerData.ban_timer_start) updateData.ban_timer_start = bannerData.ban_timer_start;
        if (bannerData.ban_timer_end) updateData.ban_timer_end = bannerData.ban_timer_end;
        if (bannerData.ban_ext1) updateData.ban_ext1 = bannerData.ban_ext1;
        if (bannerData.ban_ext2) updateData.ban_ext2 = bannerData.ban_ext2;
        if (bannerData.ban_ext3) updateData.ban_ext3 = bannerData.ban_ext3;
        if (bannerData.ban_ext4) updateData.ban_ext4 = bannerData.ban_ext4;
        if (bannerData.ban_ext5) updateData.ban_ext5 = bannerData.ban_ext5;

        // 데이터베이스 업데이트
        const result = await db('wb_banner').where('ban_idx', bannerData.ban_idx).update(updateData);
    ;return result;
    } catch (error) {
        console.error("배너 수정 실패:", error);
        return null;
    }
}
bannerModel.delBanner = async (ban_idx) => {
    try{
        const result = await db('wb_banner').where('ban_idx',ban_idx).update({
            ban_status : "N"
        })
        return result
    }catch (error) {
        console.error("배너 삭제 실패:", error);
        return null;
    }
}
module.exports = bannerModel;