const healthinfoModel = {};

const currentDatetime = new Date(); // 현재 날짜 및 시간 얻기

/*카테고리 등록*/
healthinfoModel.addCategory = async (addCategoryItem) => {
  const db = database();
  // let newCategory = null;

  // 조건에 맞는 행을 선택
  const cartegoryData = {
    cat_parent_id: addCategoryItem.cat_parent_id,
    cat_depth: addCategoryItem.cat_depth,
    cat_title: addCategoryItem.cat_title,
    icon_filepath: addCategoryItem.icon_filepath,
    reg_user: addCategoryItem.reg_user,
    reg_datetime: currentDatetime
  }

  await db
    .insert(cartegoryData)
    .into('wb_health_info_category')
    .then((insertedId) => {
      newCategoryId = insertedId;
    })
    .catch((e) => {
      console.log(e);
    });

  return newCategoryId;
};

/*카테고리 아이템 한개 가져오기*/
healthinfoModel.getCategoryItem = async (cat_id) => {
  let result;
  const db = database();
  console.log(cat_id);
  try {
    await db
      .select('H_C.*')
      .from('wb_health_info_category as H_C')
      .where('H_C.cat_idx', cat_id)
      .then(rows => {
        result = rows;
      })


    return result;

  } catch (e) {
    return null;
  }
}

/*부모 ID에 따른 카테고리 목록 불러오기*/
healthinfoModel.getCatListById = async (cat_parent_id) => {
  const db = database();
  let cartegoryList = null;

  if (cat_parent_id === 'all') {
    // 'all'인 경우 전체 배열을 불러옴
    await db
      .select('*')
      .from('wb_health_info_category')
      .where('cat_status', '=', 'Y')
      .then(rows => {
        cartegoryList = (rows.length > 0) ? rows : [];
      })
      .catch((e) => {
        console.log(e);
        cartegoryList = null;
      });
  } else {
    // 'all'이 아닌 경우 지정한 조건에 따라 필터링하여 데이터를 불러옴
    await db
      .select('*')
      .from('wb_health_info_category')
      .where('cat_parent_id', '=', cat_parent_id)
      .andWhere('cat_status', '=', 'Y')
      .then(rows => {
        cartegoryList = (rows.length > 0) ? rows : [];
      })
      .catch((e) => {
        console.log(e);
        cartegoryList = null;
      });
  }

  return cartegoryList;
};

/* 카테고리 이름 검색 */
healthinfoModel.getCatListByKeyword = async (keyword) => {
  const db = database();
  let cartegoryList = null;

  await db
    .select('*')
    .from('wb_health_info_category')
    .where('cat_title', 'LIKE', `%${keyword}%`)
    .andWhere('cat_status', '=', 'Y')
    .then(rows => {
      cartegoryList = (rows.length > 0) ? rows : [];
    })
    .catch((e) => {
      console.log(e);
      cartegoryList = null;
    });

  return cartegoryList;
};

/* 카테고리 상세 불러오기 */
healthinfoModel.getCatDetailById = async (cat_idx) => {
  const db = database();
  let categoryById = null;

  await db
    .select('C.*')
    .from('wb_health_info_category AS C')
    .where('cat_idx', '=', cat_idx)
    .andWhere('cat_status', '=', 'Y')
    .limit(1)
    .then(rows => {
      categoryById = (rows.length > 0) ? rows[0] : [];
    })
    .catch((e) => {
      console.log(e);
      categoryById = null;
    });

  return categoryById;
};

