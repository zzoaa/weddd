import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import DefaultTable from "../../features/DefaultTable.jsx";
import api from "../../api/axios.js";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import Tab from "@mui/material/Tab";
import Pagination from "@mui/material/Pagination";

export default function CouponEdit() {
  const {cou_id} = useParams()
  const navigate = useNavigate();
  const [nav, setNav] = useState({
    page: 1,
    pagerow: 10,
  })
  const [couponData, setCouponData] = useState(null);

  useEffect(() => {
    getData();
  }, [nav]);

  async function getData(){
    try {
      const {data} = await api.get(`/coupon/list/${cou_id}?page=${nav.page}&pagerow=${nav.pagerow}`)
      console.log(data);
      setCouponData(data);
    }catch (e) {
      alert('불러오기 실패')
      console.error(e)
    }

  }
  if(!couponData) return <div>Loading....</div>

  return (
    <section className='coupon-edit'>
      <div className='btn-wrap'>
        <button onClick={ () => {
          navigate(-1)
        }}>뒤로가기</button>
      </div>
      <DefaultTable title='쿠폰 발급 내역'>
        <thead>
        <tr>
          <th>사용자 이름</th>
          <th>쿠폰 이름</th>
          <th>상태</th>
          <th>발급 날자</th>
          <th>사용날짜</th>
          <th>만료날짜</th>
          <th>메모</th>
        </tr>
        </thead>
        <tbody>
        {couponData.list.map(row => (
          <tr key={row.serial_num}>
            <td>{row.mem_nickname}</td>
            <td>{row.cou_name}</td>
            <td>{row.status === 'Y' ? '정상' : '만료'}</td>
            <td>{row.coupon_issue_date.slice(0, 10)}</td>
            <td>{row.coupon_use_date ? row.coupon_use_date.slice(0, 10) : '미사용'}</td>
            <td>{row.cou_exptime.slice(0, 10)}</td>
            <td>{row.del_memo ? row.del_memo : ''}</td>
          </tr>
        ))}

        </tbody>
      </DefaultTable>
      <div className='pagerow'>
        <TabContext value={String(nav.pagerow)}>

          <TabList className={'pagerow-tab'} onChange={(e, value) => {
            setNav({
              ...nav,
              pagerow: Number(value)
            })
          }}>
            <Tab className={'tab'} label="5" value="5"/>
            <Tab className={'tab'} label="10" value="10"/>
            <Tab className={'tab'} label="15" value="15"/>
          </TabList>
        </TabContext>
      </div>
      <Pagination className='pagination' count={Math.floor(couponData.totalcount / nav.pagerow)} size="small"
                  variant="outlined" color="primary" page={nav.page} onChange={(e, value) => {
        setNav({
          ...nav,
          page: value
        })
      }}/>
    </section>
  );
}


