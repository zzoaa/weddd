import React, {useEffect, useState} from 'react';
import api from "../../../api/axios.js";
import DefaultTable from "../../../features/DefaultTable.jsx";
import InquiryResult from "./Inquiry_result.jsx";

export default function Inquiry() {
  const [data, setData] = useState(null)
  const [resultModalToggle, setResultModalToggle] = useState(false)
  const [resultItem, setResultItem] = useState({})
  useEffect(() => {
    getData();
  }, [resultModalToggle]);

  if(!data) {
    return <div>Loading....</div>
  }


  return (
    <section className='inquiry-list'>

      <DefaultTable title={'문의내역'} tableClass={'inquiry-table'}>
        <thead>
          <tr>
            <th>답변여부</th>
            <th>문의분류</th>
            <th>문의제목</th>
            <th className='content'>문의내용</th>
            <th>문의자</th>
            <th>연락처</th>
            <th>E-mail</th>
            <th>작성일자</th>
            <th>답변</th>
          </tr>
        </thead>
        <tbody>
        {data.map(row => (
          <tr key={row.cst_id}>
            <td>{row.cst_step === '답변대기'
                ? (<span className='ready'>답변대기</span>)
                : (<span className='success'>답변완료</span>)
            }
            </td>
            <td>{row.cat_name}</td>
            <td>{row.cst_title}</td>
            <td className='content'>{row.cst_content}</td>
            <td>{row.mem_nickname}</td>
            <td>{row.cst_phone}</td>
            <td>{row.cst_email}</td>
            <td>{row.cst_regtime.slice(0,10)}</td>
            <td>
              <div className='btn-wrap'>
                <button className='default-btn' onClick={() => {
                  setResultModalToggle(true)
                  setResultItem(row);
                }}>
                  답변내역 보기
                </button>
              </div>
            </td>
          </tr>
        ))}
        </tbody>
      </DefaultTable>
      {resultModalToggle && <InquiryResult setView={setResultModalToggle} item={resultItem}/>}
    </section>
  );
  async function getData() {
    const {data} = await api.get('super/inquiry/all')
    setData(data);
  }
}


