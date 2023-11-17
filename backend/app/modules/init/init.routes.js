const router = require('express').Router()
const fs = require("fs");
const path = require('path');

const db = database()
router.get('/', async (req, res) => {
    console.log('hoho');
    const sqlFilePath = path.join(__dirname, 'wheeparam.sql');
    const sql = fs.readFileSync(sqlFilePath).toString();

    //data/files 경로가 없는 경우 생성
    const dir = '../../data/files'
    
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log('Generated path:', dir);  // 생성된 경로를 로깅
        }
    } catch (err) {
        console.error('디렉토리 생성 중 에러 발생:', err);
    }
    cb(null, dir);

    try {
        // 트랜잭션 시작
        await db.transaction(async (trx) => {
            const queries = sql.split(';').filter(query => query.trim() !== '');

            for (let query of queries) {
                await trx.raw(query);
            }
        });

        res.send('DB Initialization Succeeded.');
    } catch (error) {
        console.error(error);
        res.status(500).send('DB Initialization Failed.');
    }
});

module.exports = router