const shopModel = {};
const db = database();
const currentDatetime = new Date(); // 현재 날짜 및 시간 얻기

// 장바구니에 담을 products 의 상태 검증
 shopModel.checkCartPrd = async (idx, name, price, qty) => {

    // 조건에 맞는 행을 선택
    const checkPrd = await db
        .select('*')
        .from('wb_products')
        .where('prd_idx', idx) // prd_idx와 인자로 받은 idx 비교
        .andWhere('prd_name', name) // prd_name과 인자로 받은 name 비교
        .andWhere('prd_status', 'Y') // prd_status가 'Y' 여야 함
        .andWhere('prd_sell_status', 'Y') // prd_sell_status가 'Y' 여야 함
        .andWhere('prd_price', '>=', 0) // prd_price가 0 이상이어야 함
        .andWhere('prd_buy_min_qty', '<=', qty) // qty가 prd_buy_min_qty보다 크거나 같아야 함
        .andWhere('prd_buy_max_qty', '>=', qty) // qty가 prd_buy_max_qty보다 작거나 같아야 함
        .andWhere('prd_stock_qty', '>=', qty) // qty가 prd_stock_qty보다 크지 않아야 함
        .catch((e) => {
            console.log(e);
        });

    // 조건을 모두 만족하면 true 반환, 그렇지 않으면 false 반환
    return checkPrd.length > 0;
};

// 장바구니에 상품 추가
shopModel.addCartItem = async (cartData) => {
    let newcart = null;
    const cartRecord = {
        mem_idx: cartData.mem_idx,
        prd_idx: cartData.prd_idx,
        prd_name: cartData.prd_name,
        prd_price: cartData.prd_price,
        cart_price: cartData.cart_price,
        cart_qty: cartData.cart_qty,
        // opt_subject: cartData.cart_qty ?? '',

        //옵션
        opt_subject : cartData?.opt_subject ? JSON.stringify(cartData.opt_subject) : '',
        opt_code : cartData?.opt_code ? JSON.stringify(cartData.opt_code) : '',
        opt_type : cartData?.opt_type ? cartData.opt_type : '' ,
        opt_price : cartData.opt_price ? cartData.opt_price : 0
    };

    await db
        .insert(cartRecord)
        .into('wb_shop_cart')
        .then((insertedId) => {
            newcart = insertedId;
        })
        .catch((e) => {
            console.log(e);
        });

    return newcart[0];
};

// 장바구니 목록 조회
shopModel.getCartList = async (mem_idx, status) => {
    const db = database();

    // 조건에 맞는 행을 선택
    const cartList = await db
        .select('SC.*', 'P.prd_idx', 'P.prd_thumbnail', 'ATT.att_filepath', 'M.mem_nickname')
        .from('wb_shop_cart AS SC')
        .join('wb_products AS P', 'SC.prd_idx', 'P.prd_idx')  // 상품id로 join
        .leftJoin('wb_attach AS ATT', 'P.prd_thumbnail', 'ATT.att_idx')  // 썸네일id로 join
        .join('wb_member AS M', 'SC.mem_idx', 'M.mem_idx') // test_member 테이블과 join
        .where('SC.mem_idx', '=', mem_idx) // wb_shop_cart의 mem_idx 조건
        .andWhere('SC.cart_status', '=', status) // wb_shop_cart의 cart_status 조건
        .catch((e) => {
            console.log(e);
        });

    return cartList;
};

// 장바구니 상품 정보 수정
shopModel.updateCartItems = async (modifyList, trx) => {

    // 반복문을 사용하여 modifyList에 있는 각 항목을 업데이트합니다.
    for (const item of modifyList) {

        // wb_shop_cart 테이블에서 해당 cart_id 값을 가진 행을 업데이트합니다.
        await trx('wb_shop_cart')
            .where('cart_id', item.cart_id)
            .update({
                cart_price: item.cart_price,
                cart_qty: item.cart_qty
            })
            .catch((e) => {
                console.log(e);
            });
    }
    // 업데이트된 내용을 반환합니다. (예: 업데이트 후의 장바구니 목록)
    return shopModel.getCartList(modifyList[0].mem_idx, '입금완료'); // 또는 필요에 따라 업데이트된 내용 반환
};

