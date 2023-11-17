/**
 * Users Controller
 * --------------------------------------------------------------------------------
 * 사용자 컨트롤러
 *
 * getStatics   접속
 * postStatics  사용자 접속시 통계데이타를 입력처리
 *
 * @namespace users
 * @author 장선근
 * @version 1.0.0.
 */

const memberController = {};
const membersModel = loadModule('members', 'model')
const db = database();

/**
 * Global Middleware
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
memberController.loginMemberCheck = async (req, res, next) => {
  // JWT 패키지 로드
  const jwt = require('jsonwebtoken');

  // Default 값을 지정한다
  req.loginUser = {
    /**
     * 로그인한 사용자의 PK
     */
    id: 0,

    /**
     * 접속자의 IP
     */
    ip: ip2long(req.headers['x-forwarded-for'] || req.connection.remoteAddress)
  }

  // 만약 토큰 리프레시일 경우에는 실행하지 않는다
  if (req.path === '/v1/users/authorize/token' || req.path === '/v1/users/authorize') {
    return next();
  }

  let accessToken = req.headers['Authorization'] || req.headers['authorization'];

  // AccessToken이 없는 경우 비로그인 상태이므로 그대로 넘어간다.
  if (!accessToken) return next();

  accessToken = accessToken.replace("Bearer ", '')

  await jwt.verify(accessToken, appConfig.secretKey, async (error, decoded) => {
    if (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({code: 'AUTH0001', error: 'TokenExpired'});
      }
      return res.status(401).json({status: 401, code: 'AUTH0002', error: 'TokenExpired'});
    } else {
      req.loginUser.id = decoded.id;

      return next();
    }
  });
}

/* 로그인 */
memberController.authorize = async (req, res) => {
  const loginId = req.body?.loginId ?? '';
  const loginPass = req.body?.loginPass ?? '';

  console.log('ID: ', loginId, ', PW: ', loginPass);

  if (loginId.length === 0)
    return res.status(400).json({code: 'AUTH.ERR003', error: '[이메일주소]를 입력하세요.'})

  if (loginPass.length === 0)
    return res.status(400).json({code: 'AUTH.ERR004', error: '[비밀번호]를 입력하세요.'})

  let user = await membersModel.GetUser(loginId, 'mem_userid')

  if (user === false || user === null) {
    return res.status(400).json({status: 400, code: 'AUTH.ERR005', error: '가입되지 않은 [이메일주소]이거나 [비밀번호]가 올바르지 않습니다.00'})
  }

  const encryptedPassword = getHasString(loginPass)

  if (user['mem_password'] !== encryptedPassword)
    return res.status(400).json({status: 400, code: 'AUTH.ERR006', error: '가입되지 않은 [이메일주소]이거나 [비밀번호]가 올바르지 않습니다.01'})

  // 회원상태가 정상이 아닌경우
  if (user['mem_status'] !== 'Y')
    return res.status(400).json({status: 400, code: 'AUTH.ERR007', error: '가입되지 않은 [이메일주소]이거나 [비밀번호]가 올바르지 않습니다.02'})

  const loginTimeCheck = await memberController.setUserLoginTime(user.mem_idx);
  // console.log('member login time:');
  // console.log(loginTimeCheck.mem_logtime);
  const ip = ip2long(req.header('x-forwarded-for') || req.socket.remoteAddress);
  // 1. 현재 시간(Locale)
  // 날짜 객체를 UTC 기준으로 생성합니다.
  const date = new Date();

  // // Intl.DateTimeFormat을 사용하여 KST 시간대로 포맷팅합니다.
  const kstFormatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const offset = 1000 * 60 * 60 * 9
  const koreaNow = new Date(date + offset)

  // 포맷팅된 날짜 문자열을 가져옵니다.
  const logDate = kstFormatter.format(date);
  const startDate = new Date(logDate);
  startDate.setHours(0, 0, 0, 0); // 현재 날짜의 시작을 설정합니다.

  const endDate = new Date(logDate);
  endDate.setHours(23, 59, 59, 999); // 현재 날짜의 끝을 설정합니다.
  // console.log(currentDate);
  const logexists = await db.from('wb_statics')
    .where('sta_ip', ip)
    .whereBetween('sta_regtime', [startDate, endDate])
    .first();

  const ua = req.useragent;

// console.log(ip);
  // console.log(`Browser: ${ua.browser}, OS: ${ua.os},  Version: ${ua.version}`);
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(req.userAgent);
  };
  // console.log(ua.isMobile);
  if (!logexists) {
    // 로그 기록이 없으면 새로운 로그를 추가
    await db.from('wb_statics').insert({
      sta_ip: ip,
      sta_regtime: new Date(koreaNow),
      sta_browser: ua.browser,
      sta_version: ua.version,
      sta_platform: ua.os,
      sta_is_mobile: ua.isMobile || ua.browser === 'Dart' ? 'Y' : 'N',
    });
  }

  return await memberController.createResponseToken(user) //토큰 생성
    .then(json => {
      return res.status(200).json(json)
    })
}

