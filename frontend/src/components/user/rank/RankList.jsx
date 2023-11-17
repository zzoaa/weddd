import React, {useEffect, useState} from 'react';
import api from "../../../api/axios.js";
import DefaultTable from "../../../features/DefaultTable.jsx";
import {SlNote, SlTrash} from "react-icons/sl";
import {Button} from "@mui/material";
import DefaultModal from "../../../features/DefaultModal.jsx";
import Alert from "../../../features/Alert.jsx";

export default function RankList() {
  const [rankData, setRankData] = useState(null)
  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(false);
  const [delModal, setDelModal] = useState({
    active: false,
    idx: 0,
  });
  const [editFormData, setEditFormData] = useState({
    lev_idx: 0,
    lev_name: '',
    lev_check: '',
  })
  const [addFormData, setAddFormData] = useState({
    lev_name: '',
    lev_check: '',
  })
  useEffect(() => {
    getData()
  }, [addModal, editModal, delModal]);

  async function getData() {
    try {
      const {data} = await api.get('super/level/list')
      setRankData(data);
    } catch (e) {
      console.error(e);
    }
  }
  function addOnChange(e) {
    setAddFormData({
      ...addFormData,
      [e.target.name] : e.target.value
    })
  }

  function editOnChange(e) {
    setEditFormData({
      ...editFormData,
      [e.target.name] : e.target.value
    })
  }

  async function addSubmit () {
    if(addFormData.lev_check.length <= 0 ) {
      alert('등급 기준을 입력해주세요.')
      return;
    }
    if(addFormData.lev_name.length <= 0 ) {
      alert('등급 이름을 입력해주세요')
      return;
    }
    try {
      const {status} = await api.post('super/level', addFormData)
      if(status === 200) {
        alert('등록 성공')
        setAddModal(false)
        setAddFormData({
          lev_name: '',
          lev_check: '',
        })
      }
    }catch (e) {
      alert('등록 실패')
      console.error(e)
    }
  }

  async function editSubmit() {
    try {
      const {status} = await api.put('super/level', editFormData)
      if(status === 200) {
        alert('수정 성공')
        setEditModal(false)
        setEditFormData({
          lev_idx: 0,
          lev_name: '',
          lev_check: '',
        })
      }
    }catch (e) {
      alert('수정 실패')
      console.error(e)
    }
  }

  async function delSubmit() {

    try {
      const {status} = await api.delete('super/level', {
        data: {
          lev_idx: delModal.idx
        }
      })
      if(status === 200) {
        alert('삭제 성공')
        setDelModal({
          ...delModal,
          active: false,
          idx: 0,
        })
      }
    }catch (e) {
      alert('삭제 실패')
      console.error(e)
    }
  }

  if (!rankData) return <div>Loading....</div>
  return (
    <>
      <div className="btn-wrap" style={{display: 'flex', justifyContent: 'end'}}>
        <Button variant='outlined' size='medium' onClick={() => {setAddModal(true)}}>등록하기</Button>
      </div>
      <DefaultTable title={'등급 관리'}>
        <thead>
        <tr>
          <th>이름</th>
          <th>등급 올라가는 기준(구매횟수)</th>
          <th>관리</th>
        </tr>
        </thead>
        <tbody>
        {rankData.map(row => (
          <tr key={row.lev_idx}>
            <td>{row.lev_name}</td>
            <td>{row.lev_check}회</td>
            <td>
              <div className="btn-wrap">
                <button className='mr16' onClick={() =>{
                  setEditFormData({
                    ...editFormData,
                    lev_idx: row.lev_idx,
                    lev_name: row.lev_name,
                    lev_check: row.lev_check,

                  })
                  setEditModal(true);
                }}>
                  <SlNote/>
                </button>
                <button className='red' onClick={() => {
                  setDelModal({
                    ...delModal,
                    active: true,
                    idx: row.lev_idx
                  })
                }}>
                  <SlTrash />
                </button>
              </div>
            </td>
          </tr>
        ))}
        </tbody>
      </DefaultTable>
      {addModal && <DefaultModal setView={setAddModal} api={addSubmit} width={'300px'} height={'200px'}>
        <div className='ft14'>
          <label>
            <span className='mr16'>등급 이름</span>
            <input className='p5' type="text" name='lev_name' onChange={addOnChange}/>
          </label>
          <label>
            <span className='mr16'>등급 기준</span>
            <input className='p5' type="text" name='lev_check' onChange={addOnChange}/>
          </label>
        </div>
      </DefaultModal>}
      {editModal && <DefaultModal setView={setEditModal} api={editSubmit} width={'300px'} height={'200px'}>
        <div className='ft14'>
          <label>
            <span className='mr16'>등급 이름</span>
            <input className={'p5'} type="text" name='lev_name' onChange={editOnChange} defaultValue={editFormData.lev_name}/>
          </label>
          <label>
            <span className='mr16'>등급 기준</span>
            <input className={'p5'} type="text" name='lev_check' onChange={editOnChange} defaultValue={editFormData.lev_check}/>
          </label>
        </div>
      </DefaultModal>}
      {delModal.active && <Alert setView={setDelModal} delapi={delSubmit}>
        삭제 하시겠습니까?
      </Alert>
        }
    </>
  );
}


