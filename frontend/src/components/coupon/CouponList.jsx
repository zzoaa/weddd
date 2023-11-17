import React, {useEffect, useState} from 'react';
import api from "../../api/axios.js";
import DefaultTable from "../../features/DefaultTable.jsx";
import {BiEdit} from "react-icons/bi";
import {NavLink} from "react-router-dom";
import DefaultModal from "../../features/DefaultModal.jsx";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';


export default function CouponList() {
  const [couponData, setCouponData] = useState(null)
  const [addModal, setAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    "cou_name" : "",
    "cou_exptime" : "",
    "cou_exp_month": 1, //number
    "cou_disc" : "10",
    "cou_type" : "all",
    "cou_minprice" : "0",
    "cou_maxprice" : "2000",
    "cou_limit" : 100 //number
  })
  useEffect(() => {
    getData();
  }, [addModal]);

  async function getData() {
    try {
      const {data} = await api.get('coupon/list')
      setCouponData(data)
    } catch (e) {
      alert('불러오기 실패')
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

  function inputChange(e) {
    if(e.target.name === 'cou_exp_month' && e.target.name === 'cou_limit' ) {
      setAddFormData({
        ...addFormData,
        [e.target.name] : Number(e.target.value)
      })
    }else {
      setAddFormData({
        ...addFormData,
        [e.target.name] : e.target.value
      })
    }

  }

  async function addSubmit() {
    try {
      const {status} = await api.post('coupon/create', addFormData)
      if(status === 200) {
        setAddModal(false)
      }

    }catch (e) {
      console.error(e)
      alert('등록중 에러 발생')
    }
  }

  if (!couponData) return <div>Loading...</div>


  return (
    <section className='coupon-list-section'>
      <div className='btn-wrap end'>
        <button className='btn' onClick={() => {
          setAddModal(true);
        }}>
          등록하기
        </button>
      </div>
      <DefaultTable title='쿠폰 관리'>
        <thead>
        <tr>
          <th>이름</th>
          <th>쿠폰만료 타입</th>
          <th>쿠폰만료 개월</th>
          <th>최대쿠폰수(개)</th>
          <th>사용쿠폰수(개)</th>
          <th>할인율(%)</th>
          <th>최소할인금액(원)</th>
          <th>최대할인금액(원)</th>
          <th>생성날짜</th>
          <th>종료날짜</th>
          <th>관리</th>
        </tr>
        </thead>
        <tbody>
        {couponData.list.map(row => (
          <tr key={row.cou_id}>
            <td>{row.cou_name}</td>
            <td>{row.cou_type === 'all' ? '일괄만료' : '생성일자 기준만료'}</td>
            <td>{row.cou_exp_month}</td>
            <td>{row.cou_limit}</td>
            <td>{row.cou_count}</td>
            <td>{row.cou_disc}</td>
            <td>{row.cou_minprice}</td>
            <td>{row.cou_maxprice}</td>
            <td>
              <div style={{whiteSpace: 'pre-line'}}>
              {changeDate(row.cou_regtime)}
              </div>
            </td>
            <td>
              <div style={{whiteSpace: 'pre-line'}}>
                {changeDate(row.cou_exptime)}
              </div>
            </td>
            <td>
              <div className="btn-wrap">
                <NavLink to={`${row.cou_id}`}>
                  <BiEdit />
                </NavLink>
              </div>
            </td>
          </tr>
        ))}

        </tbody>
      </DefaultTable>
      {addModal && <DefaultModal setView={setAddModal} width={'30vw'} height={'70vh'} api={addSubmit}>
        <DefaultTable title={'쿠폰 추가'} tableClass='coupon-add-table'>
          <tbody>
            <tr>
              <th>이름</th>
              <td className='text-left'>
                <label>
                  <input type="text" name={'cou_name'} onChange={inputChange}/>
                </label>
              </td>
            </tr>
            <tr>
              <th>타입</th>
              <td className='text-left'>
                <label>
                  <select name={'cou_type'} onChange={inputChange} defaultValue={addFormData.cou_type}>
                    <option value={'all'}>일괄 만료</option>
                    <option value={'start'}>시작일 기준 만료</option>
                  </select>
                </label>
              </td>
            </tr>
            {addFormData.cou_type === 'start' && <tr>
              <th>만료 개월수</th>
              <td>
                <label>
                  <input type='text' name={'cou_exp_month'} onChange={inputChange} />
                </label>
              </td>
            </tr>}
            {addFormData.cou_type === 'all' && <tr>
              <th>만료날짜</th>
              <td>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateCalendar showDaysOutsideCurrentMonth onChange={(e) => {

                    setAddFormData({
                      ...addFormData,
                      cou_exptime:e.$d,
                    })
                  }}/>
                </LocalizationProvider>
              </td>
            </tr>
            }
            <tr>
              <th>할인율(%) </th>
              <td className='text-left'>
                <label>
                  <input type='text' name={'cou_disc'} onChange={inputChange} defaultValue={addFormData.cou_disc} />
                </label>
              </td>
            </tr>
            <tr>
              <th>할인 최소 금액(원) </th>
              <td className='text-left'>
                <label>
                  <input type='text' name={'cou_minprice'} onChange={inputChange} defaultValue={addFormData.cou_minprice} />
                </label>
              </td>
            </tr>
            <tr>
              <th>할인 최대 금액(원) </th>
              <td className='text-left'>
                <label>
                  <input type='text' name={'cou_maxprice'} onChange={inputChange} defaultValue={addFormData.cou_maxprice} />
                </label>
              </td>
            </tr>
            <tr>
              <th>쿠폰 발행 갯수(개)</th>
              <td className='text-left'>
                <label>
                  <input type='text' name={'cou_limit'} onChange={inputChange} defaultValue={addFormData.cou_limit} />
                </label>
              </td>
            </tr>
          </tbody>
        </DefaultTable>
      </DefaultModal>}
    </section>
  );
}




