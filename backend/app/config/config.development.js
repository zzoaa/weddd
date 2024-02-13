module.exports = {
    apiVersion: 'v1',
    appPort: 7999, /*local에서 번호 겹치지 않도록 설정*/
    secretKey: 'wheeparam',
    database: {
        /*  host, username, password, port는
            2가지 중 어느 서버 DB 사용하는지 확인하고 필요할 시 변경
            현재 적힌 것은 1번 서버
            ⇓
        */
        host: '115.68.185.124',
        username: 'hagunbiz',
        password: 'gkrns!@#',
        port: 3306,
        database: 'node_board' /*local에서 사용할 DB명*/
    },
    cors: {
        origin: true,
        credentials: true
    },
    apiUrl: 'http://localhost:7999', /*appPort와 번호 맞추기*/
    jwt: {
        accessTokenExpire: '15m',
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