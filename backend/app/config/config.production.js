module.exports = {
    apiVersion: 'v1',
    appPort: 7999, /*서버에서 번호 겹치지 않도록 설정*/
    secretKey: 'wheeparam',
    database: {
        host: '127.0.0.1',
        username: 'hagunbiz',
        password: 'gkrns!@#',
        port: 3306,
        database: 'node_board' /*서버에서 사용할 DB명*/
    },
    cors: {
        origin: true,
        credentials: true
    },
    apiUrl: 'http://localhost:7999', /*실제 사용할 서버 도메인 주소 입력*/
    jwt: {
        accessTokenExpire: '2h',
        refreshTokenExpire: '14d',
    },
    auth: { //클라이언트 관리자 메일 입력
        emailUser: 'gimhagun245@gmail.com',
        emailPassword: 'yeaq secu qimk yocu'
    },
    imp: {
        key: '',
        secret: ''
    }
}