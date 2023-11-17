module.exports = {
    apiVersion: 'v1',
    appPort: 7999,
    secretKey: 'wheeparam',
    database: {
        host: '127.0.0.1',
        username: 'hagunbiz',
        password: 'gkrns!@#',
        port: 3306,
        database: 'botem37'
    },
    cors: {
        origin: true,
        credentials: true
    },
    apiUrl: 'http://localhost:7999',
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