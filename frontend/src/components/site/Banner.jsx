import React, {useEffect, useState} from 'react';
import api, {baseURL} from '../../api/axios.js'
import {MdDeleteForever, MdOutlineModeEditOutline} from "react-icons/md";
import DefaultModal from "../../features/DefaultModal.jsx";
import Alert from "../../features/Alert.jsx";


export default function Banner() {
  const [listdata, setListData] = useState(null);
  const [itemdata, setItemData] = useState(null);
  const [itemEditModal, setItemEditModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editImgFile, setEditImgFile] = useState(null)
  const [currentState, setcurrentState] = useState('등록')
  const [alertView, setalertView] = useState({
    'active' : false,
    'idx' : 0,
  });

  const initItem = {
    "bng_key": 0,
    "ban_name": "",
    "ban_filepath": null,
    "ban_link_url": "",
    "ban_timer_start": `${Date()}`,
    "ban_timer_end": `${Date()}`,
  }
  useEffect(() => {
    getBanner();
  }, []);
  if (!listdata) {
    return (<div>Loading....</div>)
  }
  return (<>
    <section className='banner-section'>
      <h1 className='title'>
        배너 관리

      </h1>
      <div className='banner-inner'>
        <table className='banner-table'>
          <thead className='banner-header'>
          <tr>
            <th>분류이름</th>
            <th>관리</th>
          </tr>
          </thead>
          <tbody>
          {listdata.map(item => {
            return (<tr key={item.bng_idx}>
              <td className='bannergroup-name' onClick={() => {
                getBannerItem(item.bng_idx)
              }}>{item.bng_name}</td>
              <td>
                <button className='btn edit' type='button'><MdOutlineModeEditOutline/></button>
                <button className='btn del' type='button'><MdDeleteForever/></button>
              </td>
            </tr>)
          })}
          </tbody>
        </table>
        {itemdata && (<table className='banneritem-table'>
          <thead>
          <tr>
            <th>썸네일</th>
            <th>이름</th>
            <th>
              관리
              <button className='btn' onClick={() => {
                setcurrentState('등록')
                setEditItem({
                  ...initItem,
                  'bng_key' : itemdata[0].bng_key
                });
                setItemEditModal(true)
              }}>등록하기</button>
            </th>
          </tr>
          </thead>
          <tbody>
          {itemdata.map(item => {
            return (<tr key={item.ban_idx}>
              <td>
                <div className='img-wrap'>
                  <img src={baseURL + (item.ban_filepath).slice(1)} alt={item.ban_name}/>
                </div>
              </td>
              <td>
                {item.ban_name}
              </td>
              <td>
                <button className='btn edit' onClick={() => {
                  setEditItem(item)
                  setcurrentState('수정')
                  setItemEditModal(true)
                }} type='button'><MdOutlineModeEditOutline/></button>
                <button className='btn del' onClick={() => {
                  setalertView({
                    'idx' : item.ban_idx,
                    active: true
                  })
                }} type='button'><MdDeleteForever/></button>
              </td>
            </tr>)
          })}
          </tbody>
        </table>)}
      </div>
    </section>
    {itemEditModal && (<DefaultModal setView={setItemEditModal} api={currentState == '수정' ? editBannerItem : addBannerItem} width='500px' height='500px'>
      {currentState === '수정'  && (
        <>
          <table className='banner-edit01-t'>
            <tbody>
            <tr>
              <th>
                배너이름
              </th>
              <td>
                <input type="text" defaultValue={editItem.ban_name} onChange={(e) => {
                  setEditItem({
                    ...editItem,
                    'ban_name' : e.target.value
                  })
                }}/>
              </td>
            </tr>

            <tr>
              <th>
                배너파일
              </th>
              <td className='banner-img'>
                {editItem.ban_filepath && (<img src={baseURL + (editItem.ban_filepath).slice(1)}/>)}
                <input type="file" onChange={(e) => {

                  setEditItem({
                    ...editItem,
                    'ban_filepath': null,
                  })
                  const file = e.target.files[0];
                  if (file) {
                    setEditImgFile(file);
                  }
                }}/>
                <div className='sub_text'>권장 너비 : {editItem.bng_width}px</div>
                <div className='sub_text'>권장 높이 : {editItem.bng_height}px</div>
              </td>
            </tr>
            <tr>
              <th>
                이동 URL
              </th>
              <td>
                <input type={'text'} defaultValue={editItem.ban_link_url} onChange={(e) => {
                  setEditItem({
                    ...editItem,
                    'ban_link_url' : e.target.value
                  })
                }}/>
              </td>
            </tr>
            </tbody>
          </table>

        </>)}
      {
        currentState === '등록' && (
          <>
            <table className='banner-edit01-t'>
              <tbody>
              <tr>
                <th>
                  배너이름
                </th>
                <td>
                  <input type="text" defaultValue={editItem.ban_name} onChange={(e) => {
                    setEditItem({
                      ...editItem,
                      'ban_name' : e.target.value
                    })
                  }}/>
                </td>
              </tr>

              <tr>
                <th>
                  배너파일
                </th>
                <td className='banner-img'>
                  {editItem.ban_filepath && (<img src={baseURL + editItem.ban_filepath.slice(1)}/>)}
                  <input type="file" onChange={(e) => {

                    setEditItem({
                      ...editItem,
                      'ban_filepath': null,
                    })
                    const file = e.target.files[0];
                    if (file) {
                      setEditImgFile(file);
                    }
                  }}/>
                  <div className='sub_text'>권장 너비 : {editItem.bng_width}px</div>
                  <div className='sub_text'>권장 높이 : {editItem.bng_height}px</div>
                </td>
              </tr>
              <tr>
                <th>
                  이동 URL
                </th>
                <td>
                  <input type={'text'} defaultValue={editItem.ban_link_url} onChange={(e) => {
                    setEditItem({
                      ...editItem,
                      'ban_link_url' : e.target.value
                    })
                  }}/>
                </td>
              </tr>
              </tbody>
            </table>
          </>
        )
      }
    </DefaultModal>)}
    {alertView.active && <Alert setView={setalertView} delapi={delBannerItem}>
      <div>삭제 하시겠습니까?</div>
    </Alert>}
  </>);

  async function getBanner() {
    await api.get('banner/groups').then(res => {
      console.log('list', res);
      setListData(res.data);
    })
  }

  async function getBannerItem(id) {
    await api.get(`banner/${id}/list`).then(res => {
      console.log('item', res)
      setItemData(res.data)
    }).catch(error => console.error('item 가져오기 실패', error))
  }

  async function editBannerItem() {

    const formData = new FormData();

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    // editItem에서 필요한 데이터를 가져와 formData에 추가
    formData.append("ban_idx", editItem.ban_idx);
    formData.append("ban_name", editItem.ban_name);
    formData.append("ban_filepath", editImgFile ?? editItem.filepath); // setEditImgFile에서 설정한 파일 객체
    formData.append("ban_link_url", editItem.ban_link_url);
    formData.append('ban_timer_start', formattedDate);
    formData.append('ban_timer_end', formattedDate);


    try {
      const response = await api.put(`/banner/edit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response);
      setItemEditModal(false)
      setItemData(null      )
      // 성공적으로 수정되었을 때의 로직 (예: 알림 표시)
    } catch (error) {
      console.error('수정 실패', error);
      // 실패했을 때의 로직 (예: 에러 메시지 표시)
    }

  }
  async function addBannerItem() {
    const formData = new FormData();
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    // editItem에서 필요한 데이터를 가져와 formData에 추가
    formData.append("bng_key", editItem.bng_key);
    formData.append("ban_name", editItem.ban_name);
    formData.append("ban_filepath", editImgFile); // setEditImgFile에서 설정한 파일 객체
    formData.append("ban_link_url", editItem.ban_link_url);
    formData.append('ban_timer_start', formattedDate);
    formData.append('ban_timer_end', formattedDate);

    try {
      const response = await api.post(`/banner/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response);
      setItemEditModal(false)
      setItemData(null      )
      // 성공적으로 수정되었을 때의 로직 (예: 알림 표시)
    } catch (error) {
      console.error('등록 실패', error);
      // 실패했을 때의 로직 (예: 에러 메시지 표시)
    }

  }

  async function delBannerItem() {
    api.delete('banner/del',{
      data: {
        "ban_idx" : alertView.idx
      }
    }).then(res => {
      console.log(res)
      setalertView({
        idx: 0,
        active: false
      })
      setItemData(null)
    }).catch(err => console.error(err, '삭제중에 에러 발생했습니다.'))
  }
}


