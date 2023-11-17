const productsModel = {};
const db = database();
const currentDatetime = new Date(); // 현재 날짜 및 시간 얻기

// 특정 상품 조회
productsModel.getProductById = async(prd_idx)=>{
    
    let product = null;
    let shopConfig = {};

    await db
    .select('P.*') // 기존 상품 정보만 먼저 가져옵니다.
    .from('wb_products AS P')
    .where("prd_idx", prd_idx)
        .where("prd_idx", prd_idx)
        .whereNot("prd_status", 'N')
        .limit(1)
        .then(rows => {
            product = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            product = null;
        });

    // 상품 정보가 있을 경우에만 추가 정보 가져오기
    if (product) {
        // 이미지 정보를 가져옵니다.
        await db
        .select('ATT.att_filepath as thumbnail_path', 'ATT.att_idx')
        .from('wb_attach AS ATT')
        .join('wb_products AS P', 'P.prd_idx', '=', 'ATT.att_target')
        .where('ATT.att_is_image', 'Y')
        .where('ATT.att_target_type', 'PRODUCTS')
        .where('ATT.att_target', prd_idx)
        .then(rows => {
            console.log('Rows: ', rows);  // 추가된 코드
            if (rows.length > 0) {
                // 이미지 정보가 하나 이상 존재할 경우
                if (product.prd_thumbnail === 0) {
                    // product.prd_thumbnail 값이 0일 때만 기존 로직대로 진행
                    product.thumbnail = [
                        { att_idx: rows[0].att_idx,
                          att_filepath: rows[0].thumbnail_path }
                    ];
                } else {
                    // product.prd_thumbnail 값이 0이 아닌 경우 해당 값과 att_idx가 일치하는 이미지 정보를 찾음
                    const matchingImage = rows.find(row => row.att_idx === product.prd_thumbnail);
                    if (matchingImage) {
                        product.thumbnail = [
                            { att_idx: matchingImage.att_idx,
                              att_filepath: matchingImage.thumbnail_path }
                        ];
                    }
                }
                
                product.attach_path = rows.map(row => ({
                    att_idx: row.att_idx,
                    att_filepath: row.thumbnail_path
                }));
            }
        })
        .catch((e) => {
            console.log(e);
        });

        // 상점 설정 값을 가져옵니다.
        await db
            .select('cfg_key', 'cfg_value')
            .from('wb_config')
            .whereIn('cfg_key', ['shop_dilivery_info', 'shop_refund_info'])
            .then(rows => {
                rows.forEach(row => {
                    shopConfig[row.cfg_key] = row.cfg_value;
                });
            })
            .catch((e) => {
                console.log(e);
            });
        product.shopConfig = shopConfig; // 상품 정보에 설정 값을 추가
    }

    return product;
};

// 상품 목록 조회
productsModel.getProducts = async(page, pagerow) => {
    let products = [];

    try{
        let query = db
            .select('P.*', 'PC.cat_title')
            .from('wb_products AS P')
            .leftJoin('wb_products_category AS PC', 'P.cat_id', 'PC.cat_id')
            .whereNot('P.prd_status', 'N');
            // .then(rows => {
            //     products = rows;
            // })
            // .catch((e) => {
            //     console.log(e);
            // });

            if (pagerow !== null) {
                // pagerow 값이 null이 아닌 경우에만 페이지네이션을 적용합니다.
                const itemsPerPage = pagerow; // 페이지 당 아이템 수
                if (page > 0) {
                    const offset = (page - 1) * itemsPerPage;
                    query = query.limit(itemsPerPage).offset(offset);
                }
            }
        products = await query;

        /*
        1. 만약 products가 있다면 
        2. prodcusts의 cat_id를 확인한다
        3. wb_products_category 테이블에서 cat_id와 동일한 데이터가 가진 cat_name의 값을 leftjoin해서 가져온다.
        */

        // 상품 정보가 있을 경우에만 추가 정보 가져오기
        if (products) {
            for(let i = 0; i < products.length; i++) {
                // 이미지 정보를 가져옵니다.
                await db
                .select('ATT.att_filepath as thumbnail_path', 'ATT.att_idx')
                .from('wb_attach AS ATT')
                .join('wb_products AS P', 'P.prd_idx', '=', 'ATT.att_target')
                .where('ATT.att_is_image', 'Y')
                .where('ATT.att_target_type', 'PRODUCTS')
                .where('ATT.att_target', products[i].prd_idx)
                .then(rows => {
                    console.log('Rows: ', rows);  // 추가된 코드
                    if (rows.length > 0) {
                        // 이미지 정보가 하나 이상 존재할 경우
                        if (products[i].prd_thumbnail === 0) {
                            // product.prd_thumbnail 값이 0일 때만 기존 로직대로 진행
                            products[i].thumbnail = [{
                                "att_idx": rows[0].att_idx,
                                "att_filepath": rows[0].thumbnail_path
                            }];
                        } else {
                            // product.prd_thumbnail 값이 0이 아닌 경우 해당 값과 att_idx가 일치하는 이미지 정보를 찾음
                            const matchingImage = rows.find(row => row.att_idx === products[i].prd_thumbnail);
                            if (matchingImage) {
                                products[i].thumbnail = [{
                                    "att_idx": matchingImage.att_idx,
                                    "att_filepath": matchingImage.thumbnail_path
                                }];
                            }
                        }
                    }
                })
                .catch((e) => {
                    console.log(e);
                });    
            }
        }
    }catch (e) {
        console.log(e);
        products = null;
    }

    return products;
};

