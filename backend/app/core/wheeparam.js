/**
 * Gideon HG 주요 진입점
 * ------------------------------------------------------------------------------------
 *
 */
const App = {
    express: null,
    isDev: false,
    config: {}
}

// 주요 의존성패키지
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const cookieParser = require('cookie-parser')
const useragent = require('express-useragent');
const path = require('path');

App.express = express()

require('./global')

process.env.TZ = 'Asia/Seoul';

App.express.use(cookieParser(appConfig.secretKey))
App.express.use(bodyParser.json())
App.express.use(bodyParser.urlencoded({extended: true}))
App.express.use(useragent.express());
/**
 * CORS 설정
 */
App.express.use(cors(appConfig.cors))

/**
 * Helper에 등록된 helper들 자동으로 불러오기
 */
let fileList = fs.readdirSync(root + '/helpers');
fileList.forEach(async (fileName) => {
    require(root + '/helpers/' + fileName);
});

/**
 * 전역 Middleware
 * ------------------------------------------------------------------------------------
 * 사용자 로그인 여부 체크
 */
const memberController = loadModule('members','controller');
App.express.use(memberController.loginMemberCheck);


/**
 * 모듈에 등록된 Router 들 자동으로 불러오기
 */
let dirList = fs.readdirSync(modulePath)
const router = require('express').Router();
dirList.forEach((dir) => {
    // 디렉토리가 맞을경우
    if(fs.lstatSync(modulePath + '/' + dir).isDirectory()) {
        // 라우팅 설정파일이 존재할 경우
        const routePath = `${modulePath}/${dir}/${dir}.routes.js`;
        const matchPath = `/${appConfig.apiVersion}/${dir}`

        if(fs.existsSync( routePath )) {
            router.use(matchPath, require(routePath))
        }
    }
});

App.express.use(router);

/**
 * 업로드 관련 Router 등록
 */
const fileuploads = require(root + '/libraries/upload.library')
App.express.use(fileuploads)

const staticFilesDirectory = path.join(root, 'data', 'files');
App.express.use(`/${appConfig.apiVersion}/data/files`, express.static(staticFilesDirectory));

/**
 * 어플리케이션 실행
 * ------------------------------------------------------------------------------------
 * @param port 실행 포트
 */
App.start = () => {

    // Listen 시작
    App.express.listen(appConfig.appPort, '0.0.0.0', () => {
        console.log(`[${isDev ? '개발 모드':'릴리즈 모드'}] 서버가 작동되었습니다 : port ${appConfig.appPort}`);
    })
}

module.exports = App
// 기존의 App.express를 유지
App.express.set('view engine', 'ejs');
App.express.set('views', path.join(__dirname, '..', 'modules', 'products'));

// 나머지 코드에서는 App.express 인스턴스를 사용합니다.

// 파일 끝에서 App 인스턴스를 그대로 내보냅니다.
module.exports = App;
