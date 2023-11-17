import React, {useEffect, useState} from 'react';
import DefaultModal from "../../features/DefaultModal.jsx";
import api from "../../api/axios.js";
import {useSelector} from "react-redux";
import DefaultTable from "../../features/DefaultTable.jsx";
import UserAddressList from "./UserAddressList.jsx";
import Alert from "../../features/Alert.jsx";
import InfoModal from "../../features/InfoModal.jsx";
import {NavLink} from "react-router-dom";
import {BiEdit} from "react-icons/bi";

export default function UserEdit({setView, userdata}) {
  const [defaultAddress, setDefaultAddress] = useState(null)
  const [userAddress, setUserAddress] = useState(null);
  const [addressModal, setAddressModal] = useState(false);
  const [levModal, setLevModal] = useState(false) // 등급 모달창 토글
  const [levLIst, setLevLIst] = useState(null) // 등급 목록
  const [levFormData, setLevFormData] = useState({
    mem_idx: 0,
    lev_idx: 0,
  }) // 등급 수정할때 사용할 폼
  const [couponModal, setCouponModal] = useState(false)
  const [couponList, setCouponList] = useState(null);
  const [couponnav, setCouponnav] = useState({
    page: 1,
    pageRow: 4,
    totalCount: 0,
  })
  const [authList, setAuthList] = useState(null)
  const [user, setUser] = useState(null);
  const [userInfoModal, setUserInfoModal] = useState({
    active: false,
    idx: 0,
    type: '',
  })
  const [userInfoFormData, setUserInfoFormData] = useState({
    mem_idx: userdata.mem_idx
  })
  const [passFormData, setPassFormData] = useState({
    "mem_idx": userdata.mem_idx,
    "newPassword": "",
    "newPasswordCheck": ""
  })
  const [passAlert, setPassAlert] = useState({
    active: false,
    idx: 0,
  })
  useEffect(() => {
    getUserData()

  }, [userInfoModal, levModal]);
  useEffect(() => {
    getDefaultAddress()
  }, [addressModal]);
  useEffect(() => {
    getAuthList()
  }, [userInfoModal]);
  useEffect(() => {
    getLevlist()
  }, [levModal]);
  useEffect(() => {
    getCouponList();
  }, [couponModal, couponnav.page]);
  async function getUserData() {
    try {
      const res = await api.get(`members/list/${userdata.mem_idx}`)
      setUser(res.data);
    }catch (e) {
      console.error(e);
      alert('유저 정보 가져오기 실패')
      setView(false);
    }
  }

  async function getDefaultAddress() {
    try {
      const {data} = await api.get(`members/address/default/${userdata.mem_idx}`)
      setDefaultAddress(data);
    } catch (e) {
      console.log(e);
      if (e.response.data.error === '조회 할 기본 배송지가 없습니다.') return;
      alert('기본주소 조회 실패!')
      console.error(e)
    }
  }

  async function getAddressList() {
    try {
      const {data, status} = await api.get(`members/address/list/${userdata.mem_idx}`)
      if (status === 200) {
        setAddressModal(true)
        setUserAddress(data);
      }
    } catch (e) {
      alert('주소 조회 실패!')
      console.error(e)
    }
  }

  async function getAuthList() {
    try {
      const {data, status} = await api.get('super/auth/list')
      if (status === 200) {
        setAuthList(data.list)
      }
    } catch (e) {
      alert('권한 불러오기 실패')
      console.error(e);
    }
  }

  function infoInputChange(e) {
    if(e.target.name === 'auth') {
      setUserInfoFormData({
        ...userInfoFormData,
        [e.target.name]: Number(e.target.value)
      })
    }else {
      setUserInfoFormData({
        ...userInfoFormData,
        [e.target.name]: e.target.value
      })
    }

  }

  async function infoModalSubmit() {
    try {
      const {status} = await api.put('super/mem/Info', userInfoFormData)
      if(status === 200) {
        alert('수정 성공')
        setUserInfoModal({
          ...userInfoModal,
          active: false,
          idx: 0,
          type: ''
        })
      }
    }catch (e) {
      console.error(e);
      alert('정보 수정에 실패했습니다.')
    }

  }

  async function editPassword() {
    console.log(passFormData)
    if (passFormData.newPassword !== passFormData.newPasswordCheck) {
      alert('비밀번호가 동일하지 않습니다. 확인 해주세요.')
      return;
    }
    delete passFormData.newPasswordCheck
    if (!/^(?:(?=.*[a-z])(?=.*\d)|(?=.*[a-z])(?=.*[\W_])|(?=.*\d)(?=.*[\W_])).{8}$/.test(passFormData.newPassword)) {
      alert('비밀번호는 8자 이상, 둘이상의 문자,숫자 및 특수문자를 사용하셔야 합니다')
      return;
    }
    try {
      const {status} = await api.post('members/new-password', passFormData)
      if (status === 200) {
        alert('비밀번호 초기화 성공')
        setPassAlert({
          ...passAlert,
          active: false,
          idx: 0,
        })
      }
    } catch (e) {
      alert('비밀번호 초기화 실패')
      console.error(e);
    }
  }

  /**
   * 등급 리스트 불러오기
   * @returns {Promise<void>}
   */
  async function getLevlist() {
    try {
      const {data} = await api.get('super/level/list')
      setLevLIst(data);
    }catch (e) {
      alert('등급 목록 불러오기 실패')
      setLevModal(false);
      console.error(e);
    }
  }

  /**
   * 등급 변경 인풋 폼데이터 변경 함수
   * @param e
   */
  function levinputChange(e) {
    setLevFormData({
      ...levFormData,
      lev_idx: e.target.value
    })
  }
  async function levSubmit() {
    try {
      const {status} = await api.put('super/mem/level', levFormData)
      if(status === 200) {
        alert('성공')
        setLevModal(false)
      }
    }catch (e) {
      alert('수정 실패')
      console.error(e);
    }
  }

  /**
   * 날짜를 원하는 형태로 변환
   * @retrun:String
   * @param str :string
   * */
  function changeDate(str) {
    const tempArray = str.split('T')
    // let count = 1;
    // const timeString = tempArray[1].split('').map(str => {
    //   let result = '';
    //   if(str === ':') {
    //     if(count === 1) {
    //       result = '시';
    //       count++;
    //     }else if(count === 2) {
    //       result = '분';
    //       count++;
    //     }
    //   }else {
    //     if(str === ".") {
    //       result = '초';
    //       count++;
    //     }else {
    //       result = str
    //     }
    //   }
    //   return result
    // })

    const newString = tempArray[0]
    return newString;
  }
  function coulistdisalbe () {
    setCouponModal(false)
  }
  function editflase () {
    setView(false)
  }

  async function getCouponList() {
    try {
      const {data} = await api.get(`coupon/mem/${userdata.mem_idx}?page=${couponnav.page}`)
      setCouponList(data);
      setCouponnav({
        ...couponnav,
        totalCount: data.totalCouCount
      })
      console.log(data);
    }catch (e) {
      console.error(e);
    }
  }
  return (
    <>
      <DefaultModal setView={setView} width={'70vw'} height={'80vh'} api={editflase}>
        <DefaultTable tableClass='userEdit-table' title='회원 관리'>
          <thead>
          <tr>
            <th></th>
            <th>필드명</th>
            <th style={{width: '200px',}}>관리</th>
          </tr>
          </thead>
          {user && <tbody>
          <tr>
            <th>id</th>
            <td>{user.mem_userid}</td>
            <td>
              <div className='btn-wrap'>
                <button onClick={() => {
                  setPassAlert({
                    active: true,
                    idx: user.mem_userid
                  })
                }}>비밀번호 초기화
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <th>이름</th>
            <td colSpan={2}>{user.mem_nickname}</td>
          </tr>
          <tr>
            <th>E-mail</th>
            <td>{user.mem_email}</td>
            <td>
              <div className='btn-wrap'>
                <button onClick={() => {
                  setUserInfoModal({
                    ...userInfoModal,
                    active: true,
                    idx: user.mem_idx,
                    type: 'email'
                  })
                  setUserInfoFormData({
                    ...userInfoFormData,
                    mem_email: user.mem_email
                  })
                }}>이메일 변경</button>
              </div>
            </td>
          </tr>
          <tr>
            <th>Phone</th>
            <td>{user.mem_phone}</td>
            <td>
              <div className='btn-wrap'>
                <button onClick={() => {
                  setUserInfoModal({
                    ...userInfoModal,
                    active: true,
                    idx: user.mem_idx,
                    type: 'phone'
                  })
                  setUserInfoFormData({
                    ...userInfoFormData,
                    mem_phone: user.mem_phone
                  })
                }}>전화번호 변경</button>
              </div>
            </td>
          </tr>
          <tr>
            <th>등급</th>
            <td>{user.lev_idx}</td>
            <td>
              <div className='btn-wrap'>
                <button onClick={() => {
                  setLevModal(true)
                  setLevFormData({
                    ...levFormData,
                    mem_idx : user.mem_idx,
                    lev_idx: user.lev_idx,
                  })
                }}>등급 변경</button>
              </div>
            </td>
          </tr>
          <tr>
            <th>권한</th>
            <td>{user.mem_auth}</td>
            <td>
              <div className='btn-wrap'>
                <button onClick={() => {
                  setUserInfoModal({
                    ...userInfoModal,
                    active: true,
                    idx: user.mem_idx,
                    type: 'auth'
                  })
                }}>권한 변경
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <th>주소지 관리</th>
            <td>{defaultAddress ? defaultAddress.ad_addr1 + ' ' + defaultAddress.ad_addr2 : '설정된 기본 배송지가 없습니다.'}</td>
            <td>
              <div className='btn-wrap'>
                <button onClick={() => {
                  getAddressList();
                }}>주소지 관리
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <th>쿠폰 관리</th>
            <td colSpan={2}>
              <button onClick={() => {
                setCouponModal(true)
              }}>
                쿠폰 목록 보기
              </button>
            </td>
          </tr>
          </tbody> }

        </DefaultTable>
      </DefaultModal>
      {addressModal &&
        <UserAddressList setView={setAddressModal} data={userAddress} defaultAddress={defaultAddress ? defaultAddress : null} getData={getAddressList}/>}
      {passAlert.active && <InfoModal setView={setPassAlert} height={'250px'} api={editPassword}>
        <table className='passEdit-table'>
          <tbody>
          <tr>
            <th>비밀번호</th>
            <td>
              <input type="password" name={'newPassword'} onChange={(e) => {
                setPassFormData({
                  ...passFormData,
                  [e.target.name]: e.target.value
                })
              }}/>
            </td>
          </tr>
          <tr>
            <th>비밀번호 확인</th>
            <td>
              <input type="password" name={'newPasswordCheck'} onChange={(e) => {
                setPassFormData({
                  ...passFormData,
                  [e.target.name]: e.target.value
                })
              }}/>
            </td>
          </tr>
          </tbody>
        </table>
      </InfoModal>}
      {userInfoModal.active && <InfoModal setView={setUserInfoModal} api={infoModalSubmit} height={'180px'}>
        {userInfoModal.type === 'auth' && <table>
          <tbody>
          <tr>
            <th>등급</th>
            <td>
              <select name='mem_auth' onChange={infoInputChange} defaultValue={user.mem_auth}>
                {authList && authList.map(row => (
                  <option key={row.ath_idx} value={row.ath_idx}>{row.ath_idx}</option>
                ))}
              </select>
            </td>
          </tr>
          </tbody>
        </table>}
        {userInfoModal.type === 'email' && <table>
          <tbody>
          <tr>
            <th>이메일</th>
            <td>
              <input name='mem_email' onChange={infoInputChange} defaultValue={user.mem_email} />
            </td>
          </tr>
          </tbody>
        </table>
        }
        {userInfoModal.type === 'phone' && <table>
          <tbody>
          <tr>
            <th>전화번호</th>
            <td>
              <input name='mem_phone' onChange={infoInputChange} defaultValue={user.mem_phone} />
            </td>
          </tr>
          </tbody>
        </table>
        }
      </InfoModal>}
      {levModal && <DefaultModal setView={setLevModal} api={levSubmit} height={'180px'}>
        <div className='lev_modal'>
          <label>
            <span className='mr16'>회원 등급</span>
            <select name="lev_select" onChange={levinputChange} defaultValue={levFormData.lev_idx}>
              {levLIst && levLIst.map(row => (
                <option key={row.lev_idx} value={row.lev_idx}>{row.lev_idx} : {row.lev_name}</option>
              ))}
            </select>
          </label>
        </div>
        </DefaultModal>
      }
      {couponModal && <DefaultModal setView={setCouponModal} width={'50vw'} height={'80vh'} api={coulistdisalbe}>
        <DefaultTable title='회원 쿠폰 내역'>
          <thead>
          <tr>
            <th>사용유무</th>
            <th>쿠폰이름</th>
            <th>발급날짜</th>
            <th>종료날짜</th>

          </tr>
          </thead>
          <tbody>
          {couponList.memCouList && couponList.memCouList.map((row, idx) => (
            <tr key={idx}>
              <td>{row.use_datetime ? row.use_datetime.slice(0, 10) : (<span style={{color: '#969696'}}>미사용</span>)}</td>
              <td>{row.cou_name}</td>
              <td>
                <div style={{whiteSpace: 'pre-line'}}>
                  {row.reg_datatime.slice(0, 10)}
                </div>
              </td>
              <td>
                <div style={{whiteSpace: 'pre-line'}}>
                  {row.exp_datetime.slice(0, 10)}
                </div>
              </td>

            </tr>
          ))}

          </tbody>
        </DefaultTable>
        {couponList.memCouList && <PaginationComponent totalCount={couponnav.totalCount}/>}
      </DefaultModal>}
    </>
  );
  function PaginationComponent ({ totalCount }) {
    // 페이지당 아이템 수는 4로 가정
    const itemsPerPage = 4;
    // 총 페이지 수 계산
    const pageCount = Math.floor(totalCount / itemsPerPage);
    // 페이지 배열 생성
    const pages = new Array(pageCount).fill(null);

    return (
      <div className='pagination'>
        {pages.map((item, index) => (
          <span key={`cotemp${index}`} className={couponnav.page === index+1 ? 'on' : ''} onClick={() => {
            setCouponnav({
              ...couponnav,
              page : index+1,
            })
          }}>{index + 1}</span>
        ))}
      </div>
    );
  }
}