// 상품 정보 수정
productsModel.updateProduct = async (updatedData) => {
    try {
        await db('wb_products')
            .where('prd_idx', updatedData.prd_idx)
            .update({
                prd_status:updatedData.prd_status,//Y,N,H,T
                prd_sell_status: updatedData.prd_sell_status,//Y,O,D
                cat_id: updatedData.cat_id,
                prd_sort: updatedData.prd_sort,
                prd_type: updatedData.prd_type,
                prd_name: updatedData.prd_name,
                prd_price: updatedData.prd_price,
                prd_cust_price: updatedData.prd_cust_price,//시중가
                prd_maker: updatedData.prd_maker,//제조원
                prd_origin: updatedData.prd_origin,//원산지
                prd_brand: updatedData.prd_brand,//브랜드
                prd_model: updatedData.prd_model,//모델명
                prd_summary: updatedData.prd_summary,//간단설명

                prd_thumbnail: updatedData.prd_thumbnail,//getAttachmentId타고 가져와짐.
                prd_content: updatedData.prd_content,
                prd_stock_qty: updatedData.prd_stock_qty,//재고수량
                prd_noti_qty: updatedData.prd_noti_qty,//재고통보수량
                prd_item_group: updatedData.prd_item_group,//전자상거래상품군
                prd_item_options: updatedData?.prd_item_options ? updatedData.prd_item_options : null,//아이템 옵션
                prd_use_options: updatedData.prd_use_options,
                prd_sc_type: updatedData.prd_sc_type,//배송비유형
                prd_sc_method: updatedData.prd_sc_method,//배송비결제방식
                prd_sc_price: updatedData.prd_sc_price,//기본배송료
                prd_sc_minimum: updatedData.prd_sc_minimum,//배송 상세조건 주문금액
                prd_sc_qty: updatedData.prd_sc_qty,//배송 상세조건 수량
                upd_user: updatedData.upd_user,//업뎃유저
                upd_datetime: new Date(),
                prd_extra_1: updatedData.prd_extra_1,//추가필드
                prd_extra_2: updatedData.prd_extra_2,//추가필드
                prd_extra_3: updatedData.prd_extra_3,//추가필드
                prd_extra_4: updatedData.prd_extra_4,//추가필드
                prd_extra_5: updatedData.prd_extra_5,//추가필드
                prd_extra_6: updatedData.prd_extra_6,//추가필드
                prd_extra_7: updatedData.prd_extra_7,//추가필드
                prd_extra_8: updatedData.prd_extra_8,//추가필드
                prd_extra_9: updatedData.prd_extra_9,//추가필드
                prd_extra_10: updatedData.prd_extra_10,//추가필드
                // upd_datetime: db.fn.now()  // 만약 해당 테이블에 'upd_datetime' 필드가 있으면 이 부분도 업데이트됩니다.
            });

        return true;
    } catch (error) {
        console.error("Error updating product:", error);
        return false;
    }
};

//상품삭제
productsModel.deleteProduct = async(prd_idx) => {
    
    let result = false;

    await db('wb_products')
        .where('prd_idx', prd_idx)
        .update({
            prd_status: "N"
            // upd_datetime: db.fn.now()  // 만약 해당 테이블에 'upd_datetime' 필드가 있으면 이 부분도 업데이트됩니다.
        })
        .then(() => {
            result = true;
        })
        .catch((e) => {
            console.log(e);
            result = null;
        });

    return result;
};
// 파일 삭제 라우트
productsModel.deleteAttachment = async(att_target_type, att_idx) => {
    try {
        // wb_attach 테이블에서 att_target_type와 att_idx가 일치하는 행 삭제
        await db('wb_attach')
            .where('att_idx', att_idx)
            .andWhere('att_target_type', att_target_type)
            .del();
        return true; // 삭제 성공
    } catch (error) {
        console.error("Error deleting attachment:", error);
        return false; // 삭제 실패
    }
}

