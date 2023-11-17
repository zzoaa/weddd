import React, {useEffect, useState} from 'react';
import {BarChart} from '@mui/x-charts/BarChart';
import {Loading} from "../loading.jsx";
import api from '../../api/axios.js'

export default function DashboardChart() {
  const [pcData, setPcData] = useState([])

  const [totalLoginStatsData, setTotalLoginStatsData] = useState({
    'total': 0, 'pc': 0, 'mo': 0
  })
  const [monthlyLoginStatsData, setMonthlyLoginStatsData] = useState({
    'total': 0, 'pc': 0, 'mo': 0
  })
  const [todayLoginStatsData, setTodayLoginStatsData] = useState({
    'total': 0, 'pc': 0, 'mo': 0
  })
  /**
   * 날짜 변환 함수
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}-${date.getDate()}`;
  };
  useEffect(() => {
    async function getDashboard() {
      // 현재 날짜 얻기
      let currentDate = new Date();
      // console.log(currentDate);
      let yyyy = currentDate.getFullYear();
      let mm = String(currentDate.getMonth() + 1).padStart(2, '0'); // January is 0!
      let dd = String(currentDate.getDate()).padStart(2, '0');
      currentDate = `${yyyy}-${mm}-${dd}`;
      console.log(currentDate)
      // 한달 전 날짜 얻기
      let prevDate = new Date();
      prevDate.setMonth(prevDate.getMonth() - 1);
      yyyy = prevDate.getFullYear();
      mm = String(prevDate.getMonth() + 1).padStart(2, '0');
      dd = String(prevDate.getDate()).padStart(2, '0');
      prevDate = `${yyyy}-${mm}-${dd}`;
      await api.get(`super/statics/days?startdate=${prevDate}&enddate=${currentDate}`).then(res => {
        // console.log(res);
        res.data.map(row => {
          setPcData((state) => {
            return [...state, {
              date: formatDate(row.std_date), pc: row.std_count - row.std_mobile, mobile: row.std_mobile
            }]
          })

          setMonthlyLoginStatsData((state) => {
            return {
              ...state,
              'total': state.total + row.std_count,
              'pc': state.pc + row.std_count - row.std_mobile,
              'mo': state.mo + row.std_mobile
            }
          })
        })
      }).catch(err => console.error('한달 통계 오류', err))
      await api.get(`/super/statics/days`).then(res => {
        // console.log(res.data);
        res.data.map(row => {
          setTotalLoginStatsData((state) => {
            return {
              ...state,
              'total': state.total + row.std_count,
              'pc': state.pc + row.std_count - row.std_mobile,
              'mo': state.mo + row.std_mobile
            }
          })
        })
        setTodayLoginStatsData((state) => {

          return {
            ...state,
            'total': state.total + res.data[res.data.length - 1].std_count,
            'pc': state.pc + res.data[res.data.length - 1].std_count - res.data[res.data.length - 1].std_mobile,
            'mo': state.mo + res.data[res.data.length - 1].std_mobile
          }
        })
      }).catch(err => console.error('전체기간 통계 오류', err))
    }

    getDashboard()
  }, [])
  if (pcData.length <= 0) {
    return (<Loading/>)
  }
  return (<div className='dash-section'>
    <div className='chart-wrap'>
      <BarChart
        dataset={pcData}
        xAxis={[{scaleType: 'band', dataKey: 'date'}]}
        series={[
          {dataKey: 'pc', label: 'PC 접속자', stack: 'A', color: '#5187af'},
          {dataKey: 'mobile', label: 'Mobile접속자', stack: 'A', color: '#b2a6ff'}
          // {data: pcData, stack: 'A', label: 'PC 접속자', },
          // {data: moData, stack: 'A', label: 'Mobile 접속자', },
        ]}
      />
    </div>
    <div className='user-table'>
      <h2 className='table-title'>최근 방문자 통계</h2>
      <table>
        <thead>
        <tr>
          <th>구분</th>
          <th>방문자</th>
          <th>PC</th>
          <th>MOBILE</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <th>Total</th>
          <td>{totalLoginStatsData.total}</td>
          <td>{totalLoginStatsData.pc}</td>
          <td>{totalLoginStatsData.mo}</td>
        </tr>
        <tr>
          <th>최근30일</th>
          <td>{monthlyLoginStatsData.total}</td>
          <td>{monthlyLoginStatsData.pc}</td>
          <td>{monthlyLoginStatsData.mo}</td>
        </tr>
        <tr>
          <th>오늘</th>
          <td>{todayLoginStatsData.total}</td>
          <td>{todayLoginStatsData.pc}</td>
          <td>{todayLoginStatsData.mo}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>);
}