/* 카테고리 내용 수정 */
healthinfoModel.updateCategoryItem = async (updateCatItem) => {
  const db = database();

  await db('wb_health_info_category')
    .where('cat_idx', updateCatItem.cat_idx)
    .andWhere('cat_status', '=', 'Y')
    .update({
      cat_parent_id: updateCatItem.cat_parent_id,
      cat_depth: updateCatItem.cat_depth,
      cat_title: updateCatItem.cat_title,
      icon_filepath: updateCatItem.icon_filepath,
      upd_user: updateCatItem.upd_user,
      upd_datetime: currentDatetime // 현재 날짜 및 시간 삽입
    })
    .catch((e) => {
      console.log(e);
      return null;
    });

  // 업데이트된 내용(id와 title)을 반환합니다.
  return {"cat_idx": updateCatItem.cat_idx, "cat_title": updateCatItem.cat_title}; // 또는 필요에 따라 업데이트된 내용 반환
};

/*실존하는 카테고리인지 검증*/
healthinfoModel.checkCatIdExist = async (checkArray) => {
  const db = database();

  for (const item of checkArray) {
    const catId = item.cat_idx;
    console.log('검증할 catId의 값은? ' + catId);

    const category = await db('wb_health_info_category')
      .where('cat_idx', catId)
      .andWhere('cat_status', '=', 'Y')
      .first(); // 첫 번째 일치하는 행 가져오기

    if (!category) {
      // 만약 카테고리가 실존하지 않거나 상태가 'Y'가 아닌 경우
      return false; // false를 반환하여 검증 실패를 나타냅니다.
    }
  }

  return true; // 모든 카테고리가 유효하면 true를 반환합니다.
};

/* ------------------------------------------ */

/* 상세 글 등록  */
healthinfoModel.addInfo = async (addInfoItem) => {
  const db = database();
  let newInfoId = null;

  // 조건에 맞는 행을 선택
  const infoData = {
    cat_idx: addInfoItem.cat_idx,
    disease_name: addInfoItem.disease_name,
    disease_define: addInfoItem.disease_define,
    disease_cause: addInfoItem.disease_cause,
    disease_symp: addInfoItem.disease_symp,
    health_func_food: JSON.stringify(addInfoItem.health_func_food), // 배열을 JSON 문자열로 변환
    health_food: JSON.stringify(addInfoItem.health_food), // 배열을 JSON 문자열로 변환
    rec_recipe: JSON.stringify(addInfoItem.rec_recipe), // 배열을 JSON 문자열로 변환
    rec_exercise: JSON.stringify(addInfoItem.rec_exercise), // 배열을 JSON 문자열로 변환
    reg_user: addInfoItem.reg_user,
    reg_datetime: currentDatetime
  }

  await db
    .insert(infoData)
    .into('wb_health_info')
    .then((insertedId) => {
      newInfoId = insertedId;
    })
    .catch((e) => {
      console.log(e);
    });

  return newInfoId;
};

/*카테고리 ID에 따른 info 상세 글 목록 불러오기*/
healthinfoModel.getInfoListById = async (cat_idx) => {
  const db = database();
  let infoList = null;

  if (cat_idx === 'all') {
    // 'all'인 경우 전체 배열을 불러옴
    await db
      .select('*')
      .from('wb_health_info')
      .where('info_status', '=', 'Y')
      .then(rows => {
        infoList = (rows.length > 0) ? rows : [];
      })
      .catch((e) => {
        console.log(e);
        infoList = null;
      });
  } else {
    // 조건에 맞는 행을 선택
    await db
      .select('*')
      .from('wb_health_info')
      .where('cat_idx', '=', cat_idx) // od_id가 orderId와 동일한 행을 선택
      .andWhere('info_status', '=', 'Y')
      .then(rows => {
        infoList = (rows.length > 0) ? rows : [];
      })
      .catch((e) => {
        console.log(e);
        infoList = null;
      });
  }

  return infoList;
};

