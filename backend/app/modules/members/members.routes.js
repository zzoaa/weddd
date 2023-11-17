/**
 * Users Routes
 * --------------------------------------------------------------------------------
 * Users에 관련된 라우팅 설정
 */

const router = require('express').Router()
const controller = loadModule('members', 'controller');

const db = database()

router.post('/authorize', controller.authorize) //로그인
router.post('/authorize/token', controller.refreshToken) //만료된 토큰 재발급
// router.get('/', controller.getInfo) //회원 검색
router.post('/', controller.addUser) //회원가입
router.post('/mail-dup/chk', controller.mailDuplicateChk) //이메일 중복 체크

// 전체 회원 목록 가져오기
router.get('/list/all', controller.getAllMembers)
//특정 회원 권환 확인하기
router.post('/auth/check', controller.chkMemAuth)
// 특정 회원 정보 가져오기
router.get('/list/:id', controller.getMemberById)
// 회원이 sns 회원가입 한 적 있는지 확인
router.post('/social/chk', controller.snsMemChk)

router.put('/', controller.editMyInfo) //내 정보 수정(닉네임 변경)
router.post('/password-change', controller.changePassword) //비밀번호 변경
router.post('/withdraw', controller.memberLeave) //회원탈퇴
// router.patch('/photo', controller.changePhoto) //프로필 사진 수정

/*---------------------------*/
//전화번호로 ID 찾기
router.get('/findmail/:phone', controller.findMyIdByPhone)

//멤버의 PK값 찾기
//유저 ID(이메일 형식), 전화번화, 이름으로 비밀번호 찾기
router.post('/find-mem-exist', controller.findMemExist)

//새 비밀번호 설정
router.post('/new-password', controller.newPasswordSet)

//인증번호 메일 발송
router.get('/get-auth-num/:phone', controller.generateAuthNum)

//인증번호 확인
router.post('/check-auth-num', controller.checkAuthNum)

/*---------------------------*/
//회원 배송지 등록
router.post('/address', controller.addAddress)

//회원 배송지 list 불러오기
router.get('/address/list/:mem_idx', controller.getAddressList)

//회원 특정 배송지 불러오기
router.get('/address/each/:address_id', controller.getAddressById)

//회원 기본 배송지 불러오기
router.get('/address/default/:mem_idx', controller.getDefaultAddress)

//회원 기본배송지 설정
router.put('/address/default', controller.changeDefaultAddress)

//회원 배송지 수정
router.put('/address', controller.updateAddressInfo)

//회원 배송지 삭제
router.delete('/address', controller.deleteAddress)

/**
 * 객체 내보내기
 */
module.exports = router