import React, {useEffect, useState} from 'react';
import api, {baseURL} from "../../../api/axios.js";
import {useNavigate, useParams} from "react-router-dom";
import DefaultTable from "../../../features/DefaultTable.jsx";

export default function FuncFoodForm() {
  const userData = JSON.parse(sessionStorage.getItem('ud'))
  const navigate = useNavigate();
  const [data, setData] = useState(null)
  const {food_id} = useParams();
  const [formData, setFormData] = useState({
    reg_user: Number(userData.id),
    food_name: '',
    thumb_filepath: '',
  });
  useEffect(() => {
    if (food_id !== 'add') {
      getData()
    }
  }, []);

  if (!formData && !data) return <div>Loading....</div>
  return (
    <div className='func_food_form_section'>
      <button onClick={goBack}>뒤로가기</button>
      <DefaultTable title={food_id === 'add' ? '건강기능식품 등록하기' : '건강기능식품 수정하기'}>
      <tbody>
      <tr className='p10'>
        <th>이름</th>
        <td className='text-left p10'>
          <input
            className='W100'
            type='text'
            defaultValue={data ? data.food_name : formData.food_name}
            onChange={(e) => {
              setFormData({...formData, food_name: e.target.value})
            }}
          /></td>
      </tr>
      <tr className='p10'>
        <th>이미지</th>
        <td className='text-left p10'>
          {data && data['thumb_filepath'].length > 0 && (
            <div className="img-wrap">
            <img src={baseURL + data.thumb_filepath.slice(1)} alt=""/>
          </div>)}
          <input
            className='W100'
            type='file'
            defaultValue={data ? data.thumb_filepath : formData.thumb_filepath}
            onChange={(e) => {
              const file = e.target.files[0]
              console.log(file);
              setFormData({...formData, thumb_filepath: file})
            }}
          /></td>
      </tr>
      </tbody>
    </DefaultTable>
      <div className="flex jcc p10">
        <button className='default-btn' onClick={submit}>{!data ? "등록하기" : "수정하기" }</button>
      </div>
    </div>
  );

  async function getData() {
    try {
      const {data} = await api.get(`healthinfo/funcfood/${food_id}`)

      setFormData({
        ...formData,
        food_name: data.food_name,
        food_idx: data.food_idx
      })
      setData(data);
    } catch (e) {
      console.log(e);
      alert('불러오기 실패')
    }
  }

  async function submit() {
    if(formData.food_name.length < 1) {
      alert('건강기능식품 이름을 입력해주세요.')
      return;
    }
    try {
      if(food_id === 'add' ) {
        const {status} =await api.post('healthinfo/funcfood', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        if(status === 200) {
          alert('등록 성공');
          goBack();
        }
      }else {
        const {status} = await api.put('healthinfo/funcfood' ,formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        if(status === 200) {
          alert('수정 성공');
          goBack();
        }
      }



    }catch (e) {
      console.log(e)
      alert('에러 발생!')
      return;
    }

  }
  function goBack () {
    navigate(-1);
  }
}