/* 상세 글 불러오기 */
healthinfoModel.getInfoById = async (cat_idx) => {
  const db = database();
  let infoById = null;

  await db
    .select('I.*')
    .from('wb_health_info AS I')
    .where('cat_idx', '=', cat_idx)
    .andWhere('info_status', '=', 'Y')
    .limit(1)
    .then(rows => {
      if (rows.length > 0) {
        const row = rows[0];
        // JSON 문자열을 JavaScript 배열로 변환
        row.health_func_food = JSON.parse(row.health_func_food);
        row.health_food = JSON.parse(row.health_food);
        row.rec_recipe = JSON.parse(row.rec_recipe);
        row.rec_exercise = JSON.parse(row.rec_exercise);
        infoById = row;
      } else {
        infoById = null;
      }
    })
    .catch((e) => {
      console.log(e);
      infoById = null;
    });
  return infoById;
};

/* 상세 글 수정(내용 + 카테고리) */
healthinfoModel.updateInfoItem = async (updateInfoItem) => {
  const db = database();

  await db('wb_health_info')
    .where('info_idx', updateInfoItem.info_idx)
    .andWhere('info_status', '=', 'Y')
    .update({
      cat_idx: updateInfoItem.cat_idx,
      disease_name: updateInfoItem.disease_name,
      disease_define: updateInfoItem.disease_define,
      disease_cause: updateInfoItem.disease_cause,
      disease_symp: updateInfoItem.disease_symp,
      health_func_food: JSON.stringify(updateInfoItem.health_func_food), // 배열을 JSON 문자열로 변환
      health_food: JSON.stringify(updateInfoItem.health_food), // 배열을 JSON 문자열로 변환
      rec_recipe: JSON.stringify(updateInfoItem.rec_recipe), // 배열을 JSON 문자열로 변환
      rec_exercise: JSON.stringify(updateInfoItem.rec_exercise), // 배열을 JSON 문자열로 변환
      upd_user: updateInfoItem.upd_user,
      upd_datetime: currentDatetime // 현재 날짜 및 시간 삽입
    })
    .catch((e) => {
      console.log(e);
      return null;
    });

  // 업데이트된 내용(id와 title)을 반환합니다.
  return await healthinfoModel.getInfoById(updateInfoItem.cat_idx); // 또는 필요에 따라 업데이트된 내용 반환
};

/* 상세 글의 정보 컬럼별 삭제 처리 */
healthinfoModel.getInfoListForDelInfoIdx = async(column_name, deleted_idx) => {
  const db = database();
  let infoList = null;

    await db
      .select('*')
      .from('wb_health_info')
      .where('info_status', '=', 'Y')
      .andWhere(function() {
        this.where(column_name, 'LIKE', `%[${deleted_idx}]%`)
            .orWhere(column_name, 'LIKE', `%,${deleted_idx},%`)
            .orWhere(column_name, 'LIKE', `%,${deleted_idx}]%`)
            .orWhere(column_name, 'LIKE', `%[${deleted_idx},%`);
      })
    
      .then(rows => {
        infoList = (rows.length > 0) ? rows : [];
      })
      .catch((e) => {
        console.log(e);
        infoList = null;
      });

  return infoList;
}

/* 건강 기능 식품------------------------------------------ */
// 건강 기능 식품 등록
healthinfoModel.addFuncFood = async (addFuncFoodItem) => {
  const db = database();
  let newFuncFoodId = null;

  // 조건에 맞는 행을 선택
  const funcFoodData = {
    food_name: addFuncFoodItem.food_name,
    thumb_filepath: addFuncFoodItem.thumb_filepath,
    food_content: addFuncFoodItem?.food_content ? addFuncFoodItem.food_content : '',
    reg_user: addFuncFoodItem.reg_user,
    reg_date: currentDatetime
  }

  await db
    .insert(funcFoodData)
    .into('wb_health_func_food')
    .then((insertedId) => {
      newFuncFoodId = insertedId;
    })
    .catch((e) => {
      console.log(e);
    });

  return newFuncFoodId;
};

