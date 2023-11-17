/**
 * shops Controller
 * --------------------------------------------------------------------------------
 * 사용자 컨트롤러
 *
 * getStatics   접속
 * postStatics  사용자 접속시 통계데이타를 입력처리
 *
 * @namespace shops
 * @author 장선근
 * @version 1.0.0.
 */

const shopController = {};
const productController = loadModule('products', 'controller');

const shopModel = loadModule('shop', 'model')
const couponModel = loadModule('coupon', 'model')
const productModel = loadModule('products', 'model')
const membersModel = loadModule('members', 'model')

const { v4: uuidv4 } = require('uuid');
const currentDatetime = new Date(); // 현재 날짜 및 시간 얻기

/**
 * Global Middleware
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const db = database();
/*장바구니에 상품 추가*/
shopController.addCartItem = async(req, res) => {
    try {
        const cartData = req.body;
        console.log('새로 장바구니에 담을 내용물::')
        console.dir(cartData)

        const newCartItems = [];
        for(let i = 0; i < cartData.length ; i++){
            
            const checkCartPrd = await shopModel.checkCartPrd(cartData[i].prd_idx, cartData[i].prd_name, cartData[i].prd_price, cartData[i].cart_qty);

            if(!checkCartPrd) {
                return res.status(503).json({ error: "담을 상품이 존재하지 않습니다." });
            }

            const newCartItem = await shopModel.addCartItem(cartData[i]);

            if(!newCartItem || newCartItem === null){
                return res.status(503).json({ error: "현재 상품을 장바구니에 담을 수 없습니다." });
            }

            console.log("newCartItem::")
            console.log(newCartItem)

            newCartItems.push(newCartItem)

        }

        // const checkCartPrd = await shopModel.checkCartPrd(cartData.prd_idx, cartData.prd_name, cartData.prd_price, cartData.cart_qty);

        // if(!checkCartPrd) {
        //     return res.status(503).json({ error: "담을 상품이 존재하지 않습니다." });
        // }

        // const newCartItem = await shopModel.addCartItem(cartData);

        // if(!newCartItem || newCartItem === null){
        //     return res.status(503).json({ error: "현재 상품을 장바구니에 담을 수 없습니다." });
        // }

        return res.status(200).json(newCartItems);
    } catch (error) {
        console.error("Error adding cart:", error);
        return res.status(500).json({ error: "Failed to add cart" });
    }
};

/*장바구니 목록 불러오기*/
shopController.getCartList = async(req, res) => {
    try {
        // 데이터베이스에서 상품 목록을 조회
        const mem_idx = req.loginUser? req.loginUser.id : null;

        if(!mem_idx){
            return res.status(401).json({ error: "로그인 회원만 사용 가능한 기능입니다." });
        }

        const cart_status = '구매대기'

        //멤버 정보
        const memInfo = await membersModel.getMemberById(mem_idx);

        const cartList = await shopModel.getCartList(mem_idx, cart_status);

        if (!cartList || !memInfo || cartList === null || memInfo === null) {
            return res.status(403).json({ error: "장바구니에 담은 상품 list 혹은 로그인 한 member에 관한 정보를 찾을 수 없습니다." });
        }

        for(let i = 0; i < cartList.length; i++){
            //멤버 등급에 따른 상품 할인가 구하기
            const memDiscountPrice = await productController.getMemDiscountPrice(memInfo.levelInfo.lev_discount, cartList[i].prd_price);

            if (!memDiscountPrice || memDiscountPrice === null) {
                return res.status(403).json({ error: "등급별 할인가를 구할 수 없습니다." });
            }

            cartList[i].prd_discount_price = memDiscountPrice;
        }


        // 상품 목록 반환
        return res.status(200).json(cartList);
    } catch (error) {
        console.error("Error fetching cart list:", error);
        return res.status(500).json({ error: "Failed to fetch cart list" });
    }
};


/*장바구니 상품 정보 수정*/
shopController.updateCartItem = async(req, res) => {
    let updatedcartItem = null;
    try {await db.transaction(async trx => {
        const updatedItemData = req.body.modifyList; 

        console.log('updatedItemData :');
        console.log(updatedItemData);

        updatedcartItem = await shopModel.updateCartItems(updatedItemData, trx);

        if (!updatedcartItem) {
            return res.status(404).json({ error: "shop not found" });
        }

        console.log('updatedcartItem :');
        console.log(updatedcartItem);

    });  // 트랜잭션 종료
        return res.status(200).json(updatedcartItem);
    } catch (error) {
        console.error("Error updating shop:", error);
        return res.status(500).json({ error: "Failed to update shop" });
    }
};

