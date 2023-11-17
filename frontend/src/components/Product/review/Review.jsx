import React, {useEffect, useState} from 'react';
import api, {baseURL} from "../../../api/axios.js";
import DefaultTable from "../../../features/DefaultTable.jsx";
import {SlNote, SlPicture} from "react-icons/sl";
import AddressModal from "../../../features/AddressModal.jsx";
import {Button} from "@mui/material";

export default function Review() {
  const [reviewData, setReviewData] = useState(null)
  const [editModal, setEditModal] = useState(false)
  const [imgModal, setImgModal] = useState(false);
  const [imgModalData, setImgModalData] = useState(null)
  const [editFormData, setEditFormData] = useState({
    rev_idx : 0,
    rev_status : 'Y',
    rev_best: 'N',
  })
  useEffect(() => {
    getData();
  }, [editModal]);

  async function getData() {
    try {
      const {data} = await api.get('super/itemrev');
      console.log(data);
      setReviewData(data);
    } catch (e) {
      alert('리뷰 불러오기 실패')
      console.error(e);
    }
  }
  async function editData() {
    try {
      const res = await api.put('super/itemrev', editFormData);
      console.log(res);
      setEditFormData({
        rev_idx: 0
      })
      setEditModal(false)
    }catch (e) {
      alert('리뷰 수정 실패');
      console.error(e)
    }
  }

  if (!reviewData) return <div>Loading.....</div>
  return (
    <section className='review-list-section'>
      <DefaultTable title='리뷰 목록'>
        <thead>
        <tr>
          <th></th>
          <th>리뷰 상태</th>
          <th>작성자</th>
          <th>작성내용</th>
          <th>제품명</th>
          <th>이미지 여부</th>
          <th>작성일</th>
          <th>관리</th>
        </tr>
        </thead>
        <tbody>
        {reviewData.map(row => (
          <tr key={row.rev_idx}>
            <td>
              {row.rev_best === 'Y' ? (
                <div className='best-label'>BEST</div>
              ) : (
                ''
              )}
            </td>
            {row.rev_status === 'H' && <td className='hide'>숨김</td>}
            {row.rev_status === 'Y' && <td>노출</td>}
            <td>{row.mem_nickname}</td>
            <td>{row.rev_content}</td>
            <td>{row.prd_name}</td>
            <td>
              {row.rev_photo === 'Y'
                ? (<span style={{color: '#4bb2ff'}}>있음</span>)
                : '없음'}
            </td>
            <td>{row.reg_datetime && row.reg_datetime.slice(0, 10)}</td>
            <td>
              {row.rev_photo === 'Y'
                ? (<div className='btn-wrap'>
                  <button onClick={() => {
                    setImgModal(true);
                    setImgModalData(row);
                  }}>
                    <SlPicture />
                  </button>
                  <button onClick={() => {
                    setEditModal(true)
                    setEditFormData({
                      rev_idx : row.rev_idx,
                      rev_status : row.rev_status,
                      rev_best: row.rev_best
                    })
                  }}>
                    <SlNote />
                  </button>
                </div>)
                : (<div className='btn-wrap'>
                  <button onClick={() => {
                    setEditModal(true)
                    setEditFormData({
                      rev_idx : row.rev_idx,
                      rev_status : row.rev_status,
                      rev_best: row.rev_best
                    })
                  }}>
                    <SlNote />
                  </button>
                </div>)}

            </td>
          </tr>
        ))}
        </tbody>
      </DefaultTable>
      {editModal && <AddressModal setView={setEditModal} width='500px' height='500px'>
        <h2 className='title'>
          리뷰 노출 관리
        </h2>
        <label className='review-label'>
          <span>노출 여부</span>
          <select name='rev_status' defaultValue={editFormData.rev_status} onChange={(e) => {
            setEditFormData({
              ...editFormData,
              rev_status: e.target.value
            })
          }}>
            <option value='Y'>노출</option>
            <option value='H'>숨김</option>
          </select>
        </label>
        <label className='review-label'>
          <span>베스트 리뷰 여부</span>
          <select name='rev_status' defaultValue={editFormData.rev_best} onChange={(e) => {
            setEditFormData({
              ...editFormData,
              rev_best: e.target.value
            })
          }}>
            <option value='Y'>설정</option>
            <option value='N'>취소</option>
          </select>
        </label>
        <div className="btn-wrap">
          <Button variant="contained" onClick={editData}>변경</Button>
          <Button variant="contained" color={'error'} onClick={() => setEditModal(false)}>취소</Button>
        </div>
      </AddressModal>}
      {imgModal && <AddressModal setView={setImgModal} width='50vw' height={'70vh'}>
        <h2 className='title'>
          리뷰 상세 정보
        </h2>
        <p className='name'>작성자 : {imgModalData.mem_nickname}</p>
        <p className='content'>리뷰 내용 : {imgModalData.rev_content}</p>
        <ul className='img-wrap'>
          {imgModalData.attach_path && imgModalData.attach_path.map(img => (
            <li className='img-item' key={img.att_idx}>
              <img src={baseURL + img.thumbnail_path.slice(1)} />
            </li>
          ))}
        </ul>
        <div className="btn-wrap">
          <Button variant="contained" color={'error'} onClick={() => setImgModal(false)}>닫기</Button>
        </div>
      </AddressModal>}
    </section>
  );
}