//건강 기능 식품 목록 불러오기
healthinfoModel.getFuncFoodList = async (keyword) => {
  const db = database();
  let funcFoodList = null;

  if (keyword === 'all') {
    // 'all'인 경우 전체 배열을 불러옴
    await db
      .select('*')
      .from('wb_health_func_food')
      .where('food_status', '=', 'Y')
      .then(rows => {
        funcFoodList = (rows.length > 0) ? rows : [];
      })
      .catch((e) => {
        console.log(e);
        funcFoodList = null;
      });
  } else {
    // 'all'이 아닌 경우 지정한 조건에 따라 필터링하여 데이터를 불러옴
    await db
      .select('*')
      .from('wb_health_func_food')
      .andWhere(function () {
        this.where('food_name', 'LIKE', `%${keyword}%`)
          .orWhere('food_content', 'LIKE', `%${keyword}%`);
      })
      .andWhere('food_status', '=', 'Y')
      .then(rows => {
        funcFoodList = (rows.length > 0) ? rows : [];
      })
      .catch((e) => {
        console.log(e);
        funcFoodList = null;
      });
  }

  return funcFoodList;
}

//건강 기능 식품 상세 불러오기
healthinfoModel.getFuncFoodInfoById = async (food_idx) => {
  const db = database();
  let funcFoodById = null;

  await db
    .select('H.*')
    .from('wb_health_func_food AS H')
    .where('food_idx', '=', food_idx)
    .andWhere('food_status', '=', 'Y')
    .limit(1)
    .then(rows => {
      funcFoodById = (rows.length > 0) ? rows[0] : [];
    })
    .catch((e) => {
      console.log(e);
      funcFoodById = null;
    });
  return funcFoodById;
};

//건강 기능 식품 수정
healthinfoModel.updateFuncFoodItem = async (updateFuncFoodItem) => {
  const db = database();

  await db('wb_health_func_food')
    .where('food_idx', updateFuncFoodItem.food_idx)
    .andWhere('food_status', '=', 'Y')
    .update({
      food_name: updateFuncFoodItem.food_name,
      thumb_filepath: updateFuncFoodItem.thumb_filepath,
      food_content: updateFuncFoodItem?.food_content ? updateFuncFoodItem.food_content : '',
      upd_date: currentDatetime // 현재 날짜 및 시간 삽입
    })
    .catch((e) => {
      console.log(e);
      return null;
    });

  // 업데이트된 내용(id와 title)을 반환합니다.
  return await healthinfoModel.getFuncFoodInfoById(updateFuncFoodItem.food_idx); // 또는 필요에 따라 업데이트된 내용 반환
};

/* 건강 식품------------------------------------------ */
//건강 식품 등록
healthinfoModel.addFood = async (addFoodItem) => {
  const db = database();
  let newFoodId = null;

  // 조건에 맞는 행을 선택
  const foodData = {
    reg_user: addFoodItem.reg_user,
    reg_date: currentDatetime
  }

  await db
    .insert(foodData)
    .into('wb_health_food')
    .then((insertedId) => {
      newFoodId = insertedId;
    })
    .catch((e) => {
      console.log(e);
    });

  return newFoodId;
};

//건강 식품 목록 불러오기
healthinfoModel.getFoodList = async (keyword) => {
  const db = database();
  let foodList = null;

  if (keyword === 'all') {
    // 'all'인 경우 전체 배열을 불러옴
    await db
      .select('*')
      .from('wb_health_food')
      .where('food_status', '=', 'Y')
      .then(rows => {
        foodList = (rows.length > 0) ? rows : [];
      })
      .catch((e) => {
        console.log(e);
        foodList = null;
      });
  } else {
    // 'all'이 아닌 경우 지정한 조건에 따라 필터링하여 데이터를 불러옴
    await db
      .select('*')
      .from('wb_health_food')
      .andWhere(function () {
        this.where('food_name', 'LIKE', `%${keyword}%`)
          .orWhere('food_summary', 'LIKE', `%${keyword}%`)
      })
      .andWhere('food_status', '=', 'Y')
      .then(rows => {
        foodList = (rows.length > 0) ? rows : [];
      })
      .catch((e) => {
        console.log(e);
        foodList = null;
      });
  }

  if (foodList || foodList.length > 0) {

    for (let i = 0; i < foodList.length; i++) {

      const food_idx = foodList[i].food_idx;
      const icon_idx = foodList[i].icon_idx;
      const thumb_idx = foodList[i].thumb_idx;
      console.log('food_idx: ' + food_idx);
      console.log('icon_idx: ' + icon_idx);
      console.log('thumb_idx: ' + thumb_idx);

      // 이미지 정보를 가져옵니다.
      // 아이콘 이미지 정보 가져오기
      if (icon_idx !== null) {
        const iconImageRows = await db
          .select('ATT.att_filepath', 'ATT.att_idx')
          .from('wb_attach AS ATT')
          .where('ATT.att_idx', icon_idx)
          .andWhere('ATT.att_target_type', 'HEALTH_INFO_FOOD')
          .andWhere('ATT.att_target', food_idx);

        if (iconImageRows.length > 0) {
          foodList[i].icon_filepath = iconImageRows[0].att_filepath;
        }
      }

      // 썸네일 이미지 정보 가져오기
      if (thumb_idx !== null) {
        const thumbImageRows = await db
          .select('ATT.att_filepath', 'ATT.att_idx')
          .from('wb_attach AS ATT')
          .where('ATT.att_idx', thumb_idx)
          .andWhere('ATT.att_target_type', 'HEALTH_INFO_FOOD')
          .andWhere('ATT.att_target', food_idx);

        if (thumbImageRows.length > 0) {
          foodList[i].thumb_filepath = thumbImageRows[0].att_filepath;
        }
      }
    }

  }

  return foodList;
}

