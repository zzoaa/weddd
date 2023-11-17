"use strict";

/**
 * 지정한 Query 문에서 가장 첫번째 한 행만 가져와서 반환한다.
 * @param query
 * @param bindList
 */
global.rowArray = async (query, bindList= []) => {
    const db = require('../core/db')

    let result = null

    try {
        await db.raw(query, bindList)
            .then(rows => {
                if(rows && rows.length > 0 && rows[0].length > 0) {
                    result = rows[0][0]
                }
            })
    }
    catch (e){
        result = null
    }

    return result
}


/**
 * 지정한 Query문의 Select 결과를 배열로 반환한다.
 */
global.resultArray = async (query, bindList = []) => {
    const db = require('../core/db')

    let result = []

    try {
        await db.raw(query, bindList)
            .then(rows => {
                if(rows && rows.length > 0) {
                    result = rows[0]
                }
                else {
                    result = []
                }

            })
    }
    catch {
        result = []
    }

    return result
}

/**
 * 최근 쿼리문의 SQL_CALC_FOUND_ROWS 의 결과 수를 반환한다.
 * @returns {Promise<number>}
 */
global.getFoundRows = async () => {
    const db = require('../core/db')

    let result = 0;

    try {
        await db
            .raw('SELECT FOUND_ROWS() AS cnt')
            .then(res => {
                result = element('cnt', element(0, element(0, res, []), {}), 0) * 1;
            })
    }
    catch {
        result = 0
    }

    return result
}


/**
 *
 * @param returnType    리턴해야할 형식 ( returnTypes.List / returnTypes.One )
 * @param result        DB에서 얻어온 결과물
 * @param totalRows     총 행수 ( returnTypes.One의 경우 필요없음)
 * @returns {*}
 */
global.getReturnObject = (returnType = returnTypes.List, result = [], totalRows = 0 ) => {
    let returnObject = {}

    if(returnType === returnTypes.List) {
        // 리스트일경우, PageInfo 와 리스트 데이타를 함께 넘겨준다.
        returnObject = {
            result: result,
            pageInfo: {
                totalRows: totalRows
            }
        }
    }
    else {
        // 한행만 반환일경우 리턴 데이타 자체를 한행의 데이타로 채운다.
        returnObject = result.length > 0 ? result[0] : {}
    }

    return returnObject
}
