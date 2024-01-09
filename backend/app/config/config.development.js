module.exports = {
    apiVersion: 'v1',
    appPort: 7999,
    secretKey: 'wheeparam',
    database: {
        host: '115.68.185.124',
        username: 'hagunbiz',
        password: 'gkrns!@#',
        port: 3306,
        database: 'node_board'
    },
    cors: {
        origin: true,
        credentials: true
    },
    apiUrl: 'http://localhost:7999',
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