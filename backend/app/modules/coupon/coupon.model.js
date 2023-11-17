const {symlink} = require("fs");
const couponModel = {};
const db = database();
const currentDatetime = new Date(); // 현재 날짜 및 시간 얻기

// 쿠폰 생성하기
couponModel.createC = async (cc) => {
  try {
    if(cc.cou_type === 'start' && !cc.cou_exp_month) {
      console.log(cc.cou_exp_month)
      return null;
    }

    let endtime;
    if(cc.cou_type === 'all') {
      endtime = new Date(cc.cou_exptime); // 날짜를 설정합니다.
      endtime.setHours(23, 59, 59); // 시간을 23:59:59로 설정합니다.
    }else if(cc.cou_type === 'start') {
      endtime = addMonthsAndSetTime(Number(cc.cou_exp_month))
    }

    function addMonthsAndSetTime(monthsToAdd) {
      const currentDate = new Date(); // 현재 날짜와 시간
      currentDate.setMonth(currentDate.getMonth() + monthsToAdd); // 개월 수만큼 더하기
      currentDate.setHours(23, 59, 59, 999); // 시간을 23:59:59.999로 설정
      return currentDate;
    }


    const data = {
      cou_disc: cc.cou_disc,
      cou_type: cc.cou_type,
      cou_exp_month: cc.cou_exp_month,
      cou_name: cc.cou_name,
      cou_minprice: cc.cou_minprice,
      cou_maxprice: cc.cou_maxprice,
      cou_exptime: endtime,
      cou_regtime: db.fn.now(),
      cou_updtime: db.fn.now(),
      cou_status: 'Y',
      cou_count: 0,
      cou_limit: cc.cou_limit // 쿠폰 갯수
    }

    //
    let post = await db('wb_coupon').insert(data)
      .catch((e) => {
        console.log(e);
        post = null;
      });
    return post;

  } catch (e) {



  }




};
//쿠폰목록 가져오기
couponModel.getCouList = async (
  // startdate, enddate, TODO : 날짜 검색조건 필요
  page, stxt) => {
  let query = db.select('C.*')
    .from('wb_coupon AS C')
    .where('C.cou_status', '<>', 'N');
  // if(startdate && enddate) {
  //     query = query.whereBetween('cou_regtime', [startdate, enddate]);
  // }
  if (stxt) {//검색텍스트
    query = query.where('cou_name', 'like', `%${stxt}%`);
  }
  if (page > 0) { // 페이지가 0보다 큰 경우 페이지네이션을 적용합니다.
    const itemsPerPage = 4; // 페이지 당 아이템 수
    const offset = (page - 1) * itemsPerPage;
    query = query.limit(itemsPerPage).offset(offset);
  }
  let result = await query;
  return result;
};
couponModel.getCouUseList = async (cou_id, page, pagerow) => {
  try {
    let query = db('wb_coupon AS C')
      .select('C.*', 'm_c.mem_idx','m_c.serial_num','m_c.use_datetime AS coupon_use_date','m_c.reg_datatime AS coupon_issue_date', 'm_c.cou_status AS status','m_c.del_memo','Mem.mem_nickname')
      .where('C.cou_id', cou_id)
      .where('C.cou_status', 'Y')
      .join('wb_member_coupon AS m_c', 'C.cou_id', 'm_c.cou_id')
      .join('wb_member AS Mem', 'm_c.mem_idx', 'Mem.mem_idx')

    if (pagerow !== null) {
      // pagerow 값이 null이 아닌 경우에만 페이지네이션을 적용합니다.
      const itemsPerPage = pagerow; // 페이지 당 아이템 수
      if (page > 0) {
        const offset = (page - 1) * itemsPerPage;
        query = query.limit(itemsPerPage).offset(offset);
      }
    }

    const couUseList = await query;

    return couUseList;
  } catch (e) {
    console.error("쿠폰 상세내역 불러오기 실패:", e);
    return false;
  }
}
//쿠폰 상세보기
couponModel.getCouDetail = async (cou_id) => {
  try {
    const cdata = await db('wb_coupon')
      .select('*')
      .where('cou_id', cou_id)
    return cdata;
  } catch (error) {
    console.error("Failed to get coupon:", error);
    return false;
  }
};
//쿠폰 지우기
couponModel.delCoupon = async (cou_id) => {
  try {
    const deleteC = await db('wb_coupon')
      .where('cou_id', cou_id)
      .update({cou_status: 'N'});
    return cou_id;
  } catch (error) {
    console.error("Failed to delete coupon:", error);
    return false;
  }
};
/** 회원쿠폰*/
couponModel.getMemCouList = async (mem_id, page, stxt) => {
  try {
    let query = db.select('MC.*', 'C.cou_name', 'C.cou_disc', 'C.cou_minprice', 'C.cou_maxprice')
      .from('wb_member_coupon AS MC')
      .join('wb_coupon AS C', 'MC.cou_id', 'C.cou_id')
      .where('MC.mem_idx', mem_id)
      .andWhere('MC.cou_status', 'Y')
      .andWhere('MC.exp_datetime', '>' ,currentDatetime)

    if (page > 0) { // 페이지가 0보다 큰 경우 페이지네이션을 적용합니다.
      const itemsPerPage = 4; // 페이지 당 아이템 수
      const offset = (page - 1) * itemsPerPage;
      query = query.limit(itemsPerPage).offset(offset);
    }
    let result = await query;
    return result;
  } catch (error) {
    console.error("Failed to get member coupon:", error);
    return false;
  }
}
//발급하기
couponModel.giveMemCou = async (cdata) => {
  const lastDayOfYear = new Date(new Date().getFullYear(), 11, 31);
  try {
    let cInfo = await db('wb_member_coupon').insert({
      cou_id: cdata.cou_id,
      exp_datetime: cdata.exp_datetime ? cdata.exp_datetime : lastDayOfYear,
      cou_status: cdata.cou_status,
      mem_idx: cdata.mem_idx,
    })
    return cInfo
  } catch (e) {
    console.error(e)
    return null
  }
}
//수정하기
couponModel.editMemCou = async (cdata) => {
  try {
    let cInfo = await db('wb_member_coupon').where('serial_num', cdata.serial_num).update(cdata)
    return cdata
  } catch (e) {
    console.error(e)
    return null
  }
}
//삭제하기
// couponModel.removeCou = async(snum) =>{
//     try{
//         await db('wb_member_coupon')
//             .where('serial_num', serial_num)
//             .andWhere('mem_idx', mem_idx)
//             .update({
//                 cou_status: cou_status,
//                 del_memo: del_memo
//             })
//             .catch((e) => {
//                 console.log(e);
//                 return null;
//             });
//         return await couponModel.getMemCouDetail(snum);
//     }catch (e) {
//         console.error(e)
//         return null
//     }
// }
/* 기타 model ------------------------------------------ */
//회원 쿠폰 상세 정보 get
couponModel.getMemCouDetail = async (serial_num) => {
  try {
    let memCouById = null;
    await db
      .select('C.*')
      .from('wb_member_coupon AS C')
      .where('serial_num', '=', serial_num)
      .limit(1)
      .then(rows => {
        memCouById = (rows.length > 0) ? rows[0] : [];
      })
      .catch((e) => {
        console.log(e);
        memCouById = null;
      });
    return memCouById;
  } catch (e) {
    console.error(e)
    return null
  }
}

