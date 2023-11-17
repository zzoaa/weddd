import React, {useEffect, useState} from 'react'
import {useNavigate, useParams} from "react-router-dom";
import api, {baseURL} from "../../../api/axios.js";
import DefaultTable from "../../../features/DefaultTable.jsx";
import {Button} from "@mui/material";

export default function ProductQnaEdit() {
  const {qa_idx} = useParams();
  const navigate = useNavigate();
  const [qaData, setQaData] = useState(null)
  const userData = JSON.parse(sessionStorage.getItem('ud'))
  const [qaFormData, setQaFormData] = useState({
    "qa_idx": qa_idx,
    "qa_a_content": "",
    "qa_a_mem_idx": userData.id
  })
  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    try {
      const {data} = await api.get(`products/qna/${qa_idx}`)
      console.log(data);
      setQaData(data);
    } catch (e) {
      console.error(e);
      alert('불러오기 실패')
    }
  }

  async function Submit() {
    try {
      const {status} = await api.post('super/itemqa', qaFormData)
      if (status === 200) {
        alert('답변달기 성공')
        getData()
      }
    } catch (e) {
      console.error(e)
      alert('답변달기 실패')
    }
  }

  if (!qaData) return <div>Loading.....</div>
  return (
    <div className='pro-qna-edit'>
      <button onClick={() => {
        navigate(-1)
      }}>뒤로가기
      </button>
      <DefaultTable title='상품 문의 관리' tableClass={'pro-qna-edit-table'}>
        <tbody>
        <tr>
          <th>작성자</th>
          <td>{qaData.mem_nickname}</td>
        </tr>
        <tr>
          <th>작성일</th>
          <td>{qaData.reg_datetime.slice(0, 10)}</td>
        </tr>
        {/*<tr>*/}
        {/*  <th>사진</th>*/}
        {/*  <td>*/}
        {/*    <div className='img-wrap'>*/}
        {/*      {qaData.attach_path && qaData.attach_path.map(row => (*/}
        {/*        <img key={row.att_idx} src={baseURL + row.att_filepath.slice(1)}/>*/}
        {/*      ))}*/}
        {/*    </div>*/}
        {/*  </td>*/}
        {/*</tr>*/}
        <tr>
          <th>문의내용</th>
          <td>
            {qaData.qa_content}
          </td>
        </tr>
        <tr>
          <th>답글</th>
          <td>{qaData.qa_is_answer === 'Y'
            ? (<div>{qaData.qa_a_content}</div>)
            : (<textarea className={'qa_content'} name={'qa_a_content'} onChange={(e) => {
              setQaFormData({...qaFormData, qa_a_content: e.target.value})
            }}></textarea>)
          }</td>
        </tr>
        </tbody>
      </DefaultTable>
      <div className="btn-wrap">
        <Button color={'primary'} variant={'contained'} onClick={Submit}>답변달기</Button>
      </div>
    </div>
  )
}
