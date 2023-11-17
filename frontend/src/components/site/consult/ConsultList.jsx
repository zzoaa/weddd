import React, {useEffect, useState} from 'react';
import api from "../../../api/axios.js";
import DefaultTable from "../../../features/DefaultTable.jsx";
import {useNavigate} from "react-router-dom";
import {BiTrash} from "react-icons/bi";
import {useSelector} from "react-redux";
import Alert from "../../../features/Alert.jsx";

export default function ConsultList() {
  const [data, setData] = useState(null)

  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('ud'))
  const [delAlert, setDelAlert] = useState({
    active: false,
    idx: 0,
    mem_idx: 0,
  })
  const [selectItem, setSelectItem] = useState(null)
  useEffect(() => {
      getData();

  }, []);

  //초기 리스트 데이터 불러오기
  async function getData() {
    //임시 폼데이터
    const formData = {
      mem_idx : user.id
    }

    try {
      const {data} = await api.post('consult/manage', formData)
      console.log(data);
      if(data.fail === "권한이 없습니다.") {
        alert(data.fail);
        navigate(-1)
        return;
      }

      setData(data);
    } catch (e) {
      alert('데이터 불러오기 실패!')
      console.error(e);
      navigate('/')
    }
  }
  //아이템 한개 삭제 하기
  async function delData() {
    const formData = {
      mem_idx : delAlert.mem_idx,
      cst_id : delAlert.idx,
    }
    try {
      const {status} = await api.delete('consult/del', {
        data: formData
      })
      setDelAlert({
        active: false,
        idx: 0,
      })
      if(status === 200) {
        alert('삭제 성공')
      }
      // console.log(data)
      getData();


    }catch (e) {
      console.log(e)
      alert('삭제 중 에러 발생!')
      setDelAlert({
        active: false,
        idx: 0,
      })
    }

  }

  if (!data) return <div>Loading.....</div>
  return (
    <section className='consult-list'>
      <DefaultTable title='1대1 영양상담 관리'>
        <thead>
        <tr>
          <th>상태</th>
          <th>제목</th>
          <th>내용</th>
          <th>문의자</th>
          <th>작성시간</th>
          <th>관리</th>
        </tr>
        </thead>
        <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            <td>
              {row.cst_step === '답변대기'
                ? (<span className='ready'>답변대기</span>)
                : (<span className='success'>답변완료</span>)
              }
            </td>
            <td>
              <span className='cst_title'>{row.cst_title}</span>

            </td>
            <td>
              <span className='cst_content'>
              {row.cst_content}
              </span>

            </td>
            <td>{row.mem_nickname}</td>
            <td>
              {row.cst_regtime.slice(0, 10)}
            </td>
            <td>
              <div className='btn-wrap'>
                <button className={`default-btn ${row.csa_status !== 'Y' ? 'mr16' : ''}`} onClick={() => {
                  navigate(String(row.cst_id))
                }}>
                  답변내역 보기
                </button>
                {row.csa_status !== 'Y' && <button className='del-btn' onClick={() => {
                  setDelAlert({
                    active: true,
                    idx: row.cst_id,
                    mem_idx: row.mem_idx,
                  })
                  setSelectItem(row);
                }}>
                  <BiTrash/>
                </button>}
              </div>
            </td>
          </tr>
        ))}
        </tbody>
      </DefaultTable>
      {delAlert.active && <Alert setView={setDelAlert} delapi={delData}>
        삭제하시겠습니까?
      </Alert>}
    </section>
  );
}



