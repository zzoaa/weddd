import React, {useEffect, useState} from 'react';
import DefaultModal from "../../../features/DefaultModal.jsx";
import {useSelector} from "react-redux";
import api from "../../../api/axios.js";

export default function FaqItems({type, facidx, setView, item}) {
  const [faqFormData, setFaqFormData] = useState({
    fac_idx: '', //글이 등록 될 카테고리의 id
    faq_title: '',
    faq_content: '',
    reg_user: 0,
  })
  const userData = useSelector((state) => state.user.userData);
  const faqdata = item.item

  useEffect(() => {
    if (type !== 'add') {
      getData();
    } else {
      setFaqFormData({
        ...faqFormData,
        reg_user: userData.id,
        fac_idx : facidx,
      })
    }
  }, []);
  return (
    <>
      <DefaultModal setView={setView} width={'700px'} height={'350px'} api={type === 'add' ? addFaq : editFaq}>
        <h3 className='modal-title'>{type === 'add' ? '등록하기' : '수정하기'}</h3>
        <table>
          <tbody>
            <tr>
              <th>FAQ 글 제목</th>
              <td>
                <input type="text" name='faq_title' onChange={inputChange} defaultValue={faqFormData.faq_title}/>
              </td>
            </tr>
            <tr>
              <th>FAQ 글 내용</th>
              <td>
                <textarea name='faq_content' onChange={inputChange} defaultValue={faqFormData.faq_content}>

                </textarea>
              </td>
            </tr>
          </tbody>
        </table>
      </DefaultModal>
    </>
  );

  async function getData() {
    try {
      const {data, status} = await api.get(`/faq/post/${faqdata.faq_idx}`)
      if (status === 200) {
        if(Object.prototype.hasOwnProperty.call(faqFormData,'reg_user')) {
          delete faqFormData['reg_user'];
        }
        setFaqFormData({
          ...faqFormData,
          faq_idx : data.faq_idx,
          fac_idx : data.fac_idx,
          upd_user : userData.id,
          faq_title: data.faq_title,
          faq_content: data.faq_content,
        })
        // console.log('가져오기 성공')
      }
    } catch (e) {
      console.log('faq 내역 불러오기 실패!')
    }
  }
  function inputChange(e) {
    const target = e.target

    setFaqFormData({
      ...faqFormData,
      [target.name] : target.value
    })
  }

  async function addFaq() {
    try {
      const url = `/faq/post`;
      const {status} = await api.post(url, faqFormData)
      // console.log(data);
      if(status === 200) {
        setView(false);
      }
      // console.log(data, 'post')

    } catch (e) {
      console.log('fqa 등록중 에러', e)
    }
  }
  async function editFaq() {
    try {
      const url = `/faq/post`;
      const {status} = await api.put(url, faqFormData)
      // console.log(data);
      if(status === 200) {
        setView(false);
      }
      // console.log(data, 'post')

    } catch (e) {
      console.log('fqa 수정중 에러', e)
    }
  }
}


