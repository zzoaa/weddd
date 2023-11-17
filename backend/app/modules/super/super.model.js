const membersModel = require("../members/members.model");
const productModel = loadModule('products', 'model')
const currentDatetime = new Date(); // 현재 날짜 및 시간 얻기
const superModel = {};
// const shopModel = loadModule('shop', 'model')
const db = database();
//사이트 기본설정 조회
superModel.getSettingBasic = async () => {
  let superData = {};
  await db
    .select('*')
    .from('wb_config')
    .then(rows => {
      rows.forEach(row => {
        superData[row.cfg_key] = row.cfg_value;
      });
    })
    .catch((e) => {
      console.log(e);
    });
  return superData;
}
//사이트 기본 설정 POST
superModel.postSettingBasic = async (configData) => {
  try {
    for (const key in configData) {
      await db('wb_config')
        .where('cfg_key', '=', key)
        .update({
          'cfg_value': configData[key]
        })
        .catch((e) => {
          console.log(e);
        });
    }
    return {message: 'Configuration updated successfully.'};
  } catch (e) {
    console.error(e)
    return null;
  }
}
//방문 통계 조회
superModel.getStatDate = async (startdate, enddate) => {
  let result = [];
  if(enddate){
    enddate.setHours(23, 59, 59, 999); // 현재 날짜의 끝을 설정합니다.
  };

  let query =  db
    .select('st.*')
    .from('wb_statics as st')
    .orderBy('st.sta_idx', 'ASC');
  if (startdate && enddate) {
    query =  query.whereBetween('st.sta_regtime', [startdate, enddate]);
  }
  result = await query;

  // await query.then(rows => {
  //   result = rows;
  // }).catch((e) => {
  //   console.log(e);
  // });
  return result;
}
//사용자 접속 로그 조회
superModel.getStatVisit = async (startdate, enddate) => {
  let result = [];
  let query = db
    .select("*")
    .from('wb_statics')
  if (startdate && enddate) {
    query = query.whereBetween('sta_regtime', [startdate, enddate]);
    // console.log(query.toString())
  }
  await query.then(rows => {
    result = rows;
    console.log(result)
  }).catch((e) => {
    console.log(e);
  });
  return result
}
/** 문의*/
superModel.getInq = async (keyword) => {
  try {
    let idata = [];
    if (keyword === 'all') {
      idata = await db.select('wb_inquiry.*', 'M.mem_nickname', 'C.cat_name')
        .from('wb_inquiry')
        .where('cst_status', '=', 'Y')
        .leftJoin('wb_member AS M', 'wb_inquiry.mem_idx', '=', 'M.mem_idx')
        .leftJoin('wb_inquiry_category AS C', 'wb_inquiry.cat_id', '=', 'C.cat_id');
    } else {
      idata = await db.select('wb_inquiry.*', 'M.mem_nickname', 'C.cat_name')
        .from('wb_inquiry')
        .where('cst_status', '=', 'Y')
        .andWhere('wb_inquiry.cat_id', 'LIKE', `%${keyword}%`)
        .leftJoin('wb_member AS M', 'wb_inquiry.mem_idx', '=', 'M.mem_idx')
        .leftJoin('wb_inquiry_category AS C', 'wb_inquiry.cat_id', '=', 'C.cat_id');
    }
    for (let i = 0; i < idata.length; i++) {
      let answer = null;
      if (idata[i].cst_step === '답변완료') {
        answer = await db.select('wb_inquiry_answer.*')
          .from('wb_inquiry_answer')
          .where('cst_id', idata[i].cst_id)
          .first();
      }
      idata[i].answer = answer;
    }
    //TODO: 작업 진행 중
    // let inqList = null;
    // await db
    //     .select('*')
    //     .from('wb_inquiry')
    //     .then(rows => {
    //         inqList = (rows.length > 0) ? rows : [];
    //     })
    //     /*
    //     이때,
    //     1. 찾아낸 데이터 행의 wb_inquiry의 mem_idx를 사용하여
    //     1-1. wb_member 테이블에서 mem_idx가 일치하는 행의 정보를 leftJoin으로 가져온다.
    //     2.
    //     */
    //     .catch((e) => {
    //         console.log(e);
    //         inqList = null;
    //     });
    return idata;
  } catch (e) {
    console.error(e);
    return null;
  }
}
superModel.replyInq = async (repData) => {
  try {
    let post = await db('wb_inquiry_answer').insert({
      csa_status: "Y",
      cst_id: repData.cst_id,
      csa_content: repData.csa_content,
      reg_user: repData.reg_user,
    })
    await db('wb_inquiry')
      .where('cst_id', '=', repData.cst_id)
      .update({
        cst_step: '답변완료'
      })
    return post
  } catch (e) {
    console.error(e);
    return null;
  }
}
/** 주문*/
//주문 관리
superModel.getOrders = async (startdate, enddate) => {
  let result = [];
  let query = db
    .select("*")
    .from('wb_shop_order')
  if (startdate && enddate) {//od_receipt_time 혹은 od_time
    // 시작 날짜와 종료 날짜에 시간을 추가합니다.
    startdate += ' 00:00:00';
    enddate += ' 23:59:59';
    query = query.whereBetween('od_receipt_time', [startdate, enddate]);
  }
  await query.then(rows => {
    result = rows;
    console.log(result)
  }).catch((e) => {
    console.log(e);
  });
  return result
}
//주문 상세보기
superModel.getOdInfo = async (oid) => {
  try {
    const odata = await db.select("*")
      .from('wb_shop_order').where('od_id', oid);
    if (odata) {
      // wb_shop_cart 테이블에서 추가 정보 가져오기
      const cartData = await db.select("*")
        .from('wb_shop_cart')
        .where('od_id', oid)
        .andWhere('mem_idx', odata[0].mem_idx);
      if (cartData) {
        odata[0].cartData = cartData;
      }
    }
    return odata;
  } catch (e) {
    console.log(e);
    return null;
  }
}
//회원 id, check_cost_minimum, check_order_status 조건을 모두 만족하는 list를 받아온다.
superModel.getListForLevelCount = async (mem_idx, cost_minimun, od_status) => {
  let listForLevelCount = null;
  await db
    .select('*')
    .from('wb_shop_order')
    .where('mem_idx', '=', mem_idx)
    .andWhere('od_cart_price', '>=', cost_minimun)
    .andWhere('od_status', '=', od_status)
    .then(rows => {
      listForLevelCount = (rows.length > 0) ? rows : [];
    })
    .catch((e) => {
      console.log(e);
      listForLevelCount = null;
    });
  return listForLevelCount
}
// // 장바구니 상품 정보 수정
// superModel.updateCartItems = async (modifyList, trx) => {
//     const success_cart_ids = [];
//     for (const item of modifyList) {
//         await trx('wb_shop_cart')
//             .where('cart_id', item.cart_id)
//             .update({
//                 cart_status: item.cart_status
//             })
//             .catch((e) => {
//                 console.log(e);
//             });
//             success_cart_ids.push(item.cart_id);
//     }
//     return success_cart_ids;
// };
/** 재고관리*/
superModel.getStocks = async (cat_id, prd_sell_status, prd_status, stxt) => {
  let query = db.select("*").from('wb_products')
  if (cat_id) { //카테고리
    query = query.where('cat_id', cat_id);
  }
  if (prd_sell_status && prd_sell_status.length > 0) { //판매상태 Y,O,D
    query = query.whereIn('prd_sell_status', prd_sell_status);
  }
  if (prd_status && prd_status.length > 0) { //표시상태 Y,N
    query = query.whereIn('prd_status', prd_status);
  }
  if (stxt) {//검색텍스트
    query = query.where('prd_name', 'like', `%${stxt}%`);
  }
  let result = await query;
  for (let i = 0; i < result.length; i++) {
    let stockInfo = await superModel.getStockQty(result[i]);
    result[i]['가재고'] = stockInfo['가재고'];
    result[i]['주문대기'] = stockInfo['주문대기'];
  }
  return result
}
//재고수량체크
superModel.getStockQty = async (product) => {
  let jaego = parseInt(product['prd_stock_qty']);
  // 주문에서 재고에서 빼지 않은것들 가져오기
  let sumval = await db('wb_shop_cart')
    .where({
      prd_idx: product['prd_idx'],
      opt_code: '',
      cart_use_stock: 'N'
    })
    .whereIn('cart_status', ['주문', '입금', '준비'])
    .sum('cart_qty as sumval');
  sumval = sumval[0].sumval ? parseInt(sumval[0].sumval) : 0;
  return {
    '가재고': jaego - sumval,
    '주문대기': sumval
  };
}
//재고수정
superModel.putStocks = async (stocks) => {
  let updateData = {
    prd_idx: stocks.prd_idx,
    prd_stock_qty: stocks.prd_stock_qty,
    prd_noti_qty: stocks.prd_noti_qty,
  }
  try {
    const stData = await db('wb_products')
      .where('prd_idx', stocks.prd_idx).update(updateData);
    return updateData
  } catch (error) {
    console.error("Error updating stocks:", error);
    return null;
  }
}