//od_id에 따른 장바구니 목록 조회
shopModel.getCartListByOdId = async (mem_idx, od_id) => {

    // 조건에 맞는 행을 선택
    const cartList = await db
        .select('SC.*')
        .from('wb_shop_cart AS SC')
        .where('mem_idx', '=', mem_idx)
        .andWhere('od_id', '=', od_id)
        .catch((e) => {
            console.log(e);
            return null;
        });

    return cartList;
};

// 장바구니의 특정 상품 조회
shopModel.getCartItem = async (getCartId, getMemIdx, getStatus) => {

    let selectedItem = null;

    await db
        .select('C.*')
        .from('wb_shop_cart AS C')
        .where('cart_id', '=', getCartId)
        .andWhere('mem_idx', '=', getMemIdx)
        .andWhere('cart_status', '=', getStatus)
        .limit(1)
        .then(rows => {
            selectedItem = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            selectedItem = null;
        });

    return [selectedItem];
}

// #2. 장바구니 table - od_id로 목록 조회
shopModel.findListByOdId = async (userid, orderId) => {
    // 조건에 맞는 행을 선택
    const orderdCartList = await db
        .select('*')
        .from('wb_shop_cart')
        .where('od_id', orderId) // od_id가 orderId와 동일한 행을 선택
        .andWhere('mem_idx', userid) // mem_idx가 userid와 동일한 행을 선택
        .catch((e) => {
            console.log(e);
        });

    return orderdCartList;
};

// #2. 장바구니 table - od_id로 목록 조회
shopModel.findListByOdIdTRX = async (userid, orderId, trx) => {
    // 조건에 맞는 행을 선택
    const orderdCartList = await trx
        .select('*')
        .from('wb_shop_cart')
        .where('od_id', orderId) // od_id가 orderId와 동일한 행을 선택
        .andWhere('mem_idx', userid) // mem_idx가 userid와 동일한 행을 선택
        .catch((e) => {
            console.log(e);
        });

    return orderdCartList;
};

// #3. 장바구니 상품 cart_status 수정
shopModel.updateCartStatus = async (modifyList) => {
    const db = database()

    // 반복문을 사용하여 modifyList에 있는 각 항목을 업데이트합니다.
    for (const item of modifyList) {
        let { cart_id, cart_status } = item;

        // 업데이트할 필드가 비어있지 않으면 업데이트 쿼리 실행
        await db('wb_shop_cart')
            .where('cart_id', cart_id)
            .update({
                cart_status: cart_status
            })
            .catch((e) => {
                console.log(e);
                throw e; // 오류를 throw하여 트랜잭션을 롤백
            });
    }
    // 업데이트된 내용을 반환합니다. (예: 업데이트 후의 장바구니 목록)
    return ({ message: 'cart_status 변경 성공' }); // 또는 필요에 따라 업데이트된 내용 반환
};

//장바구니의 상품 삭제
shopModel.deleteCartItem = async(cartId) => {

    let result = false;

    await db('wb_shop_cart')
    .where('cart_id', productCartId)
    .update({
        cart_price: productPrice,
        cart_qty: productQuantity
    })
    .catch((e) => {
        console.log(e);
    });

    return result;
};


// 장바구니 -> 구매하기로 상품 보낼 때 orderId 추가
shopModel.addOrderId = async (modifyList) => {


    // 반복문을 사용하여 modifyList에 있는 각 항목을 업데이트합니다.
    for (const item of modifyList) {
        const { cart_id, od_id, customer_uid } = item;
        // console.log('업데이트할 상품 번호: ' + productCartId);

        await db('wb_shop_cart')
            .where('cart_id', cart_id)
            .update({
                od_id: od_id,
                customer_uid: customer_uid
            })
            .catch((e) => {
                console.log(e);
            });
    }
    return ({ od_id: modifyList[0].od_id, mem_idx: modifyList[0].mem_idx }); // 또는 필요에 따라 업데이트된 내용 반환
};