//*getInfo는 userId 뿐만 아니라 다른 값을 받아서 검색을 할 수 있도록 성능 개선이 있을 수 있음.*//
memberController.getInfo = async (req, res) => {
  const loginUserId = req.loginUser.id

  if (loginUserId === undefined || loginUserId < 1) {
    return res.status(400).json({error: '잘못된 접근입니다'})
  }

  let user = {}
  try {
    await membersModel.GetUser(loginUserId, 'U.mem_idx').then(res => {
      user = res
    })
  } catch {
    user = null
  }

  // 회원상태가 정상이 아닌경우
  if (Object.keys(user).length === 0 || user === null || user.mem_status !== 'Y')
    return res.status(400).json({code: 'AUTH.ERR007', error: "탈퇴한 회원이거나 접근이 거부된 회원입니다."})

  return res.status(200).json(user);
}

memberController.refreshToken = async (req, res) => {
  // const refreshToken = element('refreshToken', req.body, null);
  const refreshToken = req.body?.refreshToken ?? null;
  console.log('request에서 담겨 온 refreshToken : ' + refreshToken);
  const jwt = require('jsonwebtoken');

  if (!refreshToken)
    return res.status(401).json({
      code: 'AUTH.ERR008',
      error: '사용자 로그인 정보가 유효하지 않습니다',
    });

  await jwt.verify(refreshToken, appConfig.secretKey, async (error, decoded) => {
    if (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          code: 'AUTH.ERR002',
          error: '사용자 로그인 정보가 유효하지 않습니다',
        });
      }
      return res.status(401).json({
        code: 'AUTH.ERR002',
        error: '사용자 로그인 정보가 유효하지 않습니다',
      });
    }

    let user = {};
    try {
      await membersModel.GetUser(decoded.id, 'U.mem_idx').then((res) => {
        user = res;
      });
    } catch {
      user = null;
    }

    console.log('토큰을 가진 회원 : ' + user.mem_nickname);
    console.log('회원 status : ' + user.mem_status);

    // 회원상태가 정상이 아닌경우
    if (Object.keys(user).length === 0 || user === null || user.mem_status !== 'Y')
      return res.status(400).json({
        code: 'AUTH.ERR007',
        error: '가입되지 않은 [이메일주소]이거나 [비밀번호]가 올바르지 않습니다.',
      });

    // 새로운 accessToken 과 refreshToken 을 발급한다.
    return await memberController.createResponseToken(user).then((json) => {
      return res.status(200).json(json);
    });
  });
}

/**
 * AccessToken 을 만드는 함수
 * @param user
 * @returns {Promise<*>}
 */
memberController.createAccessToken = async (user) => {
  const jwt = require('jsonwebtoken');
  return await jwt.sign({
    id: user.mem_idx,
    name: user.mem_nickname
  }, appConfig.secretKey, {
    expiresIn: appConfig.jwt.accessTokenExpire
  })
}

/**
 * RefereshToken 을 만드는 함수
 * @param user
 * @returns {Promise<*>}
 */
memberController.createRefreshToken = async (user) => {
  const jwt = require('jsonwebtoken');
  return await jwt.sign({
    id: user.mem_idx,
    name: user.mem_nickname
  }, appConfig.secretKey, {
    expiresIn: appConfig.jwt.refreshTokenExpire
  })
};

