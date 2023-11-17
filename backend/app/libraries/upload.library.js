const path = require("path");
const md5 = require("md5");
const multer = require("multer");
const fs = require("fs");
const sharp = require("sharp");

const router = require('express').Router();
const randomstring = require('randomstring');

// multer 미들웨어 설정
const upload = multer({
    storage: multer.memoryStorage(), // 메모리 스토리지를 사용하여 파일을 버퍼로 저장
}).array('files'); // 파일 필드의 이름을 지정


/**
 * 사용자 파일 업로드
 */
router.post(`/${appConfig.apiVersion}/uploads/:directory`, async (req, res) => {
    console.log('통신 왔다')

    const att_target_type = req.body.att_target_type ?? 'ETC';
    const att_target = req.body.att_target ?? '0';

    const directory = element('directory', req.params, '');
    // const upPath = path.posix.join(directory , (new Date()).dateFormat('yyyy') ,(new Date()).dateFormat('MM'))
    const upPath = path.posix.join(directory)
    console.log('upPath::')
    console.log(upPath)
    const uploadPath = path.join(root, 'data', 'files', upPath);

    // 이미지 리사이즈에 대한 옵션
    const isResize = element('resize', req.body, false);
    const resizeWidth = element('resizeWidth', req.body, 0);
    const resizeHeight = element('resizeHeight', req.body, 0);

    if (isResize) {
        // 리사이즈 옵션이 활성화된 경우
        if (
            (resizeWidth === 'auto' && resizeHeight === 'auto') ||
            isNaN(resizeWidth) ||
            isNaN(resizeHeight)
        ) {
            return res.status(400).json({ error: '잘못된 리사이징 옵션입니다.' });
        }
    }

    try {
        if (!fs.existsSync(uploadPath)) {
            // 디렉토리가 없는 경우 생성
            fs.mkdirSync(uploadPath, { recursive: true });
        }
    } catch (err) {
        console.error('디렉토리 생성 중 에러 발생:', err);
        return res.status(500).json({ error: 'Failed to create directory' });
    }

    // multer 미들웨어 실행
    upload(req, res, async (err) => {
        if (err) {
            console.error('파일 업로드 중 에러 발생:', err);
            return res.status(500).json({ error: '파일 업로드 실패' });
        }

        const resultArray = [];

        for (const file of req.files) {
            const ext = path.extname(file.originalname);
            const originalName = file.originalname;
            let fileName = md5(`${Date.now()}_${originalName}`) + randomstring.generate(5) + ext;
            let filePath = path.join(uploadPath, fileName);

            // 파일명 중복 체크
            while (fs.existsSync(filePath)) {
                fileName = md5(`${Date.now()}_${originalName}`) + randomstring.generate(5) + ext;
                filePath = path.join(uploadPath, fileName);
            }
            let fileUrl = appConfig.apiUrl + path.posix.join(`/${appConfig.apiVersion}`,'/','data','files', upPath, fileName)

            console.log(' fileUrl::' + fileUrl)
            console.log(' filePath::' + filePath)
            console.log(' fileName::' + fileName)

            try {
                let sharpObj = sharp(file.buffer);

                if (isResize) {
                    if (resizeWidth !== 'auto') {
                        sharpObj = sharpObj.resize(Number(resizeWidth), null);
                    }

                    if (resizeHeight !== 'auto') {
                        sharpObj = sharpObj.resize(null, Number(resizeHeight));
                    }
                }

                await sharpObj.toFile(filePath);
                resultArray.push(fileUrl);
            } catch (err) {
                console.error('파일 업로드 중 에러 발생:', err);
            }

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

            
            //파일 업로드 후 attach table에 이미지 경로 저장

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