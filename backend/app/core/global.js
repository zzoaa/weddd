"use strict";

const path = require("path");
const fs = require("fs");
/**
 * App 개발환경 정의
 * ------------------------------------------------------------------------------------
 * 정의되지 않은 경우 자동으로 false 처리
 */
global.isDev = ( process.argv.length > 2 && process.argv[2] === '--dev' )

/**
 * App Document Root 지정
 * ------------------------------------------------------------------------------------
 */
global.root = path.resolve(__dirname + '/../../app');
global.modulePath = root + '/modules'

/**
 * 사용 환경에 따른 APP 개발 환경설정 불러오기
 * ------------------------------------------------------------------------------------
 */
global.appConfig = require(path.resolve(root + '/config/config.' + (isDev?'development':'production') + '.js'));


/**
 * 모듈 불러오기
 * @param moduleName 모듈 이름
 * @param moduleType 모듈 타입
 * @returns {*}
 */
global.loadModule = ( moduleName, moduleType = 'controller') => {
    const modulePath = `${root}/modules/${moduleName}/${moduleName}.${moduleType}.js`
    if (!fs.existsSync(modulePath)) {
        throw Error('로드하려는 모듈이 존재하지 않습니다')
    }
    const t =require(modulePath)

    return t
}

global.database = () => {
    return require(`${root}/core/db.js`)
}

/**
 * 관리자 로그 작성하기
 * @param type          로그 구분
 * @param description   로그 상세 내용
 * @param loginUserId   사용자
 * @param ip            IP
 * @returns {Promise<void>}
 */
global.addLog = async (type, description, loginUserId, ip) => {

    let query = `INSERT INTO \`${tableName.LOGS}\` SET  `
    query += "`log_type`=?, `log_description`= ?, `reg_user`=?, `reg_datetime`=NOW(), `reg_ip`=? ";
    let bindList = [type, description, loginUserId, ip];

    const db =database()

    await db.raw(query, bindList);
}
