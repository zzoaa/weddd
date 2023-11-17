const filesModel = {};
const db = database();
const fs = require('fs');
const path = require('path');
const baseDir = path.resolve(__dirname, '../');
// 특정 이미지파일 조회
filesModel.getFileById = async (type, id) => {
    try {console.log(type, id)
        let fileInfo = await db('wb_attach')
            .where('att_target_type', type)
            .whereRaw(`SUBSTRING_INDEX(att_filepath, '/', -1) = ?`, [id])
            .select('att_filepath')
            .first()
        console.dir(fileInfo)
        if (type == 'PRODREVIEW'){
            fileInfo = await db('wb_attach')
                .where('att_target_type', 'PRODUCTS_REVIEW')
                .whereRaw(`SUBSTRING_INDEX(att_filepath, '/', -1) = ?`, [id])
                .first()
            return fileInfo ? fileInfo.att_filepath : null;
        }
        if (type == 'PRODQNA'){
            fileInfo = await db('wb_attach')
                .where('att_target_type', 'PRODUCTS_QNA')
                .whereRaw(`SUBSTRING_INDEX(att_filepath, '/', -1) = ?`, [id])
                .first()
            return fileInfo ? fileInfo.att_filepath : null;
        }
        if (type == 'INQUIRY'){
            fileInfo = await db('wb_attach')
                .where('att_target_type', 'INQUIRY')
                .whereRaw(`SUBSTRING_INDEX(att_filepath, '/', -1) = ?`, [id])
                .first()
            return fileInfo ? fileInfo.att_filepath : null;
        }
        if (type == 'CONSULT'){
            fileInfo = await db('wb_attach')
                .where('att_target_type', 'CONSULT')
                .whereRaw(`SUBSTRING_INDEX(att_filepath, '/', -1) = ?`, [id])
                .first()
            return fileInfo ? fileInfo.att_filepath : null;
        }
        if (type == 'CATEGORY'){
            fileInfo = await db('wb_products_category')
                .select('icon_filepath')
                .whereRaw(`SUBSTRING_INDEX(icon_filepath, '/', -1) = ?`, [id])
                .first()
            return fileInfo ? fileInfo.icon_filepath : null;
        }
        if (type == 'BANNER'){
            fileInfo = await db('wb_banner')
                .select('ban_filepath')
                .whereRaw(`SUBSTRING_INDEX(ban_filepath, '/', -1) = ?`, [id])
                .first()
            return fileInfo ? fileInfo.ban_filepath : null;
        }
        /* health-info 시작 -----------------------*/
        if (type == 'HEALTH_INFO/CATEGORY'){
            console.log('슬래시 업데이트 필요')
            fileInfo = await db('wb_health_info_category')
                .select('icon_filepath')
                .whereRaw(`SUBSTRING_INDEX(icon_filepath, '/', -1) = ?`, [id])
                .first()
            console.log('건강정보 카테고리 데이터 처리',fileInfo)
            return fileInfo ? fileInfo.icon_filepath : null;
        }
        if (type == 'HEALTH_INFO/FUNCFOOD'){
            console.log('슬래시 업데이트 필요')
            fileInfo = await db('wb_health_func_food')
                .select('thumb_filepath')
                .whereRaw(`SUBSTRING_INDEX(thumb_filepath, '/', -1) = ?`, [id])
                .first()
            console.log('건강정보 카테고리 데이터 처리',fileInfo)
            return fileInfo ? fileInfo.thumb_filepath : null;
        }
        if (type == 'HEALTH_INFO/FOOD'){
            console.log('슬래시 업데이트 필요')
            fileInfo = await db('wb_attach')
                .select('att_filepath')
                .whereRaw(`SUBSTRING_INDEX(att_filepath, '/', -1) = ?`, [id])
                .first()
            console.log('건강정보 카테고리 데이터 처리',fileInfo)
            return fileInfo ? fileInfo.att_filepath : null;
        }
        if (type == 'HEALTH_INFO/RECIPE'){
            console.log('슬래시 업데이트 필요')
            fileInfo = await db('wb_health_recipe')
                .select('thumb_filepath')
                .whereRaw(`SUBSTRING_INDEX(thumb_filepath, '/', -1) = ?`, [id])
                .first()
            console.log('건강정보 카테고리 데이터 처리',fileInfo)
            return fileInfo ? fileInfo.thumb_filepath : null;
        }
        if (type == 'HEALTH_INFO/EXERCISE'){
            console.log('슬래시 업데이트 필요')
            fileInfo = await db('wb_attach')
                .select('att_filepath')
                .whereRaw(`SUBSTRING_INDEX(att_filepath, '/', -1) = ?`, [id])
                .first()
            console.log('건강정보 카테고리 데이터 처리',fileInfo)
            return fileInfo ? fileInfo.att_filepath : null;
        }
        /* health-info 끝  -----------------------*/
        if (type == 'HEALTH_TIP'){
            console.log('슬래시 업데이트 필요')
            fileInfo = await db('wb_health_tip')
                .select('thumb_filepath')
                .whereRaw(`SUBSTRING_INDEX(thumb_filepath, '/', -1) = ?`, [id])
                .first()
            console.log('건강팁 데이터 처리',fileInfo)
            return fileInfo ? fileInfo.thumb_filepath : null;
        }
        if (type == 'SURVEY'){
            console.log('슬래시 업데이트 필요')
            before_img = await db('wb_survey_pill')
                .select('pill_img_before')
                .whereRaw(`SUBSTRING_INDEX(pill_img_before, '/', -1) = ?`, [id])
                .first()

            after_img = await db('wb_survey_pill')
            .select('pill_img_after')
            .whereRaw(`SUBSTRING_INDEX(pill_img_after, '/', -1) = ?`, [id])
            .first()
            // console.log('건강정보 카테고리 데이터 처리',fileInfo)
            
            
            if(before_img){
                return before_img.pill_img_before
            } else {
                return after_img.pill_img_after
            };
        }
/** 기타 파일 로직 */
        // else{
        //     type = 'ETC'
        //     fileInfo = await db('')
        //         .select('')
        //         .whereRaw(`SUBSTRING_INDEX(icon_filepath, '/', -1) = ?`, [id])
        //         .first()
        //     return fileInfo ? fileInfo.icon_filepath : null;
        // }

        return fileInfo.att_filepath;
    } catch (error) {
        console.error("Error fetching file by id:", error);
        return null;
    }
};
/** 파일 삭제 */
filesModel.delFileById = async (att_idx) => {
    const fileInfo = await db('wb_attach')
        .where('att_idx', att_idx)
        .first();

    if (fileInfo) {
        const filePath = path.join(baseDir, fileInfo.att_filepath);
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error deleting file: ${err}`);
            } else {
                console.log(`File deleted successfully: ${filePath}`);
            }
        });
    } else {
        console.log(`No file found with id: ${att_idx}`);
    }

    await db('wb_attach')
        .where('att_idx', att_idx)
        .del();
}
// 타입과 타겟으로 파일 삭제
filesModel.delFilesByTarget = async (att_target_type, att_target) => {
    const filesInfo = await db('wb_attach')
        .where({
            'att_target_type': att_target_type,
            'att_target': att_target
        });

    if (filesInfo.length > 0) {
        filesInfo.forEach(async (fileInfo) => {
            const filePath = path.join(baseDir, fileInfo.att_filepath);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Error deleting file: ${err}`);
                } else {
                    console.log(`File deleted successfully: ${filePath}`);
                }
            });

            await db('wb_attach')
                .where('att_idx', fileInfo.att_idx)
                .del();
        });
    } else {
        console.log(`No file found with target_type: ${att_target_type} and target: ${att_target}`);
    }
}

filesModel.getInfoByTypeNTarget = async (att_target_type, att_target) => {
    let fileInfoList = [];

    await db
    .select('*')
    .from('wb_attach')
    .where('att_target_type', att_target_type)
    .andWhere('att_target', att_target)
    .then(rows => {
        fileInfoList = (rows.length > 0) ? rows : null;
    })
    .catch((e) => {
        console.log(e);
        fileInfoList = null;
    });

    return fileInfoList;
}
module.exports = filesModel;