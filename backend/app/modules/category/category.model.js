const categoryModel = {};
const db = database();

/** 카테고리*/
categoryModel.addCat = async (addCatData) => {
    let newCategoryId = null;
    
    const cartegoryData = {
        cat_parent_id : addCatData?.cat_parent_id ?? '',
        cat_status : 'Y',
        // cat_sort = 0, cat_skin='', cat_skin_m = '',
        cat_title : addCatData.cat_title,
        cat_page_rows : addCatData.cat_page_rows,
        reg_datetime : new Date(),
        upd_datetime : new Date(),
        cat_depth : addCatData.cat_depth,
        icon_filepath : addCatData.icon_filepath
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
//카테고리 id로 상품 목록 불러오기
categoryModel.getCatItemsById = async (cat_id, page = 0) => {
    let catRow = null;
    try {
        let query = db
            .select('P.*','ATT.att_filepath')
            .from( 'wb_products AS P','wb_attach AS ATT')
            .where('P.cat_id',cat_id)
            .leftJoin('wb_attach AS ATT', 'P.prd_thumbnail', 'ATT.att_idx');

        if (page > 0) { // 페이지가 0보다 큰 경우 페이지네이션을 적용합니다.
            const itemsPerPage = 4; // 페이지 당 아이템 수
            const offset = (page - 1) * itemsPerPage;
            query = query.limit(itemsPerPage).offset(offset);
        }

        catRow = await query;
    } catch (e) {
        console.log(e);
        catRow = null;
    }

    return catRow;
}

//부모 카테고리 id로 카테고리 목록 불러오기
categoryModel.getLowerCatListById = async (cat_parent_id) => {
    let cats = null
    cats = await db
        .select('*')
        .from('wb_products_category')
        .where('cat_parent_id', cat_parent_id)
        .andWhere('cat_status', '=', 'Y')
        .catch((e) => {
            console.log(e);
            cats = null;
        });
    return cats;
}


//카테고리에 등록된 상품 목록 불러오기
categoryModel.getProdsByParentId = async(cat_id) => {
    let products = [];

    try{
        await db
            .select('P.*')
            .from('wb_products AS P')
            .where('P.cat_id', cat_id)
            .whereNot('P.prd_status','N')
            .then(rows => {
                products = rows;
            })
            .catch((e) => {
                console.log(e);
            });

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

//카테고리 파일 검증
categoryModel.getCatById = async (cat_id) => {
    const db = database();
    let categoryById = null;

    await db
        .select('C.*')
        .from('wb_products_category AS C')
        .where('cat_id', '=', cat_id)
        .andWhere('cat_status', '=' ,'Y')
        .limit(1)
        .then(rows => {
            categoryById = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            categoryById = null;
        });

    return categoryById;
};

//카테고리 목록 조회
categoryModel.getCatList = async () => {
    let cats = null
    cats = await db
        .select('*')
        .from('wb_products_category')
        .where('cat_status', '=', 'Y')
        .catch((e) => {
            console.log(e);
            cats = null;
        });
    return cats;
}

//카테고리 뎁스 목록 불러오기
categoryModel.getCatDepthList = async(depthInt, parentId) => {
    let depthList = null;

    await db
        .select('*')
        .from('wb_products_category')
        .where('cat_depth', '=', depthInt)
        .andWhere('cat_status', '=', 'Y')
        .andWhere('cat_parent_id', '=', parentId)
        .then(rows => {
            depthList = (rows.length > 0) ? rows : [];
        })
        .catch((e) => {
            console.log(e);
            depthList = null;
        });
    return depthList;
}

/* 카테고리 내용 수정 */
categoryModel.updateCat = async (updateCatItem) => {
    const db = database();

    await db('wb_products_category')
        .where('cat_id', updateCatItem.cat_id)
        .andWhere('cat_status', '=' ,'Y')
        .update({
            cat_parent_id: updateCatItem.cat_parent_id,
            cat_depth: updateCatItem.cat_depth,
            cat_title: updateCatItem.cat_title,
            icon_filepath: updateCatItem.icon_filepath,
            upd_user: updateCatItem.upd_user,
            upd_datetime: new Date() // 현재 날짜 및 시간 삽입
        })
        .catch((e) => {
            console.log(e);
            return null;
        });

    // 업데이트된 내용(id와 title)을 반환합니다.
    return { "cat_id": updateCatItem.cat_id, "cat_title": updateCatItem.cat_title}; // 또는 필요에 따라 업데이트된 내용 반환
};

/** 모델 내보내기 */
module.exports = categoryModel