const path = require("path");
const md5 = require("md5");
const multer = require("multer");
const fs = require("fs");

const router = require('express').Router();
const randomstring = require('randomstring');



/**
 * 사용자 파일 업로드
 */


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const directory = element('directory', req.params, '');
        const upPath = path.posix.join(directory);
        const uploadPath = path.join(root, 'data', 'files', upPath);

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const originalName = file.originalname;
        const ext = path.extname(file.originalname);
        let fileName = md5(`${Date.now()}_${originalName}`) + randomstring.generate(5) + ext;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage }).array('files');

router.post(`/${appConfig.apiVersion}/uploads/:directory`, async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('파일 업로드 중 에러 발생:', err);
            return res.status(500).json({ error: '파일 업로드 실패' });
        }
        const att_target_type = req.body.att_target_type ?? 'ETC';
        const att_target = req.body.att_target ?? '0';
        console.log(req.body)
        // console.log('11111')
        // console.log(req.files)
        // console.log('22222')
        // console.log(req.att_target);

        const directory = element('directory', req.params, '');
        const upPath = path.posix.join(directory);
        const uploadPath = path.join(root, 'data', 'files', upPath);

        const resultArray = [];
        for (const file of req.files) {
            const originalName = file.originalname;
            const fileName = file.filename; // multer가 생성한 파일 이름 사용
            const filePath = path.join(uploadPath, fileName);
            const fileUrl = appConfig.apiUrl + path.posix.join(`/${appConfig.apiVersion}`, '/data/files', upPath, fileName);



            resultArray.push(fileUrl);

            // 파일 메타데이터 저장 로직 (예: 데이터베이스에 저장)
            const fileData = {
                att_target_type: att_target_type,
                att_target: att_target,// -> write폼에서 Value로 가져오도록 수정
                att_origin: originalName,
                att_filepath: `/data/files/${upPath}/${fileName}`,
                att_ext: path.extname(originalName).substring(1),  // 확장자 추출
                att_is_image: 'Y'
            };
            const db = database();
            await db('wb_attach').insert(fileData)

        }

        return res.json(resultArray);
    });
});

// Single File Upload
uploadSingleFile = async (file, targetPath) => {
    const upPath = path.posix.join(targetPath, (new Date()).dateFormat('yyyy'), (new Date()).dateFormat('MM'));
    const uploadPath = path.join(__dirname, '..', '..', 'src', 'assets', upPath);

    // 디렉토리가 없는 경우 생성
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const originalName = file.originalname;
    let fileName = md5(`${Date.now()}_${originalName}`) + randomstring.generate(5) + ext;
    let filePath = path.join(uploadPath, fileName);

    // 파일명 중복 체크
    while (fs.existsSync(filePath)) {
        fileName = md5(`${Date.now()}_${originalName}`) + randomstring.generate(5) + ext;
        filePath = path.join(uploadPath, fileName);
    }

    let sharpObj = sharp(file.buffer);

    await sharpObj.toFile(filePath);

    return filePath;
};
// product용 업로드 라이브러리
const validImageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'];

uploadFilesAndGetInfo = async (req, targetPath) => {
    // console.log(req.body);
    const uploadedFiles = [];
    for (const file of req.body.files) {
        const ext = path.extname(file.originalname).toLowerCase();

        // 이미지 파일 확장자 확인
        if (!validImageExtensions.includes(ext)) {
            throw new Error('Invalid file type. Only image files are allowed.');
        }

        const uploadedFilePath = await this.uploadSingleFile(file, targetPath);
        if (uploadedFilePath) {
            uploadedFiles.push({
                originalName: file.originalname,
                path: uploadedFilePath,
                ext: ext
            });
        }
    }
    return uploadedFiles;
}


/**
 * 객체 내보내기
 */
module.exports = router;
