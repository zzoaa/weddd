import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import DefaultTable from "../../../features/DefaultTable.jsx";
import api, {baseURL} from "../../../api/axios.js";

export default function RecipeForm() {
  const userData = JSON.parse(sessionStorage.getItem('ud'))
  const navigate = useNavigate();
  const [data, setData] = useState(null)
  const {rec_id} = useParams();
  const [formData, setFormData] = useState({
    reg_user: Number(userData.id),
    rec_name: '',
    thumb_filepath: '',
  });
  useEffect(() => {
    if (rec_id !== 'add') {
      getData()
    }
  }, []);


  if (!formData && !data) return <div>Loading....</div>
  return (
    <div className='recipe_form_section'>
      <button onClick={goBack}>뒤로가기</button>
      <DefaultTable title={rec_id === 'add' ? '추천레시피 등록하기' : '추천레시피 수정하기'}>
        <tbody>
        <tr className='p10'>
          <th>이름</th>
          <td className='text-left p10'>
            <input
              className='W100'
              type='text'
              defaultValue={data ? data.rec_name : formData.rec_name}
              onChange={(e) => {
                setFormData({...formData, rec_name: e.target.value})
              }}
            /></td>
        </tr>
        <tr className=''>
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
      const {data} = await api.get(`healthinfo/recipe/${rec_id}`)
      setFormData({
        ...formData,
        rec_name: data.rec_name,
        rec_idx: data.rec_idx
      })
      setData(data);
    } catch (e) {
      console.log(e);
      alert('불러오기 실패')
    }
  }

  async function submit() {
    if(formData.rec_name.length < 1) {
      alert('추천레시피 이름을 입력해주세요.')
      return;
    }
    if(formData.thumb_filepath === '') {
      delete formData.thumb_filepath;
    }
    try {
      if(rec_id === 'add' ) {
        const {status} =await api.post('healthinfo/recipe', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        if(status === 200) {
          alert('등록 성공');
          goBack();
        }
      }else {
        const {status} = await api.put('healthinfo/recipe' ,formData, {
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


