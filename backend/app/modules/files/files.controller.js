/**
 * files Controller
 * --------------------------------------------------------------------------------
 * 사용자 컨트롤러
 *
 * getStatics   접속
 * postStatics  사용자 접속시 통계데이타를 입력처리
 *
 * @namespace files
 * @author 장선근
 * @version 1.0.0.
 */

const filesController = {};
const filesModel = loadModule('files', 'model')
const path = require('path');
const uploadLibrary = require('../../libraries/upload.library.js');
/**
 * Global Middleware
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
/*파일 라우트 처리*/
filesController.getFileByPath = async(req, res) => {
    try {
        let type = req.params.type.toUpperCase();
        if (req.params.subdir) {
            type += '/' + req.params.subdir.toUpperCase();
        }        const id = req.params.id;
        const fileInfo = await filesModel.getFileById(type, id);
        // console.log(type, 123123)
        // console.log(id)
        if (!fileInfo) {
            return res.status(404).send('No file found for the specified type and name.');
        }
        console.log(fileInfo)
        const absolutePath = path.join(__dirname, '/../../', fileInfo);
        res.sendFile(absolutePath);
    } catch (error) {
        console.error("Error fetching file by id:", error);
        res.status(500).send('Error fetching file.');
    }
};
//id로 파일 삭제
filesController.delFileById = async(req, res) => {
    try{
        let att_idx = req.body.att_idx;
        if (!att_idx){
            return res.status(404).json({error:'해당 id를 가진 첨부파일이 존재하지 않습니다.'});
        }
        await filesModel.delFileById(att_idx)
            .then(() => {
                return res.status(200).json({success:'첨부파일이 성공적으로 삭제되었습니다.'});
            })
    } catch (error) {
        return res.status(500).json({error:'첨부파일 삭제 중 오류가 발생했습니다: ' + error});
    }
}
//타입과 타겟으로 파일 삭제
filesController.delFilesByTarget = async(req, res) => {
    try{
        let att_target_type = req.body.att_target_type.toUpperCase();
        let att_target = req.body.att_target;
        if (!att_target_type || !att_target){
            return res.status(404).send('해당 target_type 및 target을 가진 첨부파일이 존재하지 않습니다.');
        }
        await filesModel.delFilesByTarget(att_target_type, att_target)
            .then(() => {
                return res.status(200).send('첨부파일이 성공적으로 삭제되었습니다.');
            })
    } catch (error) {
        return res.status(500).send('첨부파일 삭제 중 오류가 발생했습니다: ' + error);
    }
}

module.exports = filesController