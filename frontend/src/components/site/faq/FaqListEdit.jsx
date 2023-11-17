import React, {useEffect, useState} from 'react';
import DefaultModal from "../../../features/DefaultModal.jsx";
import api from "../../../api/axios.js";
import {useSelector} from "react-redux";

export default function FaqListEdit({type, facidx, setView}) {
  const [data, setData] = useState({
    "fac_idx": null,
    "mem_idx": 0,
    "fac_title": ""
  })
  const userData = useSelector((state) => state.user.userData);
  const [formData, setFormData] = useState({})
  useEffect(() => {
    if (type !== 'add') {
      getData();
    }else {
      setFormData({
        ...formData,
        mem_idx : userData.id
      })
    }
  }, []);

  async function getData() {
    try {
      const url = `faq/category/${facidx}`;
      const {data} = await api.get(url)
      setData(data);
      setFormData({
        ...formData,
        fac_idx : data.fac_idx,
        mem_idx : userData.id,
        fac_title : data.fac_title
      })
    } catch (e) {
      setData(null)
      console.log('fqa 불러오는중 에러', e)
    }
  }

  async function addFac() {
    try {
      const url = `faq/category/add`;
      const {status} = await api.post(url, formData)
      // console.log(data);
      if(status === 200) {
        setView(false);
      }
      // console.log(data, 'post')

    } catch (e) {
      console.log('fqa 등록중 에러', e)
    }
  }

  async function editFac() {
    try {
      const url = `faq/category`;
      const {status} = await api.put(url, formData)
      // console.log('put', data)
      if(status === 200) {
        setView(false);
      }
    } catch (e) {
      console.log('fqa 수정중 에러', e)
    }
  }

  function inputChange(e) {
    const target = e.target

    setFormData({
      ...formData,
      [target.name] : target.value
    })
  }

  if (!data) {
    alert('창 불러오기 실패')
    return;
  }
  return (
    <>
      <DefaultModal width='400px' height='400px' setView={setView} api={type === 'add' ? addFac : editFac}>
        <h3 className='modal-title'>{type === 'add' ? '등록하기' : '수정하기'}</h3>
        <table>
          <tbody>
            <tr>
              <th>FAQ Key</th>
              <td>
                <input type="text" name='fac_idx' onChange={inputChange} defaultValue={data.fac_idx} readOnly={data.fac_idx}/>
              </td>
            </tr>
            <tr>
              <th>FAQ Name</th>
              <td>
                <input type="text" name='fac_title' onChange={inputChange} defaultValue={data.fac_title}/>
              </td>
            </tr>
          </tbody>
        </table>
      </DefaultModal>
    </>
  );
}