/**
 * 반환용 토큰 객체를 만드는 함수
 * @param user
 * @returns {Promise<{userData: {nickname: (string|*), id, isAdmin: boolean}, permission: *, accessToken: string, refreshToken: string}>}
 * @constructor
 */
memberController.createResponseToken = async (user) => {
  let newAccessToken = ''
  let newRefreshToken = '';
  await memberController.createAccessToken(user).then((v) => (newAccessToken = v));
  await memberController.createRefreshToken(user).then((v) => (newRefreshToken = v));

  // console.log('newRefreshToken : ' + newRefreshToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    userData: {
      id: user.mem_idx,
      name: user.mem_nickname,
      auth: user.mem_auth
    }
  };
};

/*회원목록 전체 조회*/
memberController.getAllMembers = async (req, res) => {
  try {
    // 데이터베이스에서 상품 목록을 조회
    const allMembers = await membersModel.getAllMembers();

    console.log(allMembers)

    // 상품 목록 반환
    return res.status(200).json(allMembers);
  } catch (error) {
    console.error("Error fetching members:", error);
    return res.status(500).json({error: "Failed to fetch members"});
  }
};

//특정 회원 권환 확인하기
memberController.chkMemAuth = async (req, res) => {
  try{
    const loginId = req.body?.loginId ?? '';
    const loginPass = req.body?.loginPass ?? '';

    if (loginId.length === 0 || loginPass.length === 0)
    return res.status(403).json({error: '권한 확인에 필요한 값을 보내주세요.'})

  let user = await membersModel.GetUser(loginId, 'mem_userid')

  if(!user || user === null){
    return res.status(503).json({error: '회원의 정보를 찾s을 수 없습니다.'})
  }

  return res.status(200).json(user)
  }catch(error){
    console.error(error);
    return res.status(500).json({error: `권한 확인 실패: ${error}`});
  }
}

/* 내 정보 조회 */
memberController.getMemberById = async (req, res) => {
  try {
    const memberId = req.params.id;
    const member = await membersModel.getMemberById(memberId);

    if (!member) {
      return res.status(404).json({error: "회원 정보를 찾을 수 없습니다."});
    }

    return res.status(200).json(member);
  } catch (error) {
    console.error("Error fetching member:", error);
    return res.status(500).json({error: "Failed to fetch member"});
  }
};

/* 회원이 sns 회원가입 한 적 있는지 확인 */
memberController.snsMemChk = async (req, res) => {
  try{
    const chkInfo = req.body;
    
    if(!chkInfo) {
      return res.status(404).json({error: "검증에 필요한 정보를 보내주세요."});
    }

    const chkedMemInfo = await membersModel.getSnsMemDetail(chkInfo);
    if(!chkedMemInfo){
      return res.status(500).json({result: false, chkedMemInfo: null});
    }

    return res.status(200).json({result: true, chkedMemInfo: chkedMemInfo});
  } catch(error){
    console.error("Error finding sns member:", error);
    return res.status(500).json({error: "Failed to find sns member"});
  }
}

