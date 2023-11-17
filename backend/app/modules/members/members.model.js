const membersModel = {};

//(ID, 비밀번호 찾기) 인증번호 확인
membersModel.checkAuthNum = async(mem_phone, auth_value) => {
    const db = database();

    const currentFormattedTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

    let checkResult = null;

    await db
        .select('M.*')
        .from('wb_member_auth_num AS M')
        .where('mem_phone', '=', mem_phone)
        .andWhere('auth_value', '=', auth_value)
        .andWhere('ttl', '>=', currentFormattedTime) // ttl이 현재 시간 이전인 경우
        .orderBy('auth_idx', 'desc') // reg_date 컬럼을 내림차순으로 정렬
        .limit(1)
        .then(rows => {
            checkResult = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            checkResult = null;
        });
    
    return checkResult;

};

//(ID, 비밀번호 찾기) 인증번호 저장
membersModel.insertRandNum = async(myPhoneNum, randNum) => {
    const db = database();

    const mem_phone = myPhoneNum;
    const auth_value = randNum;

    // 현재 시간을 구합니다.
    const currentTime = new Date();
    const currentFormattedTime = currentTime.toISOString().slice(0, 19).replace('T', ' ');

    // 인증 번호의 유효 시간을 3분으로 설정합니다.
    const expirationTime = new Date(currentTime.getTime() + 3 * 60 * 1000); // 3분을 밀리초로 변환
    const expirationFormattedTime = expirationTime.toISOString().slice(0, 19).replace('T', ' ');

    await db
        .insert(
            {
                mem_phone: mem_phone,
                auth_value: auth_value,
                reg_date: currentFormattedTime,
                ttl: expirationFormattedTime, // 인증 번호의 유효 시간 설정
            }
        )
        .into('wb_member_auth_num')
        .then((insertedId) => {
            newAuthId  = insertedId;
        })
        .catch((e) => {
            console.log(e);
        });

    return newAuthId;
};

//전화번호로 ID 찾기
membersModel.findMyIdByPhone = async(myPhoneNum) => {
    const db = database();
    let selectedMail = null;

    await db
        .select('U.*')
        .from('wb_member AS U')
        .where("mem_phone", "=", myPhoneNum)
        .where("mem_status", "=", "Y")
        .limit(1)
        .then(rows => {
            selectedMail = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            selectedMail = null;
        });

    return selectedMail;
};

//유저 ID(이메일 형식)로 비밀번호 찾기
membersModel.findMyPwByMail = async(mem_nickname, mem_userid, mem_phone) => {
    const db = database();
    let chkMemExist = null;

    await db
        .select('U.*')
        .from('wb_member AS U')
        .where("mem_nickname", "=", mem_nickname)
        .where("mem_userid", "=", mem_userid)
        .where("mem_phone", "=", mem_phone)
        .where("mem_status", "=", "Y")
        .limit(1)
        .then(rows => {
            chkMemExist = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            chkMemExist = null;
        });

    return chkMemExist;
}

/* --------------------------------------------------*/

//이메일 중복 체크
membersModel.mailDuplicateChk = async(mem_email) => {
    const db = database();
    let chkedMail = null;

    await db
        .select('U.*')
        .from('wb_member AS U')
        .where("mem_email", "=", mem_email)
        .where("mem_status", "=", "Y")
        .limit(1)
        .then(rows => {
            chkedMail = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            chkedMail = null;
        });

    return chkedMail;
}

//특정 회원 레벨 조회
membersModel.getNextLevel = async(next_lev_idx) => {
    const db = database();
    let nextLevel = null;

    await db
    .select('L.*')
    .from('wb_member_level AS L')
    .where('lev_idx', '=', next_lev_idx)
    .limit(1)
    .then(rows => {
        nextLevel = (rows.length > 0) ? rows[0] : null;
    })
    .catch((e) => {
        console.log(e);
        nextLevel = null;
    });
};

// 특정 회원 조회
membersModel.getMemberById = async (value, column = "mem_idx") => {
    const db = database();
    let selectedMember = null;

    await db
        .select('U.*', 'L.lev_name', 'L.lev_check', 'L.lev_discount')
        .from('wb_member AS U')
        .leftJoin('wb_member_level AS L', 'U.lev_idx', 'L.lev_idx') // Join을 추가
        .where(column, value)
        .whereNot('mem_status', 'N')
        .limit(1)
        .then(rows => {
            if (rows.length > 0) {
                selectedMember = { ...rows[0] }; // 회원 정보 복사
                selectedMember.levelInfo = {
                    lev_name: rows[0].lev_name,
                    lev_check: rows[0].lev_check,
                    lev_discount: rows[0].lev_discount,
                };
                delete selectedMember.lev_name;
                delete selectedMember.lev_check;
            }
        })
        .catch((e) => {
            console.log(e);
            selectedMember = null;
        });

    return selectedMember;
};

