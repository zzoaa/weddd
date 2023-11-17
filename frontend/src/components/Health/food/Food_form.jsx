import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import api, {baseURL} from "../../../api/axios.js";
import DefaultTable from "../../../features/DefaultTable.jsx";
import {BiTrash} from "react-icons/bi";
import {Button} from "@mui/material";
import Alert from "../../../features/Alert.jsx";

export default function FoodForm() {
  const userData = JSON.parse(sessionStorage.getItem('ud'))
  const navigate = useNavigate();
  const [data, setData] = useState(null)
  const {food_id} = useParams();
  const [formData, setFormData] = useState({
    reg_user: Number(userData.id),
    food_name: '',
    food_summary: [],
    icon_idx: 0,
    thumb_idx: 0,
  });
  const [imgAlert, setImgAlert] = useState({
    active: false,
    idx: 0,
    name: '',
  })
  const [imgForm, setImgForm] = useState({
    food_idx : Number(food_id),
    files : null,
  })
  useEffect(() => {
    if (food_id !== 'add') {
      getData()
    }
  }, []);

  function imgDel () {
    if(imgAlert.name === 'icon_idx') {
      setFormData({
        ...formData,
        icon_idx: 0
      })
    }else if(imgAlert.name === 'thumb_idx') {
      setFormData({
        ...formData,
        thumb_idx: 0
      })
    }
    setData({
      ...data,
      thumb_filepath : null,
    })
    setImgAlert({
      ...imgAlert,
      active: false,
      name : '',
    })
  }

  if (!formData && !data) return <div>Loading....</div>
  return (
    <div className='food_form_section'>
      <button onClick={goBack}>뒤로가기</button>
      <DefaultTable title={food_id === 'add' ? '건강식품 등록하기' : '건강식품 수정하기'}>
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
            />
          </td>
        </tr>
        <tr className='p10'>
          <th>해시태그</th>
          <td className='text-left p10'>
            <div>
              {formData.food_summary.map((row, idx) => (
                <React.Fragment key={idx} >
                  <input type="text" name='food_summary' data-idx={idx} defaultValue={formData.food_summary[idx]} onChange={onChange}/>
                  <button className='trash-btn' onClick={() => {
                    formData.food_summary.splice(idx, 1)
                    const newArray = [...formData.food_summary];
                    setFormData({
                      ...formData,
                      food_summary: newArray
                    })
                  }}><BiTrash /></button>
                </React.Fragment>
              ))}
              {formData.food_summary.length < 3 && <button className='add-btn' type='button' onClick={() => {
                const newArray = [...formData.food_summary, '']
                setFormData({
                  ...formData,
                  food_summary: newArray
                })
              }}>추가하기</button>}
            </div>
          </td>
        </tr>
        <tr className='p10'>
          <th>아이콘</th>
          <td className='text-left p10'>
            {data && data['icon_filepath'] && (
              <div className="img-wrap">
                <img src={baseURL + data.icon_filepath.slice(1)} alt=""/>
                <Button color={'error'} size={'large'} style={{fontSize: '21px'}} onClick={() => {
                  setImgAlert({
                    ...imgAlert,
                    active: true,
                    name: 'icon_idx'
                  })
                }}>
                  <BiTrash />
                </Button>
              </div>)}
            <input
              className='W100'
              type='file'
              name='icon_idx'
              onChange={imgUpload}
            /></td>
        </tr>
        <tr className='p10'>
          <th>이미지</th>
          <td className='text-left p10'>
            {data && data['thumb_filepath']&& (
              <div className="img-wrap">
                <img src={baseURL + data.thumb_filepath.slice(1)} alt=""/>
                <Button color={'error'} size={'large'} style={{fontSize: '21px'}} onClick={() => {
                  setImgAlert({
                    ...imgAlert,
                    active: true,
                    name: 'thumb_idx'
                  })
                }}>
                  <BiTrash />
                </Button>
              </div>)}
            <input
              className='W100'
              type='file'
              name='thumb_idx'
              onChange={imgUpload}
            /></td>
        </tr>
        </tbody>
      </DefaultTable>
      <div className="flex jcc p10">
        <button className='default-btn' onClick={submit}>{!data ? "등록하기" : "수정하기" }</button>
      </div>
      {imgAlert.active && <Alert setView={setImgAlert} delapi={imgDel}>
        삭제 하시겠습니까?<br/>
        <span style={{fontSize: '12px', color: '#868686'}}>수정하기 버튼을 눌러야 적용 됩니다.</span>
      </Alert>}
    </div>
  );

  async function getData() {
    try {
      const {data} = await api.get(`healthinfo/food/${food_id}`)

      const newarray = data.food_summary.map(item => {
        if (item.startsWith('#')) {
          return item.substring(1);
        }
        return item;
      })

      setFormData({
        ...formData,
        food_name: data.food_name,
        food_idx: data.food_idx,
        food_summary: newarray,
        icon_idx: data.icon_idx,
        thumb_idx : data.thumb_idx,
      })
      setData(data);
    } catch (e) {
      console.log(e);
      alert('불러오기 실패')
    }
  }

  async function submit() {
    if(formData.food_name.length < 1) {
      alert('건강식품 이름을 입력해주세요.')
      return;
    }

    try {
        const {status} =await api.put('healthinfo/food', formData)
        if(status === 200) {
          alert('수정 성공');
          goBack();
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

  function onChange(e) {
    const target = e.target
    if(target.name !== 'food_summary') {
      setFormData({
        ...formData,
        [target.name] : target.value
      })
    }else {
      const idx = target.dataset.idx;
      const prevarray = [...formData.food_summary]
      prevarray[idx] = target.value
      setFormData({
        ...formData,
        [target.name] : prevarray,
      })
    }

  }
  async function imgUpload(e) {
    const file = e.target.files[0]
    const uploadData = {
      food_idx : imgForm.food_idx,
      files: file
    }
    try {
      const res= await api.post('healthinfo/food/addAttachment', uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      })
      if(res.status === 200) {

        setFormData({
          ...formData,
          [e.target.name] : res.data[0].idx
        })

        console.log(e.target.name);
        if(e.target.name === 'icon_idx') {
          setData({
            ...data,
            icon_filepath : res.data[0].path
          })
        }else if(e.target.name === 'thumb_idx') {
          setData({
            ...data,
            thumb_filepath : res.data[0].path
          })
        }

      }
    }catch (e) {
      alert('업로드 실패');
      console.log(e);
    }


  }
}