//회원 쿠폰 갖고 있는지 검증t
couponModel.getMemCouVerify = async (serial_num, mem_idx) => {
  try {
    let memCouById = null;

    await db
      .select('C.*')
      .from('wb_member_coupon AS C')
      .where('serial_num', serial_num)
      .andWhere('mem_idx', mem_idx)
      .andWhere('cou_status', Y)
      .limit(1)
      .then(rows => {
        memCouById = (rows.length > 0) ? rows[0] : null;
      })
      .catch((e) => {
        console.log(e);
        memCouById = null;
      });
    return memCouById;
  } catch (e) {
    console.error(e)
    return null
  }
}

//회원 쿠폰 상태 변경
couponModel.couStatusChange = async (change_status, removeData) => {
  try {
    const updateData = {
      cou_status: change_status,
      del_memo: removeData.del_memo,
      use_datetime: removeData.use_datetime
    }
    await db('wb_member_coupon')
      .where('serial_num', removeData.serial_num)
      .andWhere('mem_idx', removeData.mem_idx)
      .update(updateData)
      .catch((e) => {
        console.log(e);
        return null;
      });
    // 업데이트된 내용(id와 title)을 반환합니다.
    return await couponModel.getMemCouDetail(removeData.serial_num); // 또는 필요에 따라 업데이트된 내용 반환
  } catch (e) {
    console.error(e)
    return null;
  }
}
module.exports = couponModel;