/*장바구니 상품 정보 삭제*/
shopController.deleteCartItem = async(req, res) => {
    try {
        const deleteIdsList = req.body.cartIds;

        if (deleteIdsList.length === 0) {
            return res.status(400).json({error: '삭제할 장바구니 아이템이 없습니다.'});
        }

        // deleteIdsList 배열에 있는 각 cart_id를 사용하여 해당 행의 cart_status를 "취소"로 업데이트합니다.
        for (const item of deleteIdsList) {
            await db('wb_shop_cart')
                .where('cart_id', item)
                .update({ cart_status: '장바구니삭제' });
        }

        return res.status(200).json({ message: '장바구니의 상품이 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error("Error deleting shop:", error);
        return res.status(500).json({ error: "Failed to delete shop" });
    }
};

/*장바구니 -> 구매하기로 상품 보낼 때*/
shopController.addOrderId = async(req, res) => {
    try {
        const paymentType = req.body.paymentType;
        const updatedItemData = req.body.modifyList;

        const getStatus = '구매대기';

        console.log("updatedItemData::");
        console.log(updatedItemData);

        //실제로 있는 cart_id인지 확인 필요
        for(let i = 0; i < updatedItemData.length; i++){
            const chkCartExist = await shopModel.getCartItem(updatedItemData[i].cart_id, updatedItemData[i].mem_idx, getStatus)

            console.log('chkCartExist:')
            console.log(chkCartExist)

            if(!chkCartExist[0] || chkCartExist[0] === null){
                return res.status(404).json({ error: "cart id가 존재하지 않습니다." });
            }
        }

        const newOrderId = await shopController.makeOrderId(); //od_id만들기
        if(paymentType === 'normal'){
            updatedItemData.forEach((item) => { //배열에 od_id를 추가
                item.od_id = newOrderId;
            });

        } else if(paymentType === 'sub') {

            const newKey = await shopController.makeUuid();
            console.log('newKey :: ' + newKey);

            updatedItemData.forEach((item) => { //배열에 od_id, customer_uid를 추가
                item.od_id = newOrderId;
                item.customer_uid = newKey;
            }); }



        
        const updatedcartItem = await shopModel.addOrderId(updatedItemData);


        if (!updatedcartItem) {
            return res.status(404).json({ error: "order list not found" });
        }
        
        return res.status(200).json(updatedcartItem);
    } catch (error) {
        console.error("Error updating shop:", error);
        return res.status(500).json({ error: "Failed to update order list" });
    }

}

//바로구매
shopController.directBuy = async(req, res) => {
    try {
        /* 장바구니에 담기 */
        // console.log('요청이 오긴 오나')
        const directProductData = req.body;

        const waitCartList = []; //od_id 추가하기 위한 용도
        for(let i = 0 ; i < directProductData.length ; i++){
            const directAddCart = await shopModel.addCartItem(directProductData[i]);
            //directAddCart 값은 등록된 상품의 pk 숫자 값.
            console.log('directAddCart 내용물: ');
            console.log(directAddCart);

            if (!directAddCart) {
                return res.status(500).json({ message : "장바구니에 담긴 상품이 없습니다."})
            }

            /* 특정 상품 불러오기 */
            const getMemIdx = directProductData[i].mem_idx;
            const getCartId = directAddCart;
            const getStatus = '구매대기';
            
            const directGetProduct = await shopModel.getCartItem(getCartId, getMemIdx, getStatus)
            
            if (directGetProduct == null) {
                return res.status(500).json({ message : "장바구니에서 상품을 찾을 수 없습니다."})
            }

            console.log('directGetProduct 내용물: ');
            console.log(directGetProduct);

            waitCartList.push(directGetProduct[0])
        }

        /* od_id 만들어주기 */
        const newOrderId = await shopController.makeOrderId(); //od_id만들기
        console.log(`새 OrderId = ${newOrderId}`);

        waitCartList.forEach((item) => { //배열에 od_id를 추가
            item.od_id = newOrderId;
        });

        console.log('waitCartList 에 od_id는 잘 추가됐니?');
        console.log(waitCartList);
        
        // const newDirectBuyList = [];
        // for(let i = 0 ; i < waitCartList.length ; i++){
        //     /* 상품들에 od_id 붙여주기 */


        // }
        
        const updatedcartItem = await shopModel.addOrderId(waitCartList);
            
        if (!updatedcartItem) {
            return res.status(404).json({ error: "order list not found" });
        }

        return res.status(200).json(updatedcartItem);
    } catch (error) {
        console.error("Error updating shop:", error);
        return res.status(500).json({ error: "Failed to update order list" });
    }
}

/* ------------------------- 구매하기 */
/*구매할 목록 불러오기*/
shopController.getOrderList = async(req, res) => {
    try {
        // 데이터베이스에서 상품 목록을 조회
        const mem_idx = req.body?.mem_idx ?? '';
        const od_id = req.body?.od_id ?? '' ;
        const cart_status = '구매대기';

        // console.log(`${mem_idx}가 구매할 ${od_id} 번호를 상태가 ${cart_status}인 가진 상품!`);

        const orderList = await shopModel.getOrderList(mem_idx, od_id, cart_status);

        // 구매할 상품 목록 반환
        return res.status(200).json(orderList);
    } catch (error) {
        console.error("Error fetching order list:", error);
        return res.status(500).json({ error: "Failed to fetch order list" });
    }
};

/*결제 완료 된 상품 정보 추가*/
shopController.addOrderItem = async(req, res) => {
    try {
        const orderData = req.body;

        /* od_title 뽑기 -------------------------------- */
        const prd_idxs = orderData.prd_idxs;
        const orderArray = [];

        for(let i = 0; i < prd_idxs.length; i++){
            const buyingProdDetail = await productModel.getProductById(prd_idxs[i])

            if(!buyingProdDetail) {
                return res.status(503).json({ error: "구매하려는 상품을 찾을 수 없습니다." });
            }
            orderArray.push(buyingProdDetail.prd_name)
        }
        
        orderData.od_title = await shopController.summarizeOdTitle(orderArray); //od_title 요약하기

        console.log('od_title:: ' + orderData.od_title);

        /* od_status 뽑기 -------------------------------- */
        if (orderData.od_settle_case === 'vbank' || orderData.od_settle_case === 'noBankBook') {
            /* 미수금 체크 -------------------------------- */
            orderData.od_status = '입금대기';
            orderData.od_misu = orderData.od_receipt_price;
        } else {
            orderData.od_status = '입금완료';
        }

        /* 새로운 order 등록 -------------------------------------- */

        const newOrderItem = await shopModel.addOrderItem(orderData);

        if(newOrderItem.exist){
            return res.status(503).json({ error: "이미 해당 od_id의 구매건이 등록되어 있습니다." })
        }

        console.log('newOrderItem::')
        console.log(newOrderItem)

        if (!newOrderItem) throw new Error("Failed to upload shop order.");

        /* 장바구니 status 변경하기 -------------------------------------- */
        const modifyList = await shopModel.findListByOdId(newOrderItem.mem_idx, newOrderItem.od_id);

        if (!modifyList) throw new Error("Failed to find cart list with order id.");

        if (orderData.od_settle_case === 'vbank' || orderData.od_settle_case === 'noBankBook') {
            modifyList.forEach((item) => {
                item.cart_status = '입금대기';
            });
        } else {
            modifyList.forEach((item) => {
                item.cart_status = '입금완료';
            });
        }

        const modifyCartStatus = await shopModel.updateCartStatus(modifyList);  // trx 객체를 updateCartStatus에 전달합니다.

        if (!modifyCartStatus) throw new Error("Failed to changeCartStatus");


        /* payment_type이 sub(구독) 라면 -------------------------------------- */

        if(orderData.payment_type === 'sub'){

            const reservChk = await shopController.subReservation(orderData);

            if (reservChk.status !== 200 && reservChk.response.code !== 0) {
                throw new Error("Failed to make a reservation.");
            }

            const newSubData = {
                od_id: newOrderItem.od_id,
                mem_idx: newOrderItem.mem_idx,
                imp_uid: newOrderItem.imp_uid,
                mem_nickname: newOrderItem.od_name,
                sub_months: newOrderItem.sub_months,
                pay_account: newOrderItem.pay_account,
                prd_idxs: orderData.prd_idxs,
                first_date: newOrderItem.od_receipt_time,
                reg_datetime: currentDatetime,
            }

            const newSubItem = await shopModel.addSubscribeItem(newSubData, trx)

            if(!newSubItem || newSubItem === null){
                return res.status(500).json({ error: "구독 테이블 적용 실패" });
            }
        }

        /* 사용한 쿠폰이 있다면 차감 -------------------------------------- */
        if(orderData.serial_nums){

            for (const serial_num of orderData.serial_nums) {

                //멤버가 해당 쿠폰을 갖고 있는지 검증
                const memCouVerify = await couponModel.getMemCouVerify(serial_num, orderData.mem_idx);

                if(!memCouVerify || memCouVerify === null){
                    throw new Error("멤버가 해당 쿠폰을 갖고 있지 않습니다.");
                }

                const change_status = 'N';
                const removeData = {
                    serial_num: serial_num,
                    mem_idx: orderData.mem_idx,
                    del_memo: '쿠폰 사용',
                    cou_status: 'N',
                    use_datetime: currentDatetime,
                };
        
                const updCouponStatus = await couponModel.couStatusChange(change_status, removeData);

                if(!updCouponStatus){
                    throw new Error("쿠폰 사용 처리에 문제 발생");
                }
                console.log('updCouponStatus for serial_num ' + serial_num + ':');
                console.log(updCouponStatus);
            }
        }

        return res.status(200).json({ message: 'Success' });

    } catch (error) {
        console.error("Error adding shop:", error);
        return res.status(500).json({ error: "Failed to add shop" });
    }
};

//결제 성공한 주문 list 불러오기
shopController.getPayedOrder = async(req, res) => {
    try {
        // 데이터베이스에서 상품 목록을 조회
        const mem_idx = req.body?.mem_idx ?? '';
        const od_id = req.body?.od_id ?? '' ;
        const imp_uid = req.body?.imp_uid ?? '';
        const payment_type = req.body?.payment_type ?? '' ;

        // console.log(`${mem_idx}가 결제 완료한 ${od_id} 번호를 가진 상품!`);

        const orderPayedList = await shopModel.getPayedOrder(mem_idx, od_id, imp_uid, payment_type);

        console.log(orderPayedList)

        // 구매할 상품 목록 반환
        return res.status(200).json(orderPayedList);
    } catch (error) {
        console.error("Error fetching payed list:", error);
        return res.status(500).json({ error: "Failed to fetch payed list" });
    }
};

//결제 성공한 주문 상세 불러오기
shopController.getPayedOrderDetail = async(req, res) => {
    try {
        // 데이터베이스에서 상품 목록을 조회
        const mem_idx = req.body?.mem_idx;
        const od_idx = req.body?.od_idx;
        const od_id = req.body?.od_id;
        const imp_uid = req.body?.imp_uid;

        if(!mem_idx || !od_idx || !od_id || !imp_uid){
            return res.status(503).json({ error: "결제 정보 조회에 필요한 데이터를 보내주세요." });
        }

        //order 가져오기
        const orderInfo = await shopModel.getPayedOrderDetail(mem_idx, od_idx, od_id, imp_uid);

        if(!orderInfo || orderInfo === null){
            return res.status(503).json({ error: "결제 정보 조회 중 문제 발생" });
        }

        console.log('orderInfo::')
        console.log(orderInfo)

        //order가 가진 cart내역 가져오기
        const orderCartInfos = await shopModel.getOrderList(mem_idx, od_id, orderInfo.od_status);

        if(!orderCartInfos || orderCartInfos === null){
            return res.status(503).json({ error: "결제 정보 조회 중 문제 발생" });
        }

        orderInfo.thumbnail = orderCartInfos[0].att_filepath
        orderInfo.cartItem = orderCartInfos


        return res.status(200).json(orderInfo);
    } catch (error) {
        console.error("Error fetching payed list:", error);
        return res.status(500).json({ error: "Failed to fetch payed list" });
    }
}

//가상계좌 입금 완료 처리
shopController.chkVbankPaid = async(req, res) => {
    try{
        const pay_method = req.body.pay_method;
        const status = req.body.status;

        console.log('pay_method:' + pay_method)
        console.log('status:' + status)
        if(pay_method !== 'vbank' || status !== 'paid'){
           return res.status(503).json({message:'가상계좌에 대한 요청이 아니거나, 입금 처리가 완료되지 않았습니다.'})
        }

        const requestData = {
            imp_uid: req.body.imp_uid,
            buyer_email: req.body.buyer_email,
            vbank_num: req.body.vbank_num,
            vbank_name: req.body.vbank_name,
            vbank_holder: req.body.vbank_holder
        }

        const modifiedOrder = await shopModel.chkVbankPaid(requestData);

        console.log('modifiedOrder::')
        console.log(modifiedOrder)

        if(!modifiedOrder){
            return res.status(503).json({message:'가상계좌 입금 정보 업데이트 실패'})
        }

        return res.status(200).json({message:'가상계좌 입금 정보 업데이트 성공'})
    }catch{
        console.error("Error updating vbank order record:", error);
        return res.status(500).json({ error: "Failed to fetch update vbank order record" });
    }
}

//결제 취소 & 환불 요청(일반 결제)
shopController.cancelOrderItem = async(req, res) => {
    try{
        const cancelInfo = req.body.cancelInfo
        const mem_idx = req.body.mem_idx;

        //od_status가 입금 완료 || 주문 완료 가 아니라면 결제 취소를 할 수 없도록 처리
        const orderInfo = await shopModel.getPayedOrder(mem_idx, cancelInfo.od_id, cancelInfo.imp_uid);

        if(orderInfo && orderInfo.od_status === '입금 대기' || orderInfo.od_status === '입금 완료'){

            const refundChk = await shopController.refundPayment(cancelInfo, mem_idx)

            /* cart status 변경 ---------------------------------- */
            const cartListByOdId = await shopModel.findListByOdIdTRX(mem_idx, cancelInfo.od_id, trx);

            for(let i = 0; i < cartListByOdId.length; i++){
                cartListByOdId[i].cart_status = '주문취소'
            }
        
            const cartCancel = await shopModel.updateCartStatus(cartListByOdId, trx);

            if(orderCancel && cartCancel){
                return res.status(200).json({message: "주문 취소 처리 완료."})
            }

        } else{ //od_status 가 상품준비중||배송중||배송완료 일 때
                return res.status(200).json({message: "결제 취소는 상품 준비 전까지만 가능합니다."})    
        }
    } catch (error) {
        console.error("Error canceling order:", error);
        return res.status(500).json({ error: "Failed to cancel order" });
    }

}

/* -------------------------------- 구독 */
//구독 해지
shopController.subReservCancel = async (req, res) => {
    try{
        const cancelInfo = req.body.cancelInfo
        const mem_idx = req.body.mem_idx;
        

        if(!cancelInfo || !cancelInfo.customer_id || !merchant_uid){
            return res.status(401).json({ error: "결제 예약 취소에 필요한 데이터가 없습니다." });
        }

        const canceledData = shopController.paymentsUnschedule(cancelInfo);

        /* ---------------------------- 결제 예약 취소에 성공한 경우 */
        if(canceledData.status == 200){
            const changeStatus = '구독취소'
            // 1. 구독 테이블의 status 값 구독취소로 변경
            const changeSubTable = await shopModel.updateSubscribeStatus(cancelInfo, mem_idx, changeStatus)

            // 2. order테이블 od_status 구독취소로 변경 
            const changeOrderTable = await shopModel.updateOrderStatus(cancelInfo.od_id, mem_idx, changeStatus)

            if(!changeSubTable || changeSubTable === null || !changeOrderTable || changeOrderTable === null){
                return null
            }

            return res.status(200).json({message: '결제 예약 취소처리 완료'});
        }

        /* ---------------------------- 결제 예약 취소에 실패한 모든 경우 */

        console.log('error::' + error)
        return null

    } catch (error) {
        console.error('Error posting subscribe payments:', error);
        return null
    }

}


//구독하는 회원 list 불러오기
shopController.getSubscribeList = async(req, res) => {
    try{
        let keyword = req.params.keyword
        if (!keyword || keyword == null) {
            return res.status(401).json({error: "keyword 값을 보내주세요."});
        }

        if (keyword !== "all") {
            const parsedKeyword = parseInt(keyword);
            if (!isNaN(parsedKeyword)) {
              // 형변환이 성공하면 number 타입 변수로 사용
              keyword = parsedKeyword;
            }
        }

        console.log('typeof(keyword):' + typeof(keyword))
        
        const subList = await shopModel.getSubscribeList(keyword);

        if(!subList){
        return res.status(500).json({error: "List를 찾지 못했습니다."});
        }

        return res.json(subList);
    } catch (error) {
        console.error('Error fetching subscribe list:', error);
        res.status(500).json({ error: 'Error fetching subscribe list' });
    }
}

//구독 개별 정보 확인
shopController.getSubscribeDetail = async(req, res) => {
    try{
        const sub_idx = req.body.sub_idx;
        const od_id = req.body.od_id;
        const mem_idx = req.body.mem_idx;

        if(!mem_idx){
            return res.status(401).json({ error: "로그인 회원만 사용 가능한 기능입니다." });
        }

        if(!sub_idx){
            return res.status(401).json({ error: "구독 PK 데이터를 보내주세요." });
        }

        const subDetail = await shopModel.getSubscribeDetail(sub_idx, od_id, mem_idx);

        if(!subDetail || subDetail === null){
            return res.status(401).json({ error: "구독 상세를 찾을 수 없습니다." });
        }

        return res.status(200).json(subDetail)
    } catch (error) {
        console.error('Error fetching subscribe detail:', error);
        res.status(500).json({ error: 'Error fetching subscribe detail' });
    }
}

/* ------------------------- 포트원 요청 */
const router = require('express').Router()
const fs = require("fs");
const path = require('path');
const axios = require('axios');

//포트원 상품 단건 영수증조회
shopController.getPortOneOrderDetail = async(req, res) => {
    try {
        const impUid = req.params.imp_uid;

        await chkAccessToken()
            .then((chkToken) => {
                if (chkToken) {
                    return axios.get(`https://api.iamport.kr/payments/${impUid}`, {
                        headers: {
                            'Authorization': `Bearer ${chkToken.accessToken}`
                        }
                    });
                }
            })
            .then((response) => {
                if(response.data) {
                    console.log('pg_tid: ' + response.data.response.pg_tid);
                }
        
                const receiptUrl = `https://iniweb.inicis.com/DefaultWebApp/mall/cr/cm/mCmReceipt_head.jsp?noTid=${response.data.response.pg_tid}&noMethod=1`
                return res.status(200).json(receiptUrl);
            })
            .catch((error) => {
                console.error('Error fetching payment info:', error);
                res.status(500).json({ error: 'Internal Server Error'});
            });

    } catch (error) {
        console.error('Error fetching payment info:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

}

//포트원 상품 결제 취소하기(일반환불&부분환불)
shopController.refundPayment = async (cancelInfo, mem_idx) => {
    try {

        const requestData = {
            merchant_uid: cancelInfo.imp_uid, // 주문번호
            amount: cancelInfo.amount, // 환불 해주려는 금액
            reason: cancelInfo.reason, // 환불사유
            checksum: cancelInfo.checksum, // 주문번호의 상품 전체 금액
            refund_holder: cancelInfo.holder, // [가상계좌 환불시 필수입력] 환불 수령계좌 예금주
            refund_bank: cancelInfo.bankcode, // [가상계좌 환불시 필수입력] 환불 수령계좌 은행코드(예: KG이니시스의 경우 신한은행은 88번)
            refund_account: cancelInfo.account // [가상계좌 환불시 필수입력] 환불 수령계좌 번호
        }

        await chkAccessToken()
            .then((chkToken) => {
                if (chkToken) {
                    return axios.post(`https://api.iamport.kr/payments/cancel`, requestData, {
                        headers: {
                            'Authorization': `Bearer ${chkToken.accessToken}`
                        }
                    });
                }
            })
            .then((response) => {
                if (response.data.code == 0 && response.data) {
                    console.log('response.data :: ')
                    console.log(response.data)
                } else {
                    throw new Error(response.data.message); //결제취소가 되지 않은 이유를 message로 전달
                }
            })
            .catch((error) => {
                console.error('Error fetching payment info:', error);
                res.status(500).json({ error: 'Internal Server Error'});
            });

    
        //od_status 결제취소로 변경해주기
        const changeOdStatus = await shopModel.updateOrderStatus(cancelInfo.od_id, mem_idx, '주문취소');

        if(!changeOdStatus){
            return {status: 500, response: '결제 취소 실패'}
        }

        return {status: 200, msg: `결제 취소 요청 완료`, response: response.data}

    } catch (error) {
        console.error('Error fetching payment info:', error);
        return {status: 500, response: error}
    }
}

//아임포트 결제 내역 조회

//상점 결제 내역 조회

//결제 예약 함수
shopController.subReservation = async (reservInfo) => {
    function getUnixTimestamp(date) {
        return Math.floor(date.getTime() / 1000);
    }

    try{
        //몇개월 동안 정기결제를 원하는지 값을 받아야 함.
            //1. 기준 날짜 있어야 함
            //2. 몇개월 동안 정기 결제 예정인지 있어야 함.
        let scheduleArray = [];
        const baseDate = reservInfo.baseDate;
        const reservTerm = reservInfo.reservTerm;

        for(let i = 1; i <= reservTerm; i++){
            const monthLater = addMonths(baseDate, i)
            const reservDay = getUnixTimestamp(monthLater);

            console.log('monthLater:' + monthLater)
            console.log('reservDay:' + reservDay)

            /*
            imp_uid는 개별 결제건마다 포트원 결제모듈에서 채번하는 고유한 ID이고, merchant_uid는 결제 요청시 가맹점에서 포트원으로 전달한 UID입니다.
merchant_uid는 가맹점에서 지정한 UID이기 때문에 가맹점 서비스의 DB정보와 포트원 서비스에 저장된 정보간에 비교를 할 때 사용할 수 있습니다.
(참고) 결제 요청시 merchant_uid를 지정하지 않으면 임의의 문자가 자동 할당됩니다.
            */
            new_schedule_data = {
                merchant_uid: reservData.od_id, //가맹점 주문번호 //*필수
                schedule_at: reservDay, //결제요청 예약시각(초) (UNIX timestamp in seconds) //*필수
                currency: "KRW", //*필수
                amount: reservInfo.od_cart_price, //결제금액 //*필수
                name: reservInfo.od_title, //"주문명",
                buyer_name: reservInfo.od_name, //"주문자명",
                buyer_email: reservInfo.od_email, //"주문자 Email주소",
                buyer_tel: reservInfo.od_hp, //"주문자 전화번호",
                buyer_addr: `${reservInfo.od_addr1} ${reservInfo.od_addr2}`, //"주문자 주소",
                buyer_postcode: reservInfo.od_zonecode //"주문자 우편번호"
            }

            scheduleArray.push(new_schedule_data);            
        }

        console.log("scheduleArray::")
        console.log(scheduleArray)

        const reservData = {
            customer_uid: reservInfo.customer_uid, //구매자의 결제수단 식별 고유 번호
            customer_id: reservInfo.imp_uid, //구매자 식별 고유 번호
            checking_amount: reservInfo.checking_amount, //카드정상결제여부 체크용 금액.
            card_number: reservInfo.card_number, //카드번호(dddd-dddd-dddd-dddd)
            expiry: reservInfo.expiry, //카드 유효기간(YYYY-MM)
            birth: reservInfo.birth, //생년월일6자리(법인카드의 경우 사업자등록번호10자리)
            pwd_2digit: reservInfo.pwd_2digit, //카드비밀번호 앞 2자리
            cvc: reservInfo.cvc, //카드 인증번호 (카드 뒷면 3자리, AMEX의 경우 4자리).
            pg: reservInfo.pg, //PG사를 지정
            schedules: scheduleArray
        }

        await chkAccessToken()
        .then((chkToken) => {
            if (chkToken) {
                return axios.post(`https://api.iamport.kr/subscribe/payments/schedule`, reservData, {
                    headers: {
                        'Authorization': `Bearer ${chkToken.accessToken}`
                    }
                });
            }
        })

        return {status: 200, response: response.data}
    } catch (error) {
        console.error('Error posting subscribe payments:', error);
        return {status: 500, response: error}
    }
}

//포트원 결제 예약 취소 요청 함수
shopController.paymentsUnschedule = async (cancelInfo) => {
    try{
        await chkAccessToken()
        .then((chkToken) => {
            if (chkToken) {
                return axios.post(`https://api.iamport.kr/subscribe/payments/unschedule`, cancelInfo, {
                    headers: {
                        'Authorization': `Bearer ${chkToken.accessToken}`
                    }
                });
            }
        })
        return {status: 200, response: response.data}
    } catch (error) {
        console.error('Error posting subscribe payments:', error);
        return {status: 500, response: error}
    }
}

//결제 예약 단건 조회

//결제 예약 복수 조회

//accessToken 확인
async function chkAccessToken() {
    const IMP_KEY = '8168578113271752'; // 아임포트 관리자 페이지에서 확인
    const IMP_SECRET = 'bMSs9psQEDOhi492CdswIvazsnk0pHXMk3M5ka0RiT3GXtTMxf3bpwdg0CGW0NArUSPLR1wFIWGMrL7i'; // 아임포트 관리자 페이지에서 확인

    let accessToken = null;
    let tokenExpiry = null;
    let newToken = null; 
    
    // 토큰이 만료되었거나 없는 경우 새로 발급
    if (!accessToken || Date.now() > tokenExpiry) {
        newToken = await getAccessToken(IMP_KEY, IMP_SECRET);
        accessToken = newToken.accessToken
    }

    return {accessToken: accessToken}
}

//accessToken 받아오기
async function getAccessToken(IMP_KEY, IMP_SECRET) {
    try {

        let accessToken = null;
        let tokenExpiry = null;    

        const response = await axios.post('https://api.iamport.kr/users/getToken', {
            imp_key: IMP_KEY,
            imp_secret: IMP_SECRET
        });

        if (response.data.code === 0) {
            accessToken = response.data.response.access_token;
            // 토큰 만료 시간 설정 (30분)
            tokenExpiry = Date.now() + (30 * 60 * 1000);
        } else {
            console.error('Error getting access token:', response.data.message);
        }

        return {accessToken: accessToken, tokenExpiry: tokenExpiry}
    } catch (error) {
        console.error('Error getting access token:', error);
    }
}

/* ------------------------- 추가 컨트롤러 & 함수 */

shopController.makeUuid = async() => {
    const new_unique_key = uuidv4();

    return new_unique_key
}

shopController.makeOrderId = async(req, res) => {
    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth() + 1; // getMonth()는 0부터 시작하므로 1을 더합니다.
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    // 각 부분을 두 자리 숫자로 만들어주기 위해 함수를 만듭니다.
    const twoDigit = (number) => (number < 10 ? `0${number}` : `${number}`);

    // milliseconds를 두 자리로 만들어서 16자리 숫자 문자열을 만듭니다.
    const newOrderId = `${year}${twoDigit(monthIndex)}${twoDigit(day)}${twoDigit(hours)}${twoDigit(minutes)}${twoDigit(seconds)}${twoDigit(milliseconds).slice(0, 2)}`;
    console.log(newOrderId);

    return newOrderId;
}

shopController.summarizeOdTitle = async(orderArray) => {
    const odTitleArray = orderArray; // 예시 데이터

    // 배열의 길이를 확인
    const odTitleLength = odTitleArray.length;
    // od_title을 생성
    let odTitle = '';
    if (odTitleLength > 1) {
        odTitle = `${odTitleArray[0]}외 ${odTitleLength - 1}건`;
    } else if (odTitleLength == 1) {
        odTitle = `${odTitleArray[0]}`;
    } else {
        odTitle = '상품 없음';
    }
    // 생성된 od_title 출력
    console.log(odTitle);

    return odTitle;
}

//상품 주문 상태 변경
shopController.updateStatus = async(updateData) => {
    try {
        // 데이터베이스에서 상품 목록을 조회
        const od_id = updateData?.od_id ?? '';
        const mem_idx = updateData?.mem_idx ?? '';
        const change_status = updateData?.change_status ?? '';

        let cart_status;
        let od_status;

        switch (change_status) {
            case '입금대기':
                cart_status = '입금대기';
                od_status = '입금대기';
                break;
            case '입금완료':
                cart_status = '입금완료';
                od_status = '입금완료';
                break;
            case '상품준비중':
                cart_status = '상품준비중';
                od_status = '상품준비중';
                break;
            case '배송중':
                cart_status = '배송중';
                od_status = '배송중';
                break;
            case '배송완료':
                cart_status = '배송완료';
                od_status = '배송완료';
                break;
            default:
                // 다른 상태에 대한 처리 (예: 오류 처리)
                break;
        }

        //od_id에 따른 장바구니 목록 조회
        const cartList = await shopModel.getCartListByOdId(mem_idx, od_id); 
        
        // const updatedCartItem = await shopModel.updateCartStatus(od_id, mem_idx, cart_status, cartList);
        const updatedOrderItem = await shopModel.updateOrderStatus(od_id, mem_idx, od_status);

        if(updatedCartItem == null || !updatedOrderItem == null) {
            return null
        }

        // console.log(orderPayedList)

        // 구매할 상품 목록 반환
        return {updatedCartItem, updatedOrderItem};
    } catch (error) {
        console.error("Error updating status:", error);
        return res.status(500).json({ error: "Failed to update status" });
    }
};


module.exports = shopController
