const router = require('express').Router()
const fs = require("fs");
const path = require('path');

const db = database()
// router.get('/', async (req, res) => {
//     console.log('hoho');
//     const sqlFilePath = path.join(__dirname, 'wheeparam.sql');
//     const sql = fs.readFileSync(sqlFilePath).toString();
//
//
//
//
//     try {
//         // 트랜잭션 시작
//         await db.transaction(async (trx) => {
//             const queries = sql.split(';').filter(query => query.trim() !== '');
//
//             for (let query of queries) {
//                 await trx.raw(query);
//             }
//         });
//
//         res.send('DB Initialization Succeeded.');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('DB Initialization Failed.');
//     }
// });

module.exports = router