/* sns 회원가입한 멤버 정보 저장 */
membersModel.addSnsMem = async(soc_provider, soc_id, mem_idx, mem_email) => {
    const db = database();
    let newInfoIdx = null;

    await db('wb_member_social').insert({
        soc_provider: soc_provider,
        soc_id: soc_id,
        mem_idx: mem_idx,
        soc_email: mem_email,
        soc_regtime: new Date(),
        soc_content: ''
    })
    .then((insertedId) => {
        console.log(insertedId)
        newInfoIdx = insertedId;
        // post = {cst_name:mem_idx, cst_title: cst_title, cst_content: cst_content};
    })
    .catch((e) => {
        console.log(e);
        newInfoIdx = null;
    });

    return newInfoIdx;
}

/* 회원이 sns 회원가입 한 적 있는지 확인 */
membersModel.getSnsMemDetail = async(chkInfo) => {
    const db = database();
    let selectedInfo = null;

    await db
        .select('S.*', )
        .from('wb_member_social AS S')
        .where('soc_id', chkInfo.soc_id)
        .andWhere('soc_provider', chkInfo.soc_provider)
        .andWhere('soc_email', chkInfo.soc_email)
        .limit(1)
        .then(rows => {
            selectedInfo = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            selectedInfo = null;
        });

    return selectedInfo;
}

// 모든 회원 목록 조회
membersModel.getAllMembers = async() => {
    const db = database();
    let membersArray = [];

    await db
        .select('*')
        .from('wb_member')
        .then(rows => {
            membersArray = rows;
        })
        .catch((e) => {
            console.log(e);
        });

    return membersArray;
};

membersModel.GetUser = async(value, column = "mem_userid")=> {
    const db = database();
    let user = null

    await db
        .select('U.*')
        // .from('wb_member AS U') //원본
        .from('wb_member AS U')
        .where(column, value)
        .limit(1)
        .then(rows => {
            user = (rows.length > 0) ? rows[0] : null
        })
        .catch((e) => {
            console.log(e);
            user = null
        })

    return user
}

/**
* 토큰을 생성합니다.
*/
membersModel.createToken = async(type, userInfo) => {
    const jwt = require('jsonwebtoken');
    const expiresIn =
        type === 'refresh'
        ? appConfig.jwt.refreshTokenExpire
        : appConfig.jwt.accessTokenExpire
    return await jwt.sign({
        id: userInfo.id
    }, appConfig.secretKey, {
        expiresIn
    })
}

/**
* 반환용 토큰을 생성합니다.
*/
membersModel.responseToken = async(userInfo) => {
    let newAccessToken = '',
        newRefreshToken = '';
    await membersModel.createToken('access', userInfo)
        .then((v) => (newAccessToken = v));
    await membersModel.createToken('refresh', userInfo)
        .then((v) => (newRefreshToken = v));
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    }
}



/* --------------------------------------------------*/

/* 카테고리 등록 */
membersModel.addAddress = async (addAddressItem) => {
    const db = database();
    let newAddressId = null; // 변수 초기화 추가

    // 조건에 맞는 행을 선택
    const addressData = {
        mem_idx: addAddressItem.mem_idx,
        ad_subject: addAddressItem.ad_subject,
        // ad_default: addAddressItem.ad_default,
        ad_name: addAddressItem.ad_name,
        ad_tel: addAddressItem.ad_tel,
        ad_hp: addAddressItem.ad_hp,
        ad_zonecode: addAddressItem.ad_zonecode,
        ad_addr1: addAddressItem.ad_addr1,
        ad_addr2: addAddressItem.ad_addr2,
    }

    await db
        .insert(addressData)
        .into('wb_shop_order_address')
        .then((insertedId) => {
            newAddressId  = insertedId;
        })
        .catch((e) => {
            console.log(e);
        });

    console.log('newAddressId: ' + newAddressId);
    const address_id = newAddressId[0];

    return await membersModel.getAddressById(address_id);
};