/**상품 옵션 ------------------------------------------*/
//옵션 재고관리 컬럼 생성 
productsModel.makeOption = async (opData) => {
    // 모든 경우의 수를 생성하는 함수
    function generateCombinations(optionDetails, callback, prefix = []) {
        if (!optionDetails.length) {
            return callback(prefix);
        }

        const [first, ...rest] = optionDetails;
        first.forEach((detail) => {
            generateCombinations(rest, callback, [...prefix, detail]);
        });
    }
    try{
        // 옵션명과 옵션 상세를 분리
        const optionNames = opData.options.map(option => option.title).filter(title => title !== '');
        const optionDetails = opData.options.map(option => option.items).filter(items => items.length > 0);

        // console.log("optionNames::")
        // console.log(optionNames)
        // console.log("optionDetails::")
        // console.log(optionDetails)

        // 모든 경우의 수를 생성하고 데이터베이스에 삽입
        const opList = [];
        const promises = [];
        generateCombinations(optionDetails, (combination) => {
            const opt_subject = optionNames.map(item => `"${item}"`);

            const opt_subjectforTitle = optionNames.map(item => item);
            const opt_code = [];
            for (let i = 0; i < opt_subject.length; i++) {
                const option = {
                    title: opt_subjectforTitle[i],
                    items: combination[i]
                };
                opt_code.push(option);
            }
        
            
            const promise = db('wb_products_options')
                .where('prd_idx', opData.prd_idx)
                .del()  // 기존 행 삭제
                .then(() => {
                    return db('wb_products_options').insert({  // 새 행 삽입
                        prd_idx : opData.prd_idx,
                        opt_code : JSON.stringify(opt_code),
                        opt_subject : `[${opt_subject}]`,
                        opt_status: opData.opt_status,
                        opt_type: opData.opt_type,
                        opt_add_price: opData.opt_add_price,
                        opt_stock_qty: opData.opt_stock_qty,
                        opt_noti_qty: opData.opt_noti_qty
                    });
                })
                .then(() => {
                    // 삽입된 옵션을 리스트에 추가
                    opList.push({opt_code, opt_subject});
                });
            promises.push(promise);
        });
        await Promise.all(promises);
        // console.log(opList);
        return {options: opList, count: opList.length};
    }
    catch (error) {
        console.error(error);
    }

}

