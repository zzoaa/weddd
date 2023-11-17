import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import DefaultTable from "../../../features/DefaultTable.jsx";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';
import api, {baseURL} from "../../../api/axios.js";
import {Button} from "@mui/material";

export default function ConsultResult() {
  const {cst_id} = useParams()
  const navigate = useNavigate();
  const userData = JSON.parse(sessionStorage.getItem('ud'))
  const [data, setData] = useState(null)
  const [formData, setFormData] = useState({
    "cst_id": cst_id,
    "mem_idx" : userData.id,
    "csa_content" : '',
  })
  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    try {
      const {data} = await api.post(`consult/details`, {
        cst_id: Number(cst_id)
      })
      console.log(data);
      setData(data);
    } catch (e) {
      console.log(e)
      alert('불러오기 실패')
    }
  }

  async function Submit() {
    try {
      const {status} = await api.post('consult/answer', formData);
      if(status) {
        alert('답변 달기 완료')
        getData();
      }
    }catch (e) {
      console.warn(e, '답변 작성 중 에러')
    }
  }


  if (!data) return <div>Loading....</div>
  return (
    <section className='consult-result'>
      <div className="btn-wrap">
        <button onClick={() => {navigate(-1)}}>
          뒤로가기
        </button>
      </div>
      <DefaultTable title={'1대1 영양상담 관리'}>
        <tbody>
        <tr>
          <th>상담 신청 날짜</th>
          <td>{data.cst_regtime.slice(0, 10)}</td>
        </tr>
        <tr>
          <th>
            회원 이름
          </th>
          <td>
            {data.mem_nickname}
          </td>
        </tr>
        <tr>
          <th>
            상담 내용
          </th>
          <td>
            <div>
              {data.cst_content}
            </div>
          </td>
        </tr>
        <tr>
          <th>상담 답변</th>
          <td>
            {data.answer
              ? <div dangerouslySetInnerHTML={{ __html: data.answer.csa_content }} />
              : (<ReactQuill theme="snow" onChange={(value) => {setFormData({...formData, csa_content: value})}}/>)}
          </td>
        </tr>
        {data.attach_path && <tr>
          <th>등록된 이미지</th>
          <td>
            <div className={'img-wrap'}>
              {data.attach_path.map((item, idx) => (
                <div key={idx} className={'img-box'}>
                  <img src={baseURL + item.att_filepath.slice(1)}/>
                </div>
              ))}
            </div>
          </td>
        </tr>}
        </tbody>
      </DefaultTable>
      {!data.answer && <div className="btn-wrap fl-jc-c mt20">
        <Button color={'primary'} size={'medium'} variant={'contained'} onClick={Submit}>답변 작성하기</Button>
      </div>}
    </section>
  );
}