//회원 주소 list 불러오기
membersModel.getAddressList = async (mem_idx) => {
    const db = database();
    let addressList = null;

    if (mem_idx === 'all') {
        // 'all'인 경우 전체 배열을 불러옴
        await db
            .select('*')
            .from('wb_shop_order_address')
            .then(rows => {
                addressList = (rows.length > 0) ? rows : [];
            })
            .catch((e) => {
                console.log(e);
                addressList = null;
            });
    } else {
        // 'all'이 아닌 경우 지정한 조건에 따라 필터링하여 데이터를 불러옴
        await db
            .select('*')
            .from('wb_shop_order_address')
            .where('mem_idx', '=', mem_idx)
            .then(rows => {
                addressList = (rows.length > 0) ? rows : [];
            })
            .catch((e) => {
                console.log(e);
                addressList = null;
            });
    }

    return addressList;
}

// 회원 특정 주소 불러오기
membersModel.getAddressById = async (address_id) => {
    const db = database();
    let addressById = null;

    console.log('address_id: ' + address_id);

    await db
        .select('A.*')
        .from('wb_shop_order_address AS A')
        .where('ad_id', '=', address_id)
        .limit(1)
        .then(rows => {
            addressById = (rows.length > 0) ? rows[0] : null; // 변수 이름 수정
        })
        .catch((e) => {
            console.log(e);
            addressById = null;
        });
    return addressById;
}

//회원 기본 배송지 불러오기
membersModel.getDefaultAddress = async (mem_idx) => {
    const db = database();
    let defaultAddress = null;

    console.log('mem_idx: ' + mem_idx);

    await db
        .select('A.*')
        .from('wb_shop_order_address AS A')
        .where('mem_idx', '=', mem_idx)
        .andWhere('ad_default', "=", 'Y')
        .limit(1)
        .then(rows => {
            defaultAddress = (rows.length > 0) ? rows[0] : null; // 변수 이름 수정
        })
        .catch((e) => {
            console.log(e);
            defaultAddress = null;
        });
    return defaultAddress;
}

//회원 기본배송지 설정
membersModel.changeDefaultAddress = async (updateAdId, updateMemIdx, memsAdList) => {
    const db = database();

    for (let i = 0; i < memsAdList.length; i++) {
        if (memsAdList[i].ad_id == updateAdId) {
            // 만약 memsAdList[i].ad_id의 값과 updateAdId의 값이 동일하다면
            // wb_shop_order_address 테이블에서 해당 주소의 ad_default 값을 "Y"로 변경합니다.
            await db('wb_shop_order_address')
                .where('ad_id', '=', updateAdId)
                .andWhere('mem_idx', '=', updateMemIdx)
                .update({ ad_default: 'Y' })
                .catch((e) => {
                    console.log(e);
                    return null;
                });
        } else {
            // if의 조건문을 만족하지 못한 경우
            // wb_shop_order_address 테이블에서 다른 주소의 ad_default 값을 "N"으로 변경합니다.
            await db('wb_shop_order_address')
                .where('ad_id', '=', memsAdList[i].ad_id)
                .andWhere('mem_idx', '=', updateMemIdx)
                .update({ ad_default: 'N' })
                .catch((e) => {
                    console.log(e);
                    return null;
                });
        }
    }

    return await membersModel.getAddressById(updateAdId);

        //ad_default 값이 Y인 ad_id 값을 반환 
}

//회원 배송지 수정
membersModel.updateAddressInfo = async (updateAddressItem) => {
    const db = database();

    await db('wb_shop_order_address')
        .where('ad_id', updateAddressItem.ad_id)
        .andWhere('mem_idx', updateAddressItem.mem_idx)
        .update({
            ad_subject: updateAddressItem.ad_subject,
            ad_name: updateAddressItem.ad_name,
            ad_tel: updateAddressItem.ad_tel,
            ad_hp: updateAddressItem.ad_hp,
            ad_zonecode: updateAddressItem.ad_zonecode,
            ad_addr1: updateAddressItem.ad_addr1,
            ad_addr2: updateAddressItem.ad_addr2
        })
        .catch((e) => {
            console.log(e);
            return null;
        });

    return {"ad_id" : updateAddressItem.ad_id, "ad_name" : updateAddressItem.ad_name }
}

//회원 배송지 삭제
membersModel.deleteAddress = async (ad_id, mem_idx) => {
    const db = database();

    await db('wb_shop_order_address')
        .where('ad_id', '=', ad_id)
        .andWhere('mem_idx', '=', mem_idx)
        .delete()
        .catch((e) => {
            console.log(e);
            return null;
        });

    return {"ad_id" : ad_id }
}

module.exports = membersModel