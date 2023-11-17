import React, {useEffect, useState} from 'react';
import DefaultModal from "../../../features/DefaultModal.jsx";
import DefaultTable from "../../../features/DefaultTable.jsx";
import {useSelector} from "react-redux";
import api from "../../../api/axios.js";

export default function InquiryResult({setView, item}) {
  const [data, setData] = useState(null)
  const [formData, setFormData] = useState({
    cst_id : 0,
    reg_user : 0,
    csa_content: ''
  })
  // 답변 달았을시 답변 단 사람 닉네임
  const [regUserName, setRegUserName] = useState('');
  const userData = useSelector((state) => state.user.userData);
  useEffect(() => {
    setData(item);
    if(item.answer) {
      getUser();
    }
    setFormData({
      ...formData,
      cst_id : item.cst_id,
      reg_user: userData.id
    })
  }, []);
  if(!data) return <div>Loading....</div>

  async function postResult() {
    try {
      const {status} = await api.post('super/inquiry', formData)
      if(status === 200) {
        setView(
        false
        )
      }
    }catch (e) {
      console.log('에러 발생')
      console.log(e)
    }

  }
  async function getUser() {
    try {
      const {data, status} = await api.get(`members/list/${item.answer.reg_user}`)
      console.log(data);
      if(status === 200) {
        setRegUserName(data.mem_nickname)
      }

    }catch (e) {
      alert('작성자 데이터 가져오는중 에러 발생!')
      console.log(e)
    }
  }
  function inputChange(e) {
    const target = e.target

    setFormData({
      ...formData,
      [target.name] : target.value
    })
  }

  return (
    <DefaultModal setView={setView} width={'500px'} height={'500px'} api={postResult}>
      <DefaultTable tableClass='inquiry_result_table' title={'답변 관리'}>
        <tbody>
          <tr>
            <th>상태</th>
            <td>{item.cst_step}</td>
          </tr>
          <tr>
            <th>문의제목</th>
            <td>{item.cst_title}</td>
          </tr>
          <tr>
            <th>문의내용</th>
            <td>{item.cst_content}</td>
          </tr>
          <tr>
            <th>답변자</th>
            <td>{
              !item.answer
                  ? (<input className='W100' type='text' name='reg_user' defaultValue={userData.name} readOnly={true}/>)
                  : (<span>{regUserName}</span>)
            }</td>
          </tr>
          <tr>
            <th>답변내용</th>
            <td>
              {
                !item.answer
                    ? (<textarea className={'input-textarea'} name='csa_content' defaultValue={item.csa_content} onChange={inputChange}></textarea>)
                  : (<span>{item.answer.csa_content}</span>)
              }
            </td>
          </tr>
        </tbody>
      </DefaultTable>
    </DefaultModal>
  );
}