//옵션 GET
productsModel.getOptions = async (cat_id, prd_sell_status, prd_status, stxt) => {
    try {
      let query = db.select('wb_products_options.*')
        .from('wb_products_options', 'wb_products')
        .join('wb_products', 'wb_products.prd_idx', '=', 'wb_products_options.prd_idx');
      if (cat_id) { //카테고리
        query = query.where('wb_products.cat_id', cat_id);
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
      console.log(query, 22)
      let result = await query;
      for (let i = 0; i < result.length; i++) {
        let stockInfo = await superModel.getStockQty(result[i]);
        result[i]['가재고'] = stockInfo['가재고'];
        result[i]['주문대기'] = stockInfo['주문대기'];
        // opt_code와 opt_subject를 분리합니다.
        let opt_codes = result[i]['opt_code'].split('|#@#|');
        let opt_subjects = result[i]['opt_subject'].split('|#@#|');
        // 새로운 객체를 만듭니다.
        let newObject = {};
        for (let j = 0; j < opt_codes.length; j++) {
          newObject[opt_subjects[j]] = opt_codes[j];
        }
        result[i]['opt_comb'] = newObject;
      }
      return result
    } catch (e) {
      console.log(e);
      return null;
    }
  }

//옵션 상세 정보 불러오기
productsModel.getOptDetail = async (opt_idx) => {
    try {
        const odata = await db
            .select("*")
            .from('wb_products_options')
            .where('opt_idx', opt_idx)
            .andWhere('opt_status', 'Y')
            .first()
            // .andWhere('prd_idx', prd_idx);

        return odata;
      } catch (e) {
        console.log(e);
        return null;
      }
}

  //옵션재고량 수정
productsModel.editOptStocks = async (stocks) => {
    let updateData = {
        opt_idx: stocks.opt_idx,
        opt_stock_qty: stocks.opt_stock_qty,
        opt_noti_qty: stocks.opt_noti_qty,
        opt_add_price: stocks.opt_add_price
    }
    try {
        const result = await db('wb_products_options')
        .where('opt_idx', stocks.opt_idx)
        .update(updateData);

        return await productsModel.getOptDetail(stocks.opt_idx)
    } catch (error) {
        console.error("Error updating option stocks:", error);
        return null;
    }
}

//진열장 리스트 GET
productsModel.getDisplayList = async () => {
    let displayList = null;
    await db
        .select('PD.*')
        .from('wb_products_display AS PD')
        .where('PD.dsp_status', '<>', 'N')
        .then(rows => {
            displayList = rows;
        })
        .catch((e) => {
            console.log(e);
        });
    return displayList;
}
/** 진열장 show*/
productsModel.getDisplay = async(displayId, page = 0) => { // 페이지 매개변수가 추가되었습니다.
    let products = [];
    let query = db
        .select('PDI.*', 'P.*', 'PD.dsp_title') // 'PD.dsp_title' 필드 추가
        .from('wb_products_display_items AS PDI')
        .where('P.prd_status', '<>', 'N')
        .leftJoin('wb_products_display AS PD', 'PDI.dsp_idx', 'PD.dsp_idx') // Left join 추가
        .join('wb_products AS P', 'PDI.prd_idx', 'P.prd_idx')
        .where('PDI.dsp_idx', displayId);

    if(page > 0) { // 페이지가 0보다 큰 경우 페이지네이션을 적용합니다.
        const itemsPerPage = 4; // 페이지 당 아이템 수
        const offset = (page - 1) * itemsPerPage;
        query = query.limit(itemsPerPage).offset(offset);
    }

    await query.then(rows => {
        products = rows;
        }).catch((e) => {
            console.log(e);
        });

    // 상품 정보가 있을 경우에만 썸네일 정보 가져오기
    for(let product of products) {
        await db
            .select('ATT.att_filepath')
            .from('wb_attach AS ATT')
            .join('wb_products AS P', 'P.prd_thumbnail', 'ATT.att_idx')
            .where('P.prd_idx', product.prd_idx)
            .limit(1)
            .then(rows => {
                if(rows.length > 0) {
                    product.thumbnail_path = rows[0].att_filepath;
                }
            })
            .catch(e => {
                console.error(e);
            });
    }
    return products;
};
// 진열장 바깥 아이템 모델
productsModel.getOutsideDisplay = async(displayId, page = 0) => { // 페이지 매개변수가 추가되었습니다.
    let products = [];
    let query = db
        .select('P.*')
        .from('wb_products AS P')
        .where('P.prd_status', '<>', 'N')
        .whereNotExists(function() {
            this.select('*')
                .from('wb_products_display_items AS PDI')
                .whereRaw('PDI.prd_idx = P.prd_idx')
                .andWhere('PDI.dsp_idx', displayId);
        });

    if(page > 0) { // 페이지가 0보다 큰 경우 페이지네이션을 적용합니다.
        const itemsPerPage = 4; // 페이지 당 아이템 수
        const offset = (page - 1) * itemsPerPage;
        query = query.limit(itemsPerPage).offset(offset);
    }

    await query.then(rows => {
        products = rows;
    }).catch((e) => {
        console.log(e);
    });
    return products;
};
//진열장 추가
productsModel.createDisplay = async(displayData) =>{
    try {
        const existingKey = await db('wb_products_display').where('dsp_key', displayData.dsp_key).first();
        const existingTitle = await db('wb_products_display').where('dsp_title', displayData.dsp_title).first();

        if (existingKey) {
            throw new Error(`A record with dsp_key "${displayData.dsp_key}" already exists.`);
        }

        if (existingTitle) {
            throw new Error(`A record with dsp_title "${displayData.dsp_title}" already exists.`);
        }
        const [result] = await db('wb_products_display').insert({
            dsp_key: displayData.dsp_key,
            dsp_title: displayData.dsp_title,
            reg_datetime: new Date(),
            upd_datetime: new Date(),
        });
        return result;
    }catch (error){
        console.error("진열장 추가 실패:", error);
        return null;
    }
}
//진열장 수정
productsModel.updateDisplay = async (dsp_id,updatedData) => {
    try{
        await db('wb_products_display')
            .where('dsp_idx', dsp_id)
            .update({
            dsp_title: updatedData.dsp_title,
            dsp_status : updatedData.dsp_status,
            upd_datetime: new Date(),
        });
        return true;
    } catch (error) {
        console.error("Error updating product:", error);
        return false;
    }
}
//진열장 삭제
productsModel.deleteDisplay = async (dsp_id) => {
    try{
        await db('wb_products_display')
            .where('dsp_idx', dsp_id)
            .update({
                dsp_status : "N",
                upd_datetime: new Date(),
            });
        return true;
    } catch (error) {
        console.error("Error updating product:", error);
        return false;
    }
}
//진열장에 아이템 추가
productsModel.addItem = async(newItem) =>{
    try{
        const count = await db('wb_products_display_items')
            .where('dsp_idx', newItem.dsp_idx)
            .count('* as count');
        // count + 1 값을 dspi_sort에 할당합니다.
        const dspi_sort = count[0].count + 1;
        // 동일한 dsp_idx와 prd_idx를 가진 항목이 있는지 확인합니다.
        const existingItem = await db('wb_products_display_items')
            .where({
                dsp_idx: newItem.dsp_idx,
                prd_idx: newItem.prd_idx
            })
            .first();
        // 이미 있는 항목이라면, 오류 메시지를 반환합니다.
        if (existingItem) {
            return '이미 존재하는 아이템입니다';
        }
        await db('wb_products_display_items')
            .insert({
                dsp_idx: newItem.dsp_idx,
                prd_idx: newItem.prd_idx,
                dspi_sort : dspi_sort,
                reg_datetime: new Date(),
                //TODO:reg_user 관련로직 필요할 수 있음.
            })
        // 삽입된 행을 다시 조회합니다.
        const insertedItem = await db('wb_products_display_items')
            .where({
                dsp_idx: newItem.dsp_idx,
                prd_idx: newItem.prd_idx,
                dspi_sort : dspi_sort
            }).select('dspi_idx', 'dspi_sort', 'dsp_idx', 'prd_idx')
            .first();
        return insertedItem ;
    }catch (error) {
        console.error(error);
    }
}
//진열장 상품 drop
productsModel.dropItem = async(item) => {
    try {
        const deletedItem = await db('wb_products_display_items')
            .where({
                dsp_idx: item.dsp_idx,
                prd_idx: item.prd_idx
            })
            .del();
        return deletedItem;
    } catch (error) {
        console.error(error);
    }
};
/**
 *찜 목록 가져오기 */
productsModel.getWishList = async (mem_idx, page = 0) => {
    let wishList = [];

    try {
        let query = db.select('P.cat_id', 'P.prd_name', 'P.prd_price', 'PW.*')
            .from('wb_products_wish AS PW')
            .join('wb_products AS P', 'P.prd_idx', '=', 'PW.prd_idx')
            .where('PW.mem_idx', mem_idx);

        if (page > 0) { // 페이지가 0보다 큰 경우 페이지네이션을 적용합니다.
            const itemsPerPage = 4; // 페이지 당 아이템 수
            const offset = (page - 1) * itemsPerPage;
            query = query.limit(itemsPerPage).offset(offset);
        }

        // 찜 목록 조회
        wishList = await query;

        // 상품 정보 할당
        for (let i = 0; i < wishList.length; i++) {
            console.log('wishList[i].prd_idx::')
            console.log(wishList[i].prd_idx)

            const productInfo = await productsModel.getProductById(wishList[i].prd_idx);

            if(!productInfo || productInfo === null){
                wishList[i].thumbnail = null;
                continue;
            }

            console.log('productInfo::')
            console.log(productInfo)

            // 썸네일 정보 할당
            wishList[i].thumbnail = productInfo.thumbnail;
        }
    } catch (e) {
        console.log(e);
        wishList = null;
    }

    return wishList;
}

//찜 상세 가져오기
productsModel.getWishCheck = async(mem_idx, prd_idx) => {
    let wishDetail = null;

    await db
        .select('W.*')
        .from('wb_products_wish AS W')
        .where('mem_idx', mem_idx)
        .andWhere('prd_idx', prd_idx)
        .limit(1)
        .then(rows => {
            wishDetail = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            wishDetail = null;
        });

    return wishDetail;
}


//찜하기
productsModel.addWish = async (mem_idx, prd_idx) =>{
    try {
        const existingItem = await db('wb_products_wish')
            .where({
                mem_idx : mem_idx,
                prd_idx: prd_idx
            }).first();

        if (existingItem) {
            return existingItem;}

        const add = await db('wb_products_wish')
            .insert({
                mem_idx : mem_idx,
                wish_time: new Date(),
                prd_idx : prd_idx
            })

        return add
    }catch (error) {
        console.error(error);
    }
}


//찜삭제
productsModel.dropWish = async (mem_idx, prd_idx) =>{
    try {
        await db('wb_products_wish')
            .where('mem_idx', mem_idx)
            .andWhere('prd_idx', prd_idx)
            .del();

        return true;
    }catch (error){
        console.error(error)
        return false;
    }
}
/** 카테고리*/
productsModel.addCategory = async (catData) => {
    const cartegoryData = {
        cat_parent_id : catData?.cat_parent_id ?? '',
        cat_status : 'Y',
        // cat_sort = 0, cat_skin='', cat_skin_m = '',
        cat_title : catData.cat_title,
        cat_page_rows : catData.cat_page_rows,
        reg_datetime : new Date(),
        upd_datetime : new Date(),
        cat_depth : catData.cat_depth,
        icon_filepath : catData.icon_filepath
    }
    await db
        .insert(cartegoryData)
        .into('wb_products_category')
        .then((insertedId) => {
            newCategoryId  = insertedId;
        })
        .catch((e) => {
            console.log(e);
        });

    return newCategoryId;
}
/** 리뷰*/

//상품 리뷰 베스트 목록
productsModel.getProdReviewBests = async (prd_idx) => {
    let bestList = [];

    await db
        .select('*')
        .from('wb_products_review')
        .where('prd_idx',prd_idx)
        .andWhere('rev_status', '=', 'Y')
        .andWhere('rev_best', '=', 'Y')
        .orderBy('reg_datetime', 'desc')  // reg_datetime을 내림차순으로 정렬
        .then(rows => {
            bestList = rows;
        })
        .catch((e) => {
            console.log(e);
        });

        if(bestList && bestList.length){
            for(let i = 0; i < bestList.length; i++) {
                // 이미지 정보를 가져옵니다.
                await db
                .select('ATT.att_filepath as thumbnail_path', 'ATT.att_idx')
                .from('wb_attach AS ATT')
                .join('wb_products_review AS R', 'R.rev_idx', '=', 'ATT.att_target')
                .where('ATT.att_is_image', 'Y')
                .where('ATT.att_target_type', 'PRODUCTS_REVIEW')
                .where('ATT.att_target', bestList[i].rev_idx)
                .then(rows => {
                    console.log('Rows: ', rows);  // 추가된 코드

                    if (rows.length > 0) {
                        // 이미지 정보가 하나 이상 존재할 경우
                        bestList[i].thumbnail = [{
                            "att_idx": rows[0].att_idx,
                            "att_filepath": rows[0].thumbnail_path
                        }];
                        
                        bestList[i].attach_path = rows.map(row => ({
                            att_idx: row.att_idx,
                            att_filepath: row.thumbnail_path
                        }));
                    } else {
                        bestList[i].thumbnail = null;
                        bestList[i].attach_path = null;
                    }
                })
                .catch((e) => {
                    console.log(e);
                });    
            }
        }

    return bestList;
}

//상품 리뷰 목록
productsModel.getProdReviewList = async(prd_idx, page, keyword) => {
    let reviewList = [];
   
    try {
        let query = db
            .select('R.*')
            .from( 'wb_products_review AS R')
            .where('R.prd_idx',prd_idx)
            .andWhere('R.rev_status', '=', 'Y')

        if (keyword === 'latest') {
            query = query.orderBy('reg_datetime', 'desc');
        } else if (keyword === 'score') {
            query = query.orderBy('rev_score', 'desc');
        } else if (keyword === 'photo') {
            query = query.where('rev_photo', '=', 'Y');
        }

            // .leftJoin('wb_attach AS ATT', 'P.prd_thumbnail', 'ATT.att_idx');

        if (page > 0) { // 페이지가 0보다 큰 경우 페이지네이션을 적용합니다.
            const itemsPerPage = 4; // 페이지 당 아이템 수
            const offset = (page - 1) * itemsPerPage;
            query = query.limit(itemsPerPage).offset(offset);
        }
        reviewList = await query;

        // console.log('reviewList.length:::' + reviewList.length)

        if(reviewList && reviewList.length > 0){
            for(let i = 0; i < reviewList.length; i++) {
                // 이미지 정보를 가져옵니다.
                await db
                .select('ATT.att_filepath as thumbnail_path', 'ATT.att_idx')
                .from('wb_attach AS ATT')
                .join('wb_products_review AS R', 'R.rev_idx', '=', 'ATT.att_target')
                .where('ATT.att_is_image', 'Y')
                .where('ATT.att_target_type', 'PRODUCTS_REVIEW')
                .where('ATT.att_target', reviewList[i].rev_idx)
                .then(rows => {
                    console.log('Rows: ', rows);  // 추가된 코드

                    if (rows.length > 0) {
                        // 이미지 정보가 하나 이상 존재할 경우
                        reviewList[i].thumbnail = [{
                            "att_idx": rows[0].att_idx,
                            "att_filepath": rows[0].thumbnail_path
                        }];

                        reviewList[i].attach_path = rows.map(row => ({
                            att_idx: row.att_idx,
                            att_filepath: row.thumbnail_path
                        }));
                    } else {
                        reviewList[i].thumbnail = null;
                        reviewList[i].attach_path = null;
                    }
                })
                .catch((e) => {
                    console.log(e);
                });    
            }
        }
    } catch (e) {
        console.log(e);
        reviewList = null;
    }

    return reviewList;
}

//상품 리뷰 개별 불러오기
productsModel.getReviewDetail = async (rev_idx) => {
    let review = null;

    await db
    .select('R.*') // 기존 상품 정보만 먼저 가져옵니다.
    .from('wb_products_review AS R')
    .where("rev_idx", rev_idx)
        .where("rev_idx", rev_idx)
        .andWhere("rev_status", '=', 'Y')
        .limit(1)
        .then(rows => {
            review = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            review = null;
        });

    // 상품 정보가 있을 경우에만 추가 정보 가져오기
    if (review) {
        // 이미지 정보를 가져옵니다.
        await db
        .select('ATT.att_filepath as thumbnail_path', 'ATT.att_idx')
        .from('wb_attach AS ATT')
        .join('wb_products_review AS R', 'R.rev_idx', '=', 'ATT.att_target')
        .where('ATT.att_is_image', 'Y')
        .where('ATT.att_target_type', 'PRODUCTS_REVIEW')
        .where('ATT.att_target', rev_idx)
        .then(rows => {
            console.log('Rows: ', rows);  // 추가된 코드
            if (rows.length > 0) {
                // 이미지 정보가 하나 이상 존재할 경우
                review.thumbnail = [
                    { att_idx: rows[0].att_idx,
                        att_filepath: rows[0].thumbnail_path }
                ];
                
                review.attach_path = rows.map(row => ({
                    att_idx: row.att_idx,
                    att_filepath: row.thumbnail_path
                }));
            } else {
                review.thumbnail = null;
                review.attach_path = null;
            }
        })
        .catch((e) => {
            console.log(e);
        });
    }

    return review;
}

//상품 리뷰 작성하기
productsModel.postReview = async (rev) => {
    const revdata = {
        od_id : rev.od_id,
        prd_idx : rev.prd_idx,
        mem_idx : rev.mem_idx,
        rev_status : 'Y',
        rev_score : rev.rev_score,
        reg_user : rev.reg_user,
        rev_content : rev.rev_content
    }
    let revI = await db.insert(revdata).into('wb_products_review')
        .catch((e) => {
            console.log(e);
        });
    return revI
}

//상품 리뷰 수정하기
productsModel.updateProdReview = async (updateReviewItem) => {
    await db('wb_products_review')
            .where('rev_idx', updateReviewItem.rev_idx)
            .andWhere('rev_status', '=' ,'Y')
            // .andWhere('mem_idx', updateReviewItem.mem_idx)
            .update({
                rev_score: updateReviewItem.rev_score,
                rev_photo: updateReviewItem.rev_photo,
                rev_status: 'Y',
                rev_content: updateReviewItem.rev_content,
                upd_user: updateReviewItem.upd_user,
                upd_datetime: currentDatetime // 현재 날짜 및 시간 삽입
            })
            .catch((e) => {
                console.log(e);
                return null;
            });

    // 업데이트된 내용(id와 title)을 반환합니다.
    return await productsModel.getReviewDetail(updateReviewItem.rev_idx) // 또는 필요에 따라 업데이트된 내용 반환
}

//상품 리뷰 삭제하기
productsModel.deleteReview = async(rev_idx, mem_idx) => {
    await db('wb_products_review')
    .where('rev_idx', rev_idx)
    .andWhere('mem_idx', mem_idx)
    .update({
        rev_status: 'N',
        rev_best: 'N',
        rev_photo: 'N'
    })
    .catch((e) => {
        console.log(e);
        return null;
    });

    return { deleteIdx: rev_idx }
}

/**상품문의 --------------------------------------------- */
//상품 문의 작성하기
productsModel.makeQa = async (qa)=>{
    const qadata={
        prd_idx : qa.prd_idx,
        mem_idx :qa.mem_idx,
        qa_secret : qa.qa_secret,
        qa_content : qa.qa_content,
        reg_datetime : new Date()
    }
    let qaI = await db.insert(qadata).into('wb_products_qna')
        .catch((e) => {
            console.log(e);
        });
    return qadata
}

//상품 문의 목록
productsModel.getProdQnaList = async(mem_idx, prd_idx, page) => {
    let qnaList = [];

    try {
        let query = db
            .select('Q.*', 'M.mem_nickname')
            .from( 'wb_products_qna AS Q')
            .join('wb_member AS M', 'Q.mem_idx', 'M.mem_idx') // test_member 테이블과 join
            .where('Q.prd_idx',prd_idx)
            .andWhere('Q.qa_status', '=', 'Y')
            // .leftJoin('wb_attach AS ATT', 'P.prd_thumbnail', 'ATT.att_idx');

        if (page > 0) { // 페이지가 0보다 큰 경우 페이지네이션을 적용합니다.
            const itemsPerPage = 4; // 페이지 당 아이템 수
            const offset = (page - 1) * itemsPerPage;
            query = query.limit(itemsPerPage).offset(offset);
        }

    qnaList = await query;

    if (qnaList && qnaList.length) {
        for (let i = 0; i < qnaList.length; i++) {
            if (qnaList[i].qa_secret === 'Y' && qnaList[i].mem_idx !== mem_idx) {
                qnaList[i].qa_content = '비밀글입니다';
                qnaList[i].qa_a_content = '비밀글입니다';
            }
        }
    }
    
    if(qnaList && qnaList.length){
        for(let i = 0; i < qnaList.length; i++) {
            // 이미지 정보를 가져옵니다.
            await db
            .select('ATT.att_filepath as thumbnail_path', 'ATT.att_idx')
            .from('wb_attach AS ATT')
            .join('wb_products_qna AS R', 'R.qa_idx', '=', 'ATT.att_target')
            .where('ATT.att_is_image', 'Y')
            .where('ATT.att_target_type', 'PRODUCTS_QNA')
            .where('ATT.att_target', qnaList[i].qa_idx)
            .then(rows => {
                console.log('Rows: ', rows);  // 추가된 코드
                if (rows.length > 0) {
                    // 이미지 정보가 하나 이상 존재할 경우
                    qnaList[i].thumbnail = [{
                        "att_idx": rows[0].att_idx,
                        "att_filepath": rows[0].thumbnail_path
                    }];

                    qnaList[i].attach_path = rows.map(row => ({
                        att_idx: row.att_idx,
                        att_filepath: row.thumbnail_path
                    }));
                } else {
                    qnaList[i].thumbnail = null;
                    qnaList[i].attach_path = null;
                }
            })
            .catch((e) => {
                console.log(e);
            });    
        }
    }
    } catch (e) {
        console.log(e);
        qnaList = null;
    }

    return qnaList;
}

//상품 문의 개별 불러오기
productsModel.getQnaDetail = async (qa_idx) => {
    let qna = null;

    await db
    .select('Q.*', 'mem.mem_nickname') // 기존 상품 정보만 먼저 가져옵니다.
    .from('wb_products_qna AS Q')
    .leftJoin('wb_member AS mem', 'Q.mem_idx', 'mem.mem_idx')
    .where("qa_idx", qa_idx)
        .where("qa_idx", qa_idx)
        .andWhere("qa_status", '=', 'Y')
        .limit(1)
        .then(rows => {
            qna = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            qna = null;
        });

    // 상품 정보가 있을 경우에만 추가 정보 가져오기
    if (qna) {
        // 이미지 정보를 가져옵니다.
        await db
        .select('ATT.att_filepath as thumbnail_path', 'ATT.att_idx')
        .from('wb_attach AS ATT')
        .join('wb_products_qna AS Q', 'Q.qa_idx', '=', 'ATT.att_target')
        .where('ATT.att_is_image', 'Y')
        .where('ATT.att_target_type', 'PRODUCTS_QNA')
        .where('ATT.att_target', qa_idx)
        .then(rows => {
            console.log('Rows: ', rows);  // 추가된 코드
            if (rows.length > 0) {
                // 이미지 정보가 하나 이상 존재할 경우
                qna.thumbnail = [
                    { att_idx: rows[0].att_idx,
                        att_filepath: rows[0].thumbnail_path }
                ];
                
                qna.attach_path = rows.map(row => ({
                    att_idx: row.att_idx,
                    att_filepath: row.thumbnail_path
                }));
            } else {
                qna.thumbnail = null;
                qna.attach_path = null;
            }
        })
        .catch((e) => {
            console.log(e);
        });
    }

    return qna;
}

//상품 문의 수정하기
productsModel.updateProdQna = async (updateQnaItem) => {
    await db('wb_products_qna')
            .where('qa_idx', updateQnaItem.qa_idx)
            .andWhere('qa_status', '=' ,'Y')
            .andWhere('mem_idx', updateQnaItem.mem_idx)
            .update({
                qa_status: 'Y',
                qa_content: updateQnaItem.qa_content,
                qa_secret: updateQnaItem.qa_secret
            })
            .catch((e) => {
                console.log(e);
                return null;
            });

    return await productsModel.getQnaDetail(updateQnaItem.qa_idx) // 또는 필요에 따라 업데이트된 내용 반환
}

//상품 리뷰 삭제하기
productsModel.deleteQna = async(qa_idx, mem_idx) => {
    await db('wb_products_qna')
    .where('qa_idx', qa_idx)
    .andWhere('mem_idx', mem_idx)
    .update({
        qa_status: 'N',
    })
    .catch((e) => {
        console.log(e);
        return null;
    });

    return { deleteIdx: qa_idx }
}


/* --------------------------------------- */


//신규 상품 등록 처리
productsModel.insertNewProduct = async (data) => {
    try {
        const result = await db('wb_products')
            .insert(data);
        
        const prdIdx = result[0];

        return prdIdx;
    } catch (e) {
        console.log(e);
        return null;
    }
};


// 파일 정보를 wb_attach 테이블에 추가하는 함수
productsModel.insertAttachment = async (data) => {
    return await db('wb_attach').insert(data);
};

// 가장 최근에 추가된 att_idx 값을 가져오는 함수 : 상품 수정하기에 사용됨.
productsModel.getAttachmentId = async (prd_idx) => {
    const result = await db('wb_products AS P')
        .where('P.prd_idx', prd_idx)
        .select('P.prd_thumbnail as attId');
    return result[0].attId;
};
// // 파일 정보 삭제
// productsModel.deleteAttachment = async (fileId) => {
//     return db('wb_attach').where('id', fileId).delete();
// };
module.exports = productsModel