/**
 * 이메일로 회원가입
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
memberController.addUser = async (req, res) => {
  let loginId = req.body?.email ?? '';
  let loginPass = req.body?.password ?? '';
  let nickname = req.body?.nickname ?? '';
  let phone = req.body?.phone ?? '';
  let agreeMarketing = req.body?.agreeMarketing ?? 'N';

  const db = database();

  if (nickname === '') {
    return res.status(400).json({error: '[닉네임]은 필수 입력값입니다'})
  }

  //현재 본명 사용하므로 닉네임 중복 체크 제외
  // // 이미 사용중인 닉네임인지 체크한다.
  // // const overlap_nick = await rowArray("SELECT * FROM wb_member WHERE mem_nickname = ?", [nickname]) //원본
  // // const overlap_nick = await rowArray("SELECT * FROM wb_member WHERE mem_nickname = ?", [nickname])
  // // if (overlap_nick !== null) {
  // //   return res.status(400).json({error: '이미 사용중인 [닉네임] 입니다.'})
  // // }

  if (loginId === '') {
    return res.status(400).json({error: '[이메일주소]는 필수 입력값입니다'})
  }

  if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(loginId)) {
    return res.status(400).json({error: '올바른 형식의 [이메일주소]가 아닙니다'})
  }

  //이메일 중복 체크 별도 controller로 분리
  // // 이미 사용중인 이메일인지 확인한다.
  // // const overlap_mail = await rowArray('SELECT * FROM wb_member WHERE mem_userid = ? OR mem_email = ?', [loginId, loginId]) //원본
  // // const overlap_mail = await rowArray('SELECT * FROM wb_member WHERE mem_userid = ? OR mem_email = ?', [loginId, loginId])
  // // if (overlap_mail !== null) {
  // //   return res.status(400).json({error: '이미 가입된 [이메일주소] 입니다.'})
  // // }

  if (loginPass === '') {
    return res.status(400).json({error: '[비밀번호]는 필수 입력값입니다'})
  }

  if (!/^(?:(?=.*[a-z])(?=.*\d)|(?=.*[a-z])(?=.*[\W_])|(?=.*\d)(?=.*[\W_])).{8,}$/.test(loginPass)) {
    return res.status(400).json({error: '비밀번호는 8자 이상, 둘 이상의 문자,숫자 및 특수문자를 사용하셔야 합니다'});
  }


  // await db('wb_member').insert({ //원본
  const newMember = {
    mem_userid: loginId,
    mem_password: getHasString(loginPass),
    mem_email: loginId,
    mem_nickname: nickname,
    mem_regtime: (new Date()).dateFormat('yyyy-MM-dd HH:mm:ss'),
    mem_logtime: 0,
    mem_regip: ip2long(req.headers['x-forwarded-for'] || req.connection.remoteAddress),
    mem_phone: phone,
    mem_recv_email: agreeMarketing
  };

  const insertResult = await db('wb_member').insert(newMember);
  console.log('insertResult::' + insertResult);

  if(req.body.soc_provider && req.body.soc_id){
    const mem_idx = insertResult[0];
    const memInfo = await membersModel.getMemberById(mem_idx)

    console.log('new member::')
    console.log(memInfo)

    const newSnsMem = membersModel.addSnsMem(req.body.soc_provider, req.body.soc_id, mem_idx, memInfo.mem_email)
    
    if(!newSnsMem || newSnsMem === null){
      return res.status(500).json({message : 'sns회원 등록 중 오류 발생'})
    }
    
  }

  return res.status(200).json({"message": `${nickname} 회원님 환영합니다. `})
}

//이메일 중복 체크
memberController.mailDuplicateChk = async (req, res) => {
  try{
    const mem_email = req.body.mem_email;

    if(!mem_email){
      return res.status(400).json({error: '검사할 [이메일 주소]를 보내주세요.'})
    }

    const chkedMail = await membersModel.mailDuplicateChk(mem_email);

    if(chkedMail){
      return res.status(200).json({check: false, message : '이미 가입된 [이메일주소] 입니다.'})

    }

    return res.status(200).json({check: true, message : '사용 가능한 [이메일주소] 입니다.'})
  }catch (error) {
    console.error("Error checking mail:", error);
    return res.status(500).json({ error: "product att check mail." })
  }
}

// memberController.changePhoto = async(req, res) => {
//     const id = req.loginUser.id * 1
//     // const photo = element('photo', req.body, '')
//     const photo = req.body?.photo ?? '' ;

//     const db = database()
//     await db('wb_member').where('mem_idx', id).update({
//         mem_photo:photo
//     })

//     return res.json({})
// }

memberController.memberLeave = async (req, res) => {
  console.log('탈퇴할 회원은?' + req.body.id);
  const id = req.body.id * 1
  const leaveMemo = req.body?.leaveMemo ?? '';

  if (leaveMemo.length === 0) {
    return res.status(400).json({error: '회원 탈퇴 사유를 입력해주세요'});
  }

  const data = {
    mem_status: 'N',
    mem_leaveMemo: leaveMemo,
    mem_leaveTime: (new Date()).dateFormat('yyyy-MM-dd HH:mm:ss')
  };

  const db = database()
  await db('wb_member').where('mem_idx', id).update(data)

  return res.status(200).json({"message": `${id} 탈퇴 처리가 완료되었습니다. `})

}

memberController.changePassword = async (req, res) => {
  const id = req.body.id * 1

  if (id <= 0) {
    return res.status(400).json({error: '내 정보를 수정하기 위해선 로그인상태여야 합니다.'});
  }

  const member = await rowArray("SELECT * FROM wb_member WHERE mem_idx = ?", [id])
  if (member === null) {
    return res.status(400).json({error: '회원 정보를 찾을수 없습니다.'});
  }
  const currentPassword = req.body?.currentPassword ?? '';
  const newPassword = req.body?.newPassword ?? '';

  if (currentPassword.length === 0) {
    return res.status(400).json({error: '기존 비밀번호를 입력하세요'});
  }

  if (newPassword.length === 0) {
    return res.status(400).json({error: '새 비밀번호를 입력하세요'});
  }

  if (!/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(newPassword)) {
    return res.status(400).json({error: '비밀번호는 8자 이상, 하나이상의 문자,숫자 및 특수문자를 사용하셔야 합니다'});
  }

  const encryptedPassword = getHasString(currentPassword);

  if (member['mem_password'] !== encryptedPassword)
    return res.status(400).json({error: '기존 비밀번호가 맞지 않습니다.'})

  const newPasswordEncrypted = getHasString(newPassword);

  if (newPasswordEncrypted === member['mem_password'])
    return res.status(400).json({error: '변경하려는 비밀번호가 기존 비밀번호와 동일합니다.'})

  const db = database()
  await db('wb_member').where('mem_idx', id).update({mem_password: newPasswordEncrypted})

  return res.status(200).json({"message": `비밀번호 변경 성공`})
}

memberController.editMyInfo = async (req, res) => {
  console.log(req.body);
  const id = req.body.id * 1;

  if (id <= 0) {
    return res.status(400).json({error: '내 정보를 수정하기 위해선 로그인상태여야 합니다.'});
  }

  const data = {
    // mem_recv_email: req.body?.email ?? '',
    mem_nickname: req.body?.nickname ?? '',
  }

  console.log('data.mem_nickname : ' + data.mem_nickname);

  if (data.mem_nickname.length === 0) {
    return res.status(400).json({error: '변경할 닉네임을 입력하셔야 합니다.'});
  }

  // 변경할 닉네임이 이미 있는 닉네임인지 체크
  const db = database();
  let t = null;
  await db.from('wb_member')
    .where('mem_nickname', data.mem_nickname)
    .whereNot('mem_idx', id)
    .then((rows) => {
      if (rows && rows.length > 0) {
        t = rows;
      }
    })

  if (t !== null) {
    return res.status(400).json({error: '변경하려는 닉네임이 이미 사용중입니다. 다른 닉네임을 입력해주세요'});
  }

  await db('wb_member').where('mem_idx', id).update(data);

  return res.status(200).json({"message": `${data.mem_nickname} 로 닉네임 변경이 완료 되었습니다. `})

}

memberController.setUserLoginTime = async (mem_idx) => {
  if (mem_idx > 0) {
    const db = database();
    const logTime = new Date().toISOString().slice(0, 19).replace("T", " "); // ISO 형식의 시간 포맷 생성
    // const logIp = ip2long(req.headers['x-forwarded-for'] || req.connection.remoteAddress);

    try {
      // await를 사용하여 쿼리 완료를 기다립니다.
      await db('wb_member').where('mem_idx', mem_idx).update({
        mem_logtime: logTime,
        // mem_logip: logIp
      });

      return membersModel.getMemberById(mem_idx);
    } catch (error) {
      console.error('Error updating login time:', error);
      // 오류 처리 로직을 추가할 수 있습니다.
    }
  }
};

// memberController.setUserLoginTime = async(mem_idx) => {
//     if(mem_idx > 0) {
//         const db = database();
//         // await db('wb_member').where('mem_idx', mem_idx).update({
//         await db('wb_member').where('mem_idx', mem_idx).update({
//             mem_logtime : (new Date()).dateFormat('yyyy-MM-dd HH:mm:ss'),
//             mem_logip: ip2long(req.headers['x-forwarded-for'] ||  req.connection.remoteAddress)
//         })
//     }
// }

//전화번호로 ID 찾기
memberController.findMyIdByPhone = async (req, res) => {
  try {
    const myPhoneNum = req.params.phone;

    const selectedMail = await membersModel.findMyIdByPhone(myPhoneNum);

    console.log(selectedMail);

    if (!selectedMail) {
      return res.status(404).json({error: "회원 정보를 찾을 수 없습니다."});
    }

    return res.status(200).json(selectedMail);
  } catch (error) {
    console.error("Error fetching member:", error);
    return res.status(500).json({error: "Failed to fetch member"});
  }
}

//유저 ID(이메일 형식)로 비밀번호 찾기
memberController.findMemExist = async (req, res) => {
  try {
    const {mem_nickname, mem_userid, mem_phone} = req.body;

    if (!mem_nickname || !mem_userid || !mem_phone) {
      return res.status(500).json({error: "확인에 필요한 값을 보내주세요."});
    }

    const chkMemExist = await membersModel.findMyPwByMail(mem_nickname, mem_userid, mem_phone);

    console.log("chkMemExist:: " + chkMemExist);

    if (!chkMemExist) {
      return res.status(404).json({error: "비밀번호 정보를 찾을 수 없습니다."});
    }

    return res.status(200).json({mem_idx: chkMemExist.mem_idx});
  } catch (error) {
    console.error("Error finding pw:", error);
    return res.status(500).json({error: "Failed to fine pw"});
  }
}

//새 비밀번호 설정
memberController.newPasswordSet = async (req, res) => {
  try {
    const mem_idx = req.body.mem_idx;
    const newPassword = req.body.newPassword;

    const selectedMember = await membersModel.getMemberById(mem_idx);

    if (selectedMember === null) {
      return res.status(400).json({error: '회원 정보를 찾을수 없습니다.'});
    }

    if (newPassword.length === 0) {
      return res.status(400).json({error: '새 비밀번호를 입력하세요'});
    }

    if (!/^(?:(?=.*[a-z])(?=.*\d)|(?=.*[a-z])(?=.*[\W_])|(?=.*\d)(?=.*[\W_])).{8,}$/.test(newPassword)) {
      return res.status(400).json({error: '비밀번호는 8자 이상, 둘 이상의 문자,숫자 및 특수문자를 사용하셔야 합니다'});
    }

    const newPasswordEncrypted = getHasString(newPassword);

    const db = database()
    await db('wb_member').where('mem_idx', mem_idx).update({mem_password: newPasswordEncrypted})

    return res.status(200).json({"message": `비밀번호 변경 성공`})
  } catch (error) {
    console.error("Error to change password:", error);
    return res.status(500).json({error: "Failed to change password"});
  }
}

const nodemailer = require('nodemailer');
// const config = require('../../config/config.development.js'); // 설정 파일의 경로를 올바르게 지정하세요.
const config = require('../../config/config.production.js'); // 설정 파일의 경로를 올바르게 지정하세요.

//(ID, 비밀번호 찾기) 인증번호 저장
memberController.generateAuthNum = async (req, res) => {
  try {
    const myPhoneNum = req.params.phone;

    if (myPhoneNum.length === 0) {
      return res.status(400).json({error: '전화번호를 입력하세요'});
    }

    const selectedMail = await membersModel.findMyIdByPhone(myPhoneNum);

    if (!selectedMail) {
      return res.status(404).json({error: "회원 정보를 찾을 수 없습니다."});
    }

    const randNum = await memberController.makeRandNum();
    const insertedIDX = await membersModel.insertRandNum(myPhoneNum, randNum);
    // console.log(insertedIDX);

    // 이메일 전송을 위한 설정
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: config.auth.emailUser, // auth의 emailUser 값을 사용합니다.
        pass: config.auth.emailPassword, // auth의 emailPassword 값을 사용합니다.
      },
    });

    // 이메일 내용 설정
    const mailOptions = {
      from: config.auth.emailUser, // 발신자 이메일 주소
      //TODO: 후에 selectedMail.mem_email 로 전송되도록 수정해야 함.
      // to: selectedMail.mem_email, // 수신자 이메일 주소 (selectedMail.mem_email)
      to: config.auth.emailUser, // 수신자 이메일 주소 (selectedMail.mem_email)
      subject: '인증 번호', // 이메일 제목
      text: `인증 번호는 [${randNum}]입니다.`, // 이메일 내용
    };

    // 이메일 전송
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({error: "이메일 전송에 실패했습니다."});
      } else {
        console.log("Email sent:", info.response);
        return res.status(200).json({message: "이메일 전송 성공"});
      }
    });
  } catch (error) {
    console.error("Error saving authorize Num:", error);
    return res.status(500).json({error: "인증 번호 저장에 실패했습니다."});
  }
};

memberController.makeRandNum = async () => {
  // 랜덤한 6자리 양수 생성
  const min = 100000; // 6자리 양수 중 최소값
  const max = 999999; // 6자리 양수 중 최대값

  const randNum = Math.floor(Math.random() * (max - min + 1)) + min;

  return randNum;
};

//인증번호 확인
memberController.checkAuthNum = async (req, res) => {
  try {
    const mem_phone = req.body.mem_phone;
    const auth_value = req.body.auth_value;

    if (mem_phone.length === 0) {
      return res.status(400).json({error: '전화번호를 입력하세요'});
    }

    if (auth_value.length === 0) {
      return res.status(400).json({error: '인증번호를 입력하세요'});
    }

    const checkResult = await membersModel.checkAuthNum(mem_phone, auth_value);
    console.log(checkResult);

    if (checkResult == null) {
      return res.status(400).json({error: '인증 가능한 데이터가 없습니다.'});
    }

    return res.status(200).json({checkResult: "인증 성공"});
  } catch (error) {
    console.error("Error authoring Num:", error);
    return res.status(500).json({error: "Failed to authorize Num"});
  }

}

/*---------------------------*/