//건강 식품 상세 불러오기
healthinfoModel.getFoodInfoById = async (food_idx) => {
  const db = database();
  let foodById = null;

  await db
    .select('H.*')
    .from('wb_health_food AS H')
    .where('food_idx', '=', food_idx)
    .whereNot('food_status', 'N')
    .limit(1)
    .then(async (rows) => {
      if (rows.length > 0) {
        foodById = rows[0];

        // 아이콘 이미지 정보 가져오기
        if (foodById.icon_idx !== null) {
          const iconImageRows = await db
            .select('ATT.att_filepath', 'ATT.att_idx')
            .from('wb_attach AS ATT')
            .where('ATT.att_idx', foodById.icon_idx)
            .andWhere('ATT.att_target_type', 'HEALTH_INFO_FOOD')
            .andWhere('ATT.att_target', foodById.food_idx);

          if (iconImageRows.length > 0) {
            foodById.icon_filepath = iconImageRows[0].att_filepath;
          }
        }

        // 썸네일 이미지 정보 가져오기
        if (foodById.thumb_idx !== null) {
          const thumbImageRows = await db
            .select('ATT.att_filepath', 'ATT.att_idx')
            .from('wb_attach AS ATT')
            .where('ATT.att_idx', foodById.thumb_idx)
            .andWhere('ATT.att_target_type', 'HEALTH_INFO_FOOD')
            .andWhere('ATT.att_target', foodById.food_idx);

          if (thumbImageRows.length > 0) {
            foodById.thumb_filepath = thumbImageRows[0].att_filepath;
          }
        }

      }
    })
    .catch((e) => {
      console.log(e);
      foodById = null;
    });

  if (foodById) {
    // 이미지 정보를 가져옵니다.
    await db
      .select('ATT.att_filepath as thumbnail_path', 'ATT.att_idx')
      .from('wb_attach AS ATT')
      .join('wb_health_food AS H', 'H.food_idx', '=', 'ATT.att_target')
      .where('ATT.att_is_image', 'Y')
      .where('ATT.att_target_type', 'HEALTH_INFO_FOOD')
      .where('ATT.att_target', food_idx)
      .then(rows => {
        console.log('Rows: ', rows);  // 추가된 코드
        if (rows.length > 0) {
          foodById.attach_path = rows.map(row => ({
            att_idx: row.att_idx,
            att_filepath: row.thumbnail_path
          }));
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }

  return foodById;
};

//건강 기능 식품 수정
healthinfoModel.updateFoodItem = async (updateFoodItem) => {
  const db = database();

  await db('wb_health_food')
    .where('food_idx', updateFoodItem.food_idx)
    .andWhereNot('food_status', '=', 'N')
    .update({
      food_name: updateFoodItem.food_name,
      food_status: updateFoodItem?.food_status ? updateFoodItem.food_status : 'Y',
      icon_idx: updateFoodItem.icon_idx,
      thumb_idx: updateFoodItem.thumb_idx,
      food_summary: JSON.stringify(updateFoodItem.food_summary),
      upd_date: currentDatetime // 현재 날짜 및 시간 삽입
    })
    .catch((e) => {
      console.log(e);
      return null;
    });

  // 업데이트된 내용(id와 title)을 반환합니다.
  return await healthinfoModel.getFoodInfoById(updateFoodItem.food_idx); // 또는 필요에 따라 업데이트된 내용 반환
};

/* 추천 레시피------------------------------------------ */
//추천 레시피 등록
healthinfoModel.addRecipe = async (addRecipeItem) => {
  const db = database();
  let newRecipeId = null;

  // 조건에 맞는 행을 선택
  const recipeData = {
    rec_name: addRecipeItem.rec_name,
    thumb_filepath: addRecipeItem.thumb_filepath,
    reg_user: addRecipeItem.reg_user,
    reg_date: currentDatetime
  }

  await db
    .insert(recipeData)
    .into('wb_health_recipe')
    .then((insertedId) => {
      newRecipeId = insertedId;
    })
    .catch((e) => {
      console.log(e);
    });

  return newRecipeId;
};

//추천 레시피 목록 불러오기
healthinfoModel.getRecipeList = async (keyword) => {
  const db = database();
  let recipeList = null;

  if (keyword === 'all') {
    // 'all'인 경우 전체 배열을 불러옴
    await db
      .select('*')
      .from('wb_health_recipe')
      .where('rec_status', '=', 'Y')
      .then(rows => {
        recipeList = (rows.length > 0) ? rows : [];
      })
      .catch((e) => {
        console.log(e);
        recipeList = null;
      });
  } else {
    // 'all'이 아닌 경우 지정한 조건에 따라 필터링하여 데이터를 불러옴
    await db
      .select('*')
      .from('wb_health_recipe')
      .where('rec_name', 'LIKE', `%${keyword}%`)
      .andWhere('rec_status', '=', 'Y')
      .then(rows => {
        recipeList = (rows.length > 0) ? rows : [];
      })
      .catch((e) => {
        console.log(e);
        recipeList = null;
      });
  }

  return recipeList;
}

// 추천 레시피 상세 불러오기
healthinfoModel.getRecipeInfoById = async (rec_idx) => {
  const db = database();
  let funcFoodById = null;

  await db
    .select('H.*')
    .from('wb_health_recipe AS H')
    .where('rec_idx', '=', rec_idx)
    .andWhere('rec_status', '=', 'Y')
    .limit(1)
    .then(rows => {
      funcFoodById = (rows.length > 0) ? rows[0] : [];
    })
    .catch((e) => {
      console.log(e);
      funcFoodById = null;
    });
  return funcFoodById;
};

//추천 레시피  수정
healthinfoModel.updateRecipeItem = async (updateRecipeItem) => {
  const db = database();

  await db('wb_health_recipe')
    .where('rec_idx', updateRecipeItem.rec_idx)
    .andWhere('rec_status', '=', 'Y')
    .update({
      rec_name: updateRecipeItem.rec_name,
      thumb_filepath: updateRecipeItem.thumb_filepath,
      upd_date: currentDatetime // 현재 날짜 및 시간 삽입
    })
    .catch((e) => {
      console.log(e);
      return null;
    });

  // 업데이트된 내용(id와 title)을 반환합니다.
  return {"rec_idx": updateRecipeItem.rec_idx, "rec_name": updateRecipeItem.rec_name}; // 또는 필요에 따라 업데이트된 내용 반환
};

/* 추천 운동------------------------------------------ */
//추천 운동 등록
healthinfoModel.addExercise = async (addExerciseItem) => {
  const db = database();
  let newExerciseId = null;

  // 조건에 맞는 행을 선택
  const exData = {
    ex_name: addExerciseItem.ex_name,
    ex_status: addExerciseItem?.ex_status ? addExerciseItem.ex_status : 'T',
    icon_idx: addExerciseItem.icon_idx,
    thumb_idx: addExerciseItem.thumb_idx,
    reg_user: addExerciseItem.reg_user,
    reg_date: currentDatetime
  }

  await db
    .insert(exData)
    .into('wb_health_exercise')
    .then((insertedId) => {
      newExerciseId = insertedId;
    })
    .catch((e) => {
      console.log(e);
    });

  return newExerciseId;
};

//추천 운동 목록 불러오기
healthinfoModel.getExerciseList = async (keyword) => {
  const db = database();
  let exerciseList = null;

  if (keyword === 'all') {
    // 'all'인 경우 전체 배열을 불러옴
    await db
      .select('*')
      .from('wb_health_exercise')
      .andWhereNot('ex_status', '=', 'N')
      .then(rows => {
        exerciseList = (rows.length > 0) ? rows : [];
      })
      .catch((e) => {
        console.log(e);
        exerciseList = null;
      });
  } else {
    // 'all'이 아닌 경우 지정한 조건에 따라 필터링하여 데이터를 불러옴
    await db
      .select('*')
      .from('wb_health_exercise')
      .andWhereNot('ex_status', '=', 'N')
      .andWhere(function () {
        this.where('ex_name', 'LIKE', `%${keyword}%`)
          .orWhere('ex_summary', 'LIKE', `%${keyword}%`)
      })
      // .andWhere('cat_status', '=', 'Y')
      .then(rows => {
        exerciseList = (rows.length > 0) ? rows : [];
      })
      .catch((e) => {
        console.log(e);
        exerciseList = null;
      });
  }

  if (exerciseList || exerciseList.length > 0) {

    for (let i = 0; i < exerciseList.length; i++) {

      const ex_idx = exerciseList[i].ex_idx;
      const icon_idx = exerciseList[i].icon_idx;
      const thumb_idx = exerciseList[i].thumb_idx;
      console.log('ex_idx: ' + ex_idx);
      console.log('icon_idx: ' + icon_idx);
      console.log('thumb_idx: ' + thumb_idx);

      // 이미지 정보를 가져옵니다.
      // 아이콘 이미지 정보 가져오기
      if (icon_idx !== null) {
        const iconImageRows = await db
          .select('ATT.att_filepath', 'ATT.att_idx')
          .from('wb_attach AS ATT')
          .where('ATT.att_idx', icon_idx)
          .andWhere('ATT.att_target_type', 'HEALTH_INFO_EX')
          .andWhere('ATT.att_target', ex_idx);

        if (iconImageRows.length > 0) {
          exerciseList[i].icon_filepath = iconImageRows[0].att_filepath;
        }
      }

      // 썸네일 이미지 정보 가져오기
      if (thumb_idx !== null) {
        const thumbImageRows = await db
          .select('ATT.att_filepath', 'ATT.att_idx')
          .from('wb_attach AS ATT')
          .where('ATT.att_idx', thumb_idx)
          .andWhere('ATT.att_target_type', 'HEALTH_INFO_EX')
          .andWhere('ATT.att_target', ex_idx);

        if (thumbImageRows.length > 0) {
          exerciseList[i].thumb_filepath = thumbImageRows[0].att_filepath;
        }
      }
    }
  }

  return exerciseList;
}

//추천 운동 상세 불러오기
healthinfoModel.getExerciseInfoById = async (ex_idx) => {
  const db = database();
  let exerciseById = null;

  await db
    .select('H.*')
    .from('wb_health_exercise AS H')
    .where('ex_idx', '=', ex_idx)
    .andWhereNot('ex_status', '=', 'N')
    .limit(1)
    .then(async (rows) => {
      if (rows.length > 0) {
        exerciseById = rows[0];

        // 아이콘 이미지 정보 가져오기
        if (exerciseById.icon_idx !== null) {
          const iconImageRows = await db
            .select('ATT.att_filepath', 'ATT.att_idx')
            .from('wb_attach AS ATT')
            .where('ATT.att_idx', exerciseById.icon_idx)
            .andWhere('ATT.att_target_type', 'HEALTH_INFO_EX')
            .andWhere('ATT.att_target', exerciseById.ex_idx);

          if (iconImageRows.length > 0) {
            exerciseById.icon_filepath = iconImageRows[0].att_filepath;
          }
        }

        //썸네일 이미지 정보 가져오기
        if (exerciseById.thumb_idx !== null) {
          const thumbImageRows = await db
            .select('ATT.att_filepath', 'ATT.att_idx')
            .from('wb_attach AS ATT')
            .where('ATT.att_idx', exerciseById.thumb_idx)
            .andWhere('ATT.att_target_type', 'HEALTH_INFO_EX')
            .andWhere('ATT.att_target', exerciseById.ex_idx);

          if (thumbImageRows.length > 0) {
            exerciseById.thumb_filepath = thumbImageRows[0].att_filepath;
          }
        }
      }
    })
    .catch((e) => {
      console.log(e);
      exerciseById = null;
    });

  if (exerciseById) {
    // 이미지 정보를 가져옵니다.
    await db
      .select('ATT.att_filepath as thumbnail_path', 'ATT.att_idx')
      .from('wb_attach AS ATT')
      .join('wb_health_food AS H', 'H.ex_idx', '=', 'ATT.att_target')
      .where('ATT.att_is_image', 'Y')
      .where('ATT.att_target_type', 'HEALTH_INFO_FOOD')
      .where('ATT.att_target', ex_idx)
      .then(rows => {
        console.log('Rows: ', rows);  // 추가된 코드
        if (rows.length > 0) {
          exerciseById.attach_path = rows.map(row => ({
            att_idx: row.att_idx,
            att_filepath: row.thumbnail_path
          }));
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }

  return exerciseById;
};

//추천 운동  수정
healthinfoModel.updateExerciseItem = async (updateExerciseItem) => {
  const db = database();

  await db('wb_health_exercise')
    .where('ex_idx', updateExerciseItem.ex_idx)
    .andWhereNot('ex_status', '=', 'N')
    .update({
      ex_name: updateExerciseItem.ex_name,
      ex_status: updateExerciseItem.ex_status ? updateExerciseItem.ex_status : 'Y',
      ex_summary: JSON.stringify(updateExerciseItem.ex_summary),
      icon_idx: updateExerciseItem.icon_idx,
      thumb_idx: updateExerciseItem.thumb_idx,
      upd_date: currentDatetime // 현재 날짜 및 시간 삽입
    })
    .catch((e) => {
      console.log(e);
      return null;
    });

  // 업데이트된 내용(id와 title)을 반환합니다.
  return await healthinfoModel.getExerciseInfoById(updateExerciseItem.ex_idx); // 또는 필요에 따라 업데이트된 내용 반환
};

module.exports = healthinfoModel