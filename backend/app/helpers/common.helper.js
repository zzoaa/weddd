"use strict";

/**
 * 문자열을 암호화해서 출력하는 함수
 * @param str 암호화할 문자열
 * @returns {*} 암호화된 문자열
 */
global.getHasString = (str) => {
    return require('sha256')(require('md5')(appConfig.secretKey + str));
}

/**
 * 객체의 특정 키가 존재여부를 확인하고 가지고 있는 값을 반환한다.
 * @param key           속성키
 * @param array         객체
 * @param defaultValue  없을시 기본 반환값
 */
global.element = (key, array, defaultValue = null) => {
    if(typeof array === 'undefined' || typeof array[key] === 'undefined' || ! array[key]) {
        return defaultValue
    }

    return array[key] ?? defaultValue
}


global.downloadFile = async(url, filePath) => {
    const axios = require('axios')
    const fs = require('fs')

    const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
    });

    response.data.pipe(fs.createWriteStream(filePath));

    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            resolve();
        });

        response.data.on('error', (err) => {
            reject(err);
        });
    });
}