//회원 주소 등록
memberController.addAddress = async (req, res) => {
  try {
    const addAddressItem = req.body;

    if (addAddressItem == null) {
      return res.status(400).json({error: '등록할 주소 데이터가 없습니다.'});
    }

    // 주소 등록
    const newAddressItem = await membersModel.addAddress(addAddressItem);

    if (!newAddressItem || newAddressItem == null) {
      return res.status(500).json({error: 'Failed to add address'});
    }

    // 주소 등록 성공 메세지 반환
    return res.status(200).json({newAddressItem});
  } catch (error) {
    console.error('Error add address:', error);
    return res.status(500).json({error: 'Failed to add address'});
  }
}

//회원 기본배송주소 설정

//회원 주소 list 불러오기
memberController.getAddressList = async (req, res) => {
  try {
    // 상위 id 값을 가진 카테고리 목록을 조회
    const mem_idx = req.params?.mem_idx ?? null;
    console.log('mem_idx: ' + mem_idx)

    if (mem_idx == null) {
      return res.status(500).json({error: "조회 할 멤버 정보가 없습니다."})
    }

    const addressList = await membersModel.getAddressList(mem_idx);

    console.log(addressList)

    // 상품 목록 반환
    return res.status(200).json(addressList);
  } catch (error) {
    console.error("Error fetching category list:", error);
    return res.status(500).json({error: "Failed to fetch category list"});
  }
}

