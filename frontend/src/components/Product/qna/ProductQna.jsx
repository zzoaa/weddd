import React, {useEffect, useState} from 'react';
import DefaultTable from "../../../features/DefaultTable.jsx";
import api from "../../../api/axios.js";
import {SlNote} from "react-icons/sl";
import {useNavigate} from "react-router-dom";

export default function ProductQna() {
  const navigate = useNavigate();
  const [proQnaData, setProQnaData] = useState(null);
  const [QnaModal, setQnaModal] = useState(false)
  useEffect(() => {
    getQnaData();
  }, []);

  async function getQnaData() {
    try {
      const {data} = await api.get('/super/itemqa')
      setProQnaData(data);
    }catch (e) {
      alert('문의 불러오기 실패')
      console.error(e);
    }
  }


  if(!proQnaData) return <div>Loading....</div>
  return (
    <section className='product-qna-list'>
      <DefaultTable title='상품 문의 관리'>
        <thead>
          <tr>
            <th>비밀글</th>
            <th>상품명</th>
            <th>작성자</th>
            <th>문의내용</th>
            <th>답변여부</th>
            <th>문의 상태</th>
            <th>문의 날짜</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
        {proQnaData.map(row => (
          <tr key={row.qa_idx}>
            <td>
              {row.qa_secret === 'Y'
              ? <span>O</span>
              : <span></span>}
            </td>
            <td >
              <span className='qna_name'>
              {row.prd_name}
              </span>
            </td>
            <td>{row.mem_nickname}</td>
            <td>{row.qa_content}</td>
            <td>{row.qa_is_answer}</td>
            <td>{row.qa_status}</td>
            <td>{row.reg_datetime.slice(0, 10)}</td>
            <td>
              <div className="btn-wrap">
                <button className='btn' onClick={() => {
                  navigate(`${row.qa_idx}`)
                }}>
                  <SlNote />
                </button>
              </div>
            </td>
          </tr>
          ))}
        </tbody>
      </DefaultTable>
    </section>
  );
}