/** 주문 수정*/
superModel.putOrders = async (orderData) => {
  try {
    const updateData = {
      od_status: orderData.od_status,
      od_settle_case: orderData.od_settle_case,
      od_name: orderData.od_name,
      od_email: orderData.od_email,
      od_tel: orderData.od_tel,
      od_hp: orderData.od_hp,
      od_zonecode: orderData.od_zonecode,
      od_addr1: orderData.od_addr1,
      od_addr2: orderData.od_addr2,
      od_cart_count: orderData.od_cart_count,
      od_cart_price: orderData.od_cart_price,
      od_send_cost: orderData.od_send_cost,
      od_receipt_price: orderData.od_receipt_price,
      od_cancel_price: orderData.od_cancel_price,
      od_refund_price: orderData.od_refund_price,
      od_misu: orderData.od_misu,
      od_shop_memo: orderData.od_shop_memo,
      od_pg: orderData.od_pg,
      od_delivery_company: orderData.od_delivery_company,
      od_delivery_num: orderData.od_delivery_num
    };
    await db('wb_shop_order')
      .where('od_id', orderData.od_id)
      .andWhere('mem_idx', orderData.mem_idx)
      .update(updateData);
    return updatedOrderInfo = await superModel.getOdInfo(orderData.od_id)
  } catch (error) {
    console.error("Error updating orders:", error);
    return null;
  }
}
//배송 관리
superModel.putStatus = async (odData) => {
  try {
    for (const orderData of odData) {
      const {od_id, od_status, od_delivery_company, od_delivery_num} = orderData;
      const updateData = {
        od_status: orderData.od_status,
        od_delivery_company: orderData.od_delivery_company,
        od_delivery_num: orderData.od_delivery_num
      };
      await db('wb_shop_order').where('od_id', orderData.od_id).update(updateData);
      console.log(orderData.od_id, '업뎃 id 확인')
    }
    return odData
  } catch (error) {
    console.error("배송 업데이트 에러:", error);
    return null;
  }
}
/*---------------------------*/
/**
 * 기존 등급 리스트 가져오기
 * @returns {Promise<*|null>}
 */