//회원 특정 주소 불러오기
memberController.getAddressById = async (req, res) => {
  try {
    // console.log('오긴 오나');
    const address_id = req.params?.address_id ?? null;

    if (address_id == null) {
      return res.status(500).json({error: "조회 할 주소가 없습니다."})
    }

    const addressItem = await membersModel.getAddressById(address_id);

    if (addressItem == null) {
      return res.status(500).json({error: "조회 할 주소가 없습니다."})
    }

    console.log(addressItem)

    // 배송지 반환
    return res.status(200).json(addressItem);
  } catch (error) {
    console.error('Error find address:', error);
    return res.status(500).json({error: 'Failed to find address'});
  }
}

//회원 기본 배송지 불러오기
memberController.getDefaultAddress = async (req, res) => {
  try {
    const mem_idx = req.params.mem_idx;

    if (!mem_idx) {
      return res.status(500).json({error: "조회 할 멤버 정보가 없습니다."})
    }

    const defaultAddress = await membersModel.getDefaultAddress(mem_idx);

    if (defaultAddress == null) {
      return res.status(500).json({error: "조회 할 기본 배송지가 없습니다."})
    }

    console.log(defaultAddress)

    // 배송지 반환
    return res.status(200).json(defaultAddress);

  } catch (error) {
    console.error('Error find address:', error);
    return res.status(500).json({error: 'Failed to find address'});
  }
}

//회원 기본배송지 설정
memberController.changeDefaultAddress = async (req, res) => {
  try {
    const updateAdId = req.body.ad_id;
    const updateMemIdx = req.body.mem_idx;
    // const update = req.body.ad_id;

    // 배송지가 실존하는지 정보 get ------------------

    const checkAddressExist = await membersModel.getAddressById(updateAdId);

    if (!checkAddressExist) {
      return res.status(500).json({error: `선택한 배송지는 존재하지 않습니다.`})
    } else {
      console.log(`배송지 확인!`)
    }

    // mem_idx가 가진 배송지 목록 get ------------------

    const memsAdList = await membersModel.getAddressList(updateMemIdx)

    if (memsAdList == null) {
      return res.status(500).json({error: `${mem_idx}번 째 멤버가 가진 배송지 목록이 없습니다.`})
    }

    // 기본 배송지 변경  ------------------

    console.log('memsAdList[0].ad_id의 값 : ' + memsAdList[0].ad_id);
    console.log('updateAdId의 값 : ' + updateAdId);

    const updatedDefault = await membersModel.changeDefaultAddress(updateAdId, updateMemIdx, memsAdList)

    console.log(updatedDefault)

    if (updatedDefault.ad_default === "N") {
      return res.status(500).json({error: `기본 배송 설정에 문제 발생`})
    }

    return res.status(200).json({"message": `${updatedDefault.ad_name} 이 기본 배송지로 설정되었습니다.`});
  } catch (error) {
    console.error("Error updating default address:", error);
    return res.status(500).json({error: "Failed to update default address"});
  }
}

