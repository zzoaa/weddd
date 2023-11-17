import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import DefaultTable from "../../../features/DefaultTable.jsx";
import api, {baseURL} from "../../../api/axios.js";
import {BiTrash} from "react-icons/bi";

export default function ExerciseForm() {
    const userData = JSON.parse(sessionStorage.getItem('ud'))
    const navigate = useNavigate();
    const [data, setData] = useState(null)
    const {ex_id} = useParams();
    const [formData, setFormData] = useState({
        reg_user: Number(userData.id),
        ex_name: '',
        ex_summary: ['','',''],
        icon_idx: 0,
        thumb_idx: 0,
    });
    const [imgForm, setImgForm] = useState({
        ex_idx : Number(ex_id),
        files : null,
    })
    useEffect(() => {
        if (ex_id !== 'add') {
            getData()
        }
    }, []);
    if (!formData && !data) return <div>Loading....</div>
    return (
      <div className='food_form_section'>
          <button onClick={goBack}>뒤로가기</button>
          <DefaultTable title={ex_id === 'add' ? '추천운동 등록하기' : '추천운동 수정하기'}>
              <tbody>
              <tr className='p10'>
                  <th>이름</th>
                  <td className='text-left p10'>
                      <input
                        className='W100'
                        type='text'
                        defaultValue={data ? data.ex_name : formData.ex_name}
                        onChange={(e) => {
                            setFormData({...formData, ex_name: e.target.value})
                        }}
                      />
                  </td>
              </tr>
              <tr className='p10'>
                  <th>해시태그</th>
                  <td className='text-left p10'>
                      <div>
                          {formData.ex_summary.map((row, idx) => (
                            <React.Fragment key={idx} >
                            <input type="text" name='ex_summary' data-idx={idx} defaultValue={formData.ex_summary[idx]} onChange={onChange}/>
                            <button className='trash-btn' onClick={() => {
                                formData.ex_summary.splice(idx, 1)
                                const newArray = [...formData.ex_summary];
                                setFormData({
                                    ...formData,
                                    ex_summary: newArray
                                })
                            }}><BiTrash /></button>
                            </React.Fragment>
                          ))}
                          {formData.ex_summary.length < 3 && <button type='button' onClick={() => {
                              const newArray = [...formData.ex_summary, '']
                              setFormData({
                                  ...formData,
                                  ex_summary: newArray
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
      </div>
    );

    async function getData() {


        try {
            const {data} = await api.get(`healthinfo/exercise/${ex_id}`)

            // 배열의 길이를 확인하고 필요한 경우 빈 문자열로 채웁니다.
            // const updatedArray = ensureThreeElements(data.ex_summary);
            const newarray = data.ex_summary.map(item => {
                if (item.startsWith('#')) {
                    return item.substring(1);
                }
                return item;
            })


            setFormData({
                ...formData,
                ex_name: data.ex_name,
                ex_idx: data.ex_idx,
                ex_summary: newarray,
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
        if(formData.ex_name.length < 1) {
            alert('추천 운동 이름을 입력해주세요.')
            return;
        }

        try {
            const {status} =await api.put('healthinfo/exercise', formData)
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
        if(target.name !== 'ex_summary') {
            setFormData({
                ...formData,
                [target.name] : target.value
            })
        }else {
            const idx = target.dataset.idx;
            const prevarray = [...formData.ex_summary]
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
            ex_idx : imgForm.ex_idx,
            files: file
        }
        try {
            const {status, data} = await api.post('healthinfo/exercise/addAttachment', uploadData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                }
            })
            if(status === 200) {
                setFormData({
                    ...formData,
                    [e.target.name] : data[0].idx
                })
            }
        }catch (e) {
            alert('업로드 실패');
            console.log(e);
        }


    }
}