superModel.getLevelList = async () => {

  try {
    return await db.from('wb_member_level')
      .where('lev_status', 'Y')
      .then(rows => {
        return rows
      })

  }catch (e) {
    console.log('레벨 리스트가져오기 실패')
    console.log(e);
    return null;
  }
}

//회원 등급 수동으로 변경
superModel.changeMemLevel = async (changeLevelItem) => {
  const membersModel = loadModule('members', 'model')
  //TODO: 후에 wb_member로 table 변경
  await db('wb_member')
    .where('mem_idx', changeLevelItem.mem_idx)
    .andWhere('mem_status', '=', 'Y')
    .update({
      lev_idx: changeLevelItem.lev_idx,
    })
    .catch((e) => {
      console.log(e);
      return null;
    });
  return await membersModel.getMemberById(changeLevelItem.mem_idx);
}
//회원 등급 실재하는지 확인
superModel.checkLevelExist = async (lev_idx) => {
  const db = database();
  let selectedLevel = null;
  await db
    .select('M.*')
    .from('wb_member_level AS M')
    .where('lev_idx', '=', lev_idx)
    .limit(1)
    .then(rows => {
      selectedLevel = (rows.length > 0) ? rows[0] : null;
    })
    .catch((e) => {
      console.log(e);
      selectedLevel = null;
    });
  return selectedLevel;
};
//새로운 등급 추가
superModel.addNewLevel = async (addlevelData) => {
  let newLevelId = null;
  // 조건에 맞는 행을 선택
  const newLevelData = {
    lev_name: addlevelData.lev_name,
    lev_check: addlevelData.lev_check
  }
  await db
    .insert(newLevelData)
    .into('wb_member_level')
    .then((insertedId) => {
      newLevelId = insertedId;
    })
    .catch((e) => {
      console.log(e);
    });
  return newLevelId;
}
//기존 등급 이름/기준 수정
superModel.updateLevelInfo = async (updateLevelItem) => {
  await db('wb_member_level')
    .where('lev_idx', updateLevelItem.lev_idx)
    .update({
      lev_name: updateLevelItem.lev_name,
      lev_check: updateLevelItem.lev_check,
    })
    .catch((e) => {
      console.log(e);
      return null;
    });
  // 업데이트된 내용(id와 title)을 반환합니다.
  return {"lev_idx": updateLevelItem.lev_idx}; // 또는 필요에 따라 업데이트된 내용 반환
}
superModel.delLevel = async (lev_idx) => {
  try {
    await db('wb_member_level')
      .where('lev_idx', lev_idx)
      .update('lev_status', 'N')
      .catch((e) => {
        return null;
      })
      return {"message": '삭제 성공'}
  }catch (e) {
    return null;
  }
}
superModel.delCheck = async (lev_idx) => {
  try {
    const result = await db('wb_member')
      .where('lev_idx', lev_idx)
      .first();

    return result;
  }catch (e) {
    return '에러 발생'
  }
}
/*관리자 -> 회원 정보 수정*/
superModel.updateMemberInfo = async (updateData) => {
  await db('wb_member')
    .where('mem_idx', updateData.mem_idx)
    .update({ //권한, 이메일, 전화번호, 닉네임
      mem_nickname: updateData.mem_nickname,
      mem_email: updateData.mem_email,
      mem_phone: updateData.mem_phone,
      mem_auth: updateData.mem_auth,
    })
    .catch((e) => {
      console.log(e);
      return null;
    });
  return await membersModel.getMemberById(updateData.mem_idx);
}
/* ------------------------- 포트원 요청 */
// superModel.getConfigIMPInfo = async () => {
//     let configImpInfo = null;
//     await db
//         .select('C.*')
//         .from('wb_config AS C')
//         .limit(1)
//         .then(rows => {
//             configImpInfo = (rows.length > 0) ? rows[0] : null;
//         })
//         .catch((e) => {
//             console.log(e);
//             configImpInfo = null;
//         });
//     return [selectedItem];
// }
/* 상품 리뷰관리 ---------------------------*/
superModel.updateProdReview = async (updateReviewItem) => {
  await db('wb_products_review')
    .where('rev_idx', updateReviewItem.rev_idx)
    .andWhere('rev_status', '=', 'Y')
    .update({
      rev_best: updateReviewItem.rev_best,
      upd_user: updateReviewItem.upd_user,
      upd_datetime: currentDatetime // 현재 날짜 및 시간 삽입
    })
    .catch((e) => {
      console.log(e);
      return null;
    });
  // 업데이트된 내용(id와 title)을 반환합니다.
  return await productModel.getReviewDetail(updateReviewItem.rev_idx) // 또는 필요에 따라 업데이트된 내용 반환
}
/* 상품 문의관리 ---------------------------*/
//상품 문의 관리
superModel.getQas = async (query) => {
  try {
    let result = db.select('PQ.*', 'P.prd_name', 'mem.mem_nickname')
      .from('wb_products_qna as PQ')
      .join('wb_products as P', 'PQ.prd_idx', '=', 'P.prd_idx')  // Join on prd_idx
      .leftJoin('wb_member as mem', 'PQ.mem_idx', 'mem.mem_idx')
      .whereNot('PQ.qa_status', 'N');
    if (query.prd_idx) { //상품id
      result = result.where('PQ.prd_idx', query.prd_idx);
    }
    if (query.mem_idx) { //회원id
      result = result.where('PQ.mem_idx', query.mem_idx);
    }
    if (query.qa_is_answer) { //답변여부 Y,N
      result = result.whereIn('PQ.qa_is_answer', query.qa_is_answer);
    }
    if (query.qtxt) {//질문텍스트
      result = result.where('PQ.qa_content', 'like', `%${query.qtxt}%`);
    }
    if (query.atxt) {//답변텍스트
      result = result.where('PQ.qa_a_content', 'like', `%${query.atxt}%`);
    }
    if (query.ptxt) {//상품명텍스트
      result = result.where('P.prd_name', 'like', `%${query.ptxt}%`);
    }
    return result;
  } catch (error) {
    console.error("문의 목록 get 에러:", error);
    return null;
  }
}
//상품 문의 답변
superModel.ansQa = async (qaAns) => {
  const [checkAnswer] = await db('wb_products_qna as PQ')
    .where('PQ.qa_idx', qaAns.qa_idx)
    .select('PQ.qa_is_answer');
  // 이미 답변이 완료된 경우 에러를 발생
  if (checkAnswer && checkAnswer.qa_is_answer === 'Y') {
    throw new Error('이미 답변 완료된 문의글입니다');
  }
  let result = await db('wb_products_qna as PQ')
    .where('PQ.qa_idx', qaAns.qa_idx)
    .update({
      qa_is_answer: 'Y',
      qa_a_content: qaAns.qa_a_content,
      qa_a_mem_idx: qaAns.qa_a_mem_idx,
      qa_a_datetime: new Date()
    })
  console.log(result)
  return result;
}
//문의 답변 수정
superModel.editQaAns = async (qaAns) => {
  try {
    let result = await db('wb_products_qna as PQ')
      .where('PQ.qa_idx', qaAns.qa_idx)
      .where('PQ.qa_is_answer', 'Y')
      .update({
        qa_a_content: qaAns.qa_a_content,
        qa_a_mem_idx: qaAns.qa_a_mem_idx,
        qa_a_datetime: new Date()
      })
    console.log(result)
    return result;
  } catch (e) {
    console.error(e);
    return null
  }
}
//상품 리뷰 관리
superModel.getRevs = async (query) => {
  function findIndexesByRevIdx(data, revIdx) {
    // 데이터에서 매칭되는 rev_idx를 가진 객체들을 필터링합니다.
    const matchingObjects = data.filter(item => item.att_target === revIdx);
    // 매칭되는 객체들의 원래 배열에서의 인덱스를 매핑합니다.
    const indexes = matchingObjects.map(item => data.indexOf(item));
    return indexes;
  }

  try {
    let result = await db.select('mem.mem_nickname', 'P.prd_idx', 'P.prd_name', 'PR.*')
      .from('wb_products_review as PR')
      .leftJoin('wb_products as P', 'PR.prd_idx', 'P.prd_idx')  // Join on prd_idx
      .leftJoin('wb_member AS mem', 'PR.mem_idx', 'mem.mem_idx')
      .whereNot('PR.rev_status', 'N')
      .orderBy('PR.rev_idx', 'ASC');
    if (query.prd_idx) { //상품id
      result = result.where('PR.prd_idx', query.prd_idx);
    }
    if (query.mem_idx) { //회원id
      result = result.where('PR.mem_idx', query.mem_idx);
    }
    if (query.rev_score) { //rev 스코어로 갈 필요 있음. 범위필요
      result = result.whereIn('PR.rev_score', query.rev_score);
    }
    if (query.rtxt) {//리뷰 텍스트
      result = result.where('PR.rev_content', 'like', `%${query.qtxt}%`);
    }
    if (query.ptxt) {//상품명텍스트
      result = result.where('P.prd_name', 'like', `%${query.ptxt}%`);
    }
    // 상품 정보가 있을 경우에만 추가 정보 가져오기
    if (result) {
      // 이미지 정보를 가져옵니다.
      await db
        .select('ATT.att_filepath as thumbnail_path', 'ATT.att_idx', 'ATT.att_target')
        .from('wb_attach AS ATT')
        .join('wb_products_review AS R', 'R.rev_idx', 'ATT.att_target')
        .where('ATT.att_is_image', 'Y')
        .where('ATT.att_target_type', 'PRODUCTS_REVIEW')
        // .where('ATT.att_target', rev_idx)
        .then(rows => {
          result = result.map(item => {
            const machingIdx = findIndexesByRevIdx(rows, item.rev_idx)
            for (let i = 0; i < machingIdx.length; i++) {
              if (item.attach_path) {
                item.attach_path.push(rows[machingIdx[i]])
              } else {
                item.attach_path = [];
                item.attach_path.push(rows[machingIdx[i]])
              }
            }
            return item
          })
        })
        .catch((e) => {
          console.log(e);
        });
    }
    return result;
  } catch (error) {
    console.error("문의 목록 get 에러:", error);
    return null;
  }
}
//상품 리뷰 숨김 처리
superModel.hideRev = async (rv, status, best) => {
  try {
    let result = await db('wb_products_review')
      .where('rev_idx', rv)
      .update({rev_status: status, rev_best: best})
    return result
  } catch (error) {
    console.error("리뷰 숨김 처리 에러", error);
    return error;
  }
}
/* 사이트 등급 목록 받아오기 ------------- */
superModel.getMemberLevelInfo = async () => {
  let levelList = null;
  await db
    .select('*')
    .from('wb_member_level')
    .then(rows => {
      levelList = (rows.length > 0) ? rows : [];
    })
    .catch((e) => {
      console.log(e);
      levelList = null;
    });
  return levelList;
}

//회원 권한 목록 받아오기
superModel.getAuthListModel = async () => {
  let result;
  await db
    .select('*')
    .from('wb_member_auth')
    .then(rows => {
      result = (rows.length > 0) ? rows : [];
    })
    .catch((e) => {
      console.log(e);
      result = null;
    });
  return result;
}

//특정 권한 정보 확인
superModel.getAuthById = async (ath_idx) => {
  let authInfo = null

  await db
      .select('U.*')
      .from('wb_member_auth AS U')
      .where('ath_idx', ath_idx)
      .limit(1)
      .then(rows => {
        authInfo = (rows.length > 0) ? rows[0] : null
      })
      .catch((e) => {
          console.log(e);
          authInfo = null
      })

  return authInfo
}

//
superModel.updateMemAuth = async(mem_idx, change_auth) => {
  await db('wb_member')
          .where('mem_idx', mem_idx)
          .andWhere('mem_status', 'Y')
          .update({
              mem_auth: change_auth,
          })
          .catch((e) => {
              console.log(e);
              return null;
          });

  // 업데이트된 내용(id와 title)을 반환합니다.
  return await membersModel.getMemberById(mem_idx);

}

/**내보내기*/
module.exports = superModel;