//회원 배송지 수정
memberController.updateAddressInfo = async (req, res) => {
  try {
    const updateAddressItem = req.body;

    // 배송지가 실존하는지 정보 get ------------------

    const checkAddressExist = await membersModel.getAddressById(updateAddressItem.ad_id);

    if (!checkAddressExist) {
      return res.status(500).json({error: `선택한 주소지는 존재하지 않습니다.`})
    } else {
      console.log(`주소지 확인!`)
    }

    // 카테고리 수정  -------------------------------------------------------
    const updatedAddressItem = await membersModel.updateAddressInfo(updateAddressItem);

    console.log('updatedAddressItem:')
    // console.log(updatedAddressItem)
    if (!updatedAddressItem) {
      return res.status(404).json({error: "address not found"});
    }

    // console.log(`${updatedAddressItem.ad_id} 번 주소의 수정 성공`)

    return res.status(200).json(updatedAddressItem);
  } catch (error) {
    console.error("Error updating address:", error);
    return res.status(500).json({error: "Failed to update address"});
  }
}

//회원 배송지 삭제
memberController.deleteAddress = async (req, res) => {
  try {
    const ad_id = req.body.ad_id;
    const mem_idx = req.body.mem_idx;

    if (!ad_id) {
      return res.status(404).json({error: "address not found"});
    }

    // 배송지가 실존하는지 정보 get ------------------

    const checkAddressExist = await membersModel.getAddressById(ad_id);

    if (!checkAddressExist) {
      return res.status(500).json({error: `선택한 배송지는 존재하지 않습니다.`})
    } else {
      console.log(`배송지 확인!`)
    }

    // 배송지 삭제 ------------------

    const deletedAdId = await membersModel.deleteAddress(ad_id, mem_idx);

    if (deletedAdId == null) {
      return res.status(500).json({error: "Failed to delete address"});
    }

    return res.status(200).json({"message": `배송지가 삭제되었습니다.`});
  } catch (error) {
    console.error("Error deleting address:", error);
    return res.status(500).json({error: "Failed to delete address"});
  }
}

module.exports = memberController