/* ---------------------------*/

// 구매할 상품 목록 불러오기
shopModel.getOrderList = async (mem_idx, od_id, cart_status) => {

    // wb_shop_cart 테이블에서 mem_idx와 od_id 조건에 맞는 행을 선택
    const orderList = await db
        .select('SC.*', 'P.prd_idx', 'P.prd_thumbnail', 'ATT.att_filepath')
        .from('wb_shop_cart AS SC')
        .join('wb_products AS P', 'SC.prd_idx', 'P.prd_idx')  // 상품id로 join
        .leftJoin('wb_attach AS ATT', 'P.prd_thumbnail', 'ATT.att_idx')  // 썸네일id로 join
        .where('mem_idx', '=', mem_idx)
        .where('od_id', '=', od_id)
        .where('cart_status', '=', cart_status)
        .catch((e) => {
            console.log(e);
        });

        console.log(orderList);

    return orderList;
};

//#1. 구매 완료된 상품 기록 추가
shopModel.addOrderItem = async (orderData) => {
    let insertedOrder = null;

    // Check if od_id already exists in wb_shop_order
    const existingOrder = await db('wb_shop_order')
    .select('od_id')
    .where('od_id', orderData.od_id)
    .first();

    // If od_id already exists, return an error or handle it as needed
    if (existingOrder) {
        console.log("Order with od_id already exists.");
        return {exist: true};
    }

    const orderRecord = {
        od_id: orderData.od_id,
        mem_idx: orderData.mem_idx,
        imp_uid: orderData?.imp_uid?? '',
        customer_uid: orderData?.customer_uid?? null,
        payment_type: orderData?.payment_type ? orderData.payment_type : 'normal',
        od_status: orderData.od_status,
        od_settle_case: orderData.od_settle_case,
        od_name: orderData.od_name,
        od_email: orderData.od_email,
        od_hp: orderData.od_hp,
        od_zonecode: orderData.od_zonecode,
        od_addr1: orderData.od_addr1,
        od_addr2: orderData.od_addr2,
        od_title: orderData.od_title,
        od_memo: orderData?.od_memo?? '' ,
        od_cart_price: orderData?.od_cart_price?? 0,
        od_send_cost: orderData?.od_send_cost?? 0,
        od_receipt_price: orderData?.od_receipt_price?? 0,
        od_misu: orderData?.od_misu?? 0,
        
        /*가상계좌 ---------*/
        vbank_num : orderData.vbank_num,
        vbank_name : orderData.vbank_name,
        vbank_holder : orderData.vbank_holder,
        /*가상계좌 ---------*/

        od_shop_memo: orderData?.od_shop_memo?? '',
        od_receipt_time: currentDatetime,
        od_pg: orderData.od_pg,
    };


    await db
    .insert(orderRecord)
    .into('wb_shop_order')
    .then((insertedId) => {
        insertedOrder = insertedId;
    })
    .catch((e) => {
      console.log(e);
      return json({ status: 500, error: "Failed to add shop" });
    });

        // if (insertedOrder.length > 0) {
        //     const od_idx = insertedOrder[0];
        //     // 삽입된 PK 값을 사용할 수 있습니다.
        //     // 이제 od_idx를 사용하여 추가 작업을 수행할 수 있습니다.
        //     return od_idx;
        // } else {
        //     // 삽입된 데이터가 없는 경우 처리
        //     return null;
        // }

        //TODO: 왜 상세보기를 못찾지?
    return await shopModel.getOrderInfoByIdx(insertedOrder[0]);
};

shopModel.getOrderInfoByIdx = async (od_idx) => {
    let orderItemById = null;

    await db
        .select('H.*')
        .from('wb_shop_order AS H')
        .where('od_idx', od_idx)
        .limit(1)
        .then(rows => {
            orderItemById = (rows.length > 0) ? rows[0] : [];
        })
        .catch((e) => {
            console.log(e);
            orderItemById = null;
        });
    return orderItemById;
}

// 구매 완료된 상품 불러오기 with 상품 정보
shopModel.getPayedOrder = async (mem_idx, od_id, imp_uid, payment_type) => {
    // wb_shop_cart 테이블에서 mem_idx와 od_id 조건에 맞는 행을 선택
    const selectedOrder = await db
        .select('SO.*','SC.od_id','SC.prd_idx','P.prd_idx', 'P.prd_thumbnail', 'ATT.att_filepath')
        .from('wb_shop_order AS SO')
        .where('SO.mem_idx', mem_idx)
        .andWhere('SO.od_id', od_id)
        .andWhere('SO.imp_uid', imp_uid)
        // .andWhere('SO.payment_type', payment_type)
        .join('wb_shop_cart AS SC','SO.od_id','SC.od_id')
        .join('wb_products AS P', 'SC.prd_idx', 'P.prd_idx')  // 상품id로 join
        .leftJoin('wb_attach AS ATT', 'P.prd_thumbnail', 'ATT.att_idx')  // 썸네일id로 join

        .limit(1)
        .catch((e) => {
            console.log(e);
            return null;
        });
        console.log('selectedOrder의 값은? : ');
        console.log(selectedOrder);
    return selectedOrder;
};

//결제 성공한 주문 상세 불러오기
shopModel.getPayedOrderDetail = async(mem_idx, od_idx, od_id, imp_uid) => {
    let orderInfo = null;

    await db
        .select('S.*')
        .from('wb_shop_order AS S')
        .where({
            'od_idx': od_idx,
            'od_id': od_id,
            'mem_idx': mem_idx,
            'imp_uid': imp_uid
        })
        .limit(1)
        .then(rows => {
            orderInfo = rows[0];
        })
        .catch((e) => {
            console.log(e);
            orderInfo = null;
        });

    return orderInfo;
}

//가상계좌 입금 완료 처리
shopModel.chkVbankPaid = async(requestData) => {
    try {
        const updateData = {
          od_status: '입금완료',
          od_misu: 0,
        };
        await db('wb_shop_order')
          .where({
            imp_uid: requestData.imp_uid,
            od_email: requestData.buyer_email,
            vbank_num: requestData.vbank_num,
            vbank_name: requestData.vbank_name,
            vbank_holder: requestData.vbank_holder,
          })
          .update(updateData);
        return true
      } catch (error) {
        console.error("Error updating orders:", error);
        return false;
      }
}


//order 주문 상태 변경
shopModel.updateOrderStatus = async(od_id, mem_idx, od_status) => {
    await db('wb_shop_order')
        .where('od_id', od_id)
        .andWhere('mem_idx', mem_idx)
        .update({
            od_status: od_status
        })
        .catch((e) => {
            console.log(e);
            return null;
        });

    // 업데이트된 주문 아이템의 내용 반환
    return await shopModel.getOrderItem(od_id, mem_idx, od_status);
}

//order 개별 불러오기
shopModel.getOrderItem = async(od_id, mem_idx, od_status) => {
    let orderItemById = null;

    await db
        .select('H.*')
        .from('wb_shop_order AS H')
        .where('od_id', '=', od_id)
        .andWhere('mem_idx', '=', mem_idx)
        .andWhere('od_status', '=', od_status)
        .limit(1)
        .then(rows => {
            orderItemById = (rows.length > 0) ? rows[0] : [];
        })
        .catch((e) => {
            console.log(e);
            orderItemById = null;
        });
    return orderItemById;
}

/* -------------------------------- 구독 */

//새로운 구독 정보 등록하기
shopModel.addSubscribeItem = async(newSubData, trx) => {
    let new_sub_idx = null;

        await db('wb_shop_subscribe')
        .insert(newSubData)
        .then((insertedId) => {
            new_sub_idx = insertedId;
        })
        .catch((e) => {
            console.log(e);
            new_sub_idx = null
        });

    return {new_sub_idx: new_sub_idx};
}

//구독하는 회원 list 불러오기
shopModel.getSubscribeList = async(keyword) => {
    let subList = null;

    if (keyword === 'all') {
      // 'all'인 경우 전체 배열을 불러옴
      await db
        .select('sub.*', 'od.od_receipt_price as price')
        .from('wb_shop_subscribe as sub')
        .leftJoin('wb_shop_order as od', 'sub.od_id', 'od.od_id')
        .then(async rows => {
          if (rows.length > 0) {
            // 각 행에 대해 처리
            for (let row of rows) {
              row.prd_idxs = JSON.parse(row.prd_idxs)
              if (row.prd_idxs && row.prd_idxs.length > 0) {
                console.log(row);
                // prd_idxs 배열에서 제품 이름 조회
                const productNames = await Promise.all(row.prd_idxs.map(async (idx) => {
                  const product = await db
                    .select('prd_name')
                    .from('wb_products')
                    .where('prd_idx', idx)
                    .first();
                  return product ? product.prd_name : null;
                }));

                // null 값을 제거하고 row에 추가
                row.productNames = productNames.filter(name => name != null);
              }
            }
            subList = rows;
          } else {
            subList = [];
          }
        })
        .catch((e) => {
          console.log(e);
          subList = null;
        });
    } else if(keyword != 'all' && typeof(keyword) === 'string') {
        // 'all'이 아닌 경우 지정한 조건에 따라 필터링하여 데이터를 불러옴
        await db
          .select('sub.*', 'od.od_receipt_price as price')
          .from('wb_shop_subscribe as sub')
          .leftJoin('wb_shop_order as od', 'sub.od_id', 'od.od_id')
          .andWhere('sub_status', 'LIKE', `%${keyword}%`)
          .then(rows => {
              subList = (rows.length > 0) ? rows : [];
          })
          .catch((e) => {
            console.log(e);
            subList = null;
          });
      } else if (keyword != 'all' && typeof(keyword) === 'number') {
      // 'all'이 아닌 경우 지정한 조건에 따라 필터링하여 데이터를 불러옴
      await db
        .select('*')
        .from('wb_shop_subscribe')
        .andWhere('mem_idx', 'LIKE', `%${keyword}%`)
        .then(rows => {
            subList = (rows.length > 0) ? rows : [];
        })
        .catch((e) => {
          console.log(e);
          subList = null;
        });
    }

    return subList;
}

//구독 개별 정보 확인
shopModel.getSubscribeDetail = async(sub_idx, od_id, mem_idx) => {
    let subById = null;

    await db
        .select('S.*', 'od.od_receipt_price as price')
        .from('wb_shop_subscribe AS S')
        .leftJoin('wb_shop_order as od', 'S.od_id', 'od.od_id')
        .where('S.sub_idx', sub_idx)
        .andWhere('S.od_id', od_id)
        .andWhere('S.mem_idx', mem_idx)
        .whereNot('S.sub_status', '구독취소')
        .limit(1)
        .then(async (rows) => {
            subById = (rows.length > 0) ? rows[0] : null;

            if (subById !== null) {
                subById.prd_idxs = JSON.parse(subById.prd_idxs);
                if (subById.prd_idxs.length > 0) {
                    subById.products = [];

                    for (const prdIdx of subById.prd_idxs) {
                        const product = await db
                            .select('*')
                            .from('wb_products')
                            .where('prd_idx', prdIdx)
                            .andWhere('prd_status', 'Y')
                            .first();

                        if (product) {
                            subById.products.push(product);
                        }
                    }
                } else {
                    subById.products = null;
                }
            }
        })
        .catch((e) => {
            console.log(e);
            subById = null;
        });

    return subById;
}

//구독 status 변경
shopModel.updateSubscribeStatus = async(cancelInfo, mem_idx, changeStatus) => {
    await db('wb_shop_subscribe')
        .where('sub_idx', cancelInfo.sub_idx)
        .andWhere('od_id', cancelInfo.od_id)
        .andWhere('customer_uid', cancelInfo.customer_uid)
        .andWhere('mem_idx', mem_idx)
        .update({
            od_status: changeStatus
        })
        .catch((e) => {
            console.log(e);
            return null;
        });

    // 업데이트된 주문 아이템의 내용 반환
    return await shopModel.getOrderItem(od_id, mem_idx, od_status);
}


module.exports = shopModel
