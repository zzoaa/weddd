import React, {useEffect, useState} from 'react';
import AddressModal from "../../features/AddressModal.jsx";
import {BiEdit, BiTrash} from "react-icons/bi";
import api from "../../api/axios.js";
import UserDetailAddress from "./UserDetailAddress.jsx";
import Alert from "../../features/Alert.jsx";
import {Form} from "react-router-dom";

export default function UserAddressList({setView, data, defaultAddress, getData}) {
  const [formData, setFormData] = useState({
    ad_id: 0,
    mem_idx: data[0].mem_idx,
  })
  const [detailAdrressModal, setDetailAdrressModal] = useState(false)
  const [addAddressModal, setAddAddressModal] = useState(false);
  const [delAddressAlert, setDelAddressAlert] = useState({
    active: false,
    idx: 0,
    item: null,
  })
  const [selectItem, setSelectItem] = useState(null)

  useEffect(() => {
    if (defaultAddress) {
      setFormData({
        ...formData,
        ad_id: defaultAddress.ad_id
      })
    }
  }, []);
  useEffect(() => {
    getData()
  }, [detailAdrressModal, delAddressAlert]);
  async function defaultAddressEdit() {
    try {
      const {status} = await api.put('members/address/default', formData)
      if (status === 200) {
        alert('기본배송지 수정 성공')
        setView(false);
      }
    } catch (e) {
      alert('기본배송지 수정 실패!')
      console.error(e)
    }
  }

  function checkInput(e) {
    setFormData({
      ...formData,
      ad_id: Number(e.target.value)
    })
  }
  async function delData() {

    const formData = {
      ad_id: delAddressAlert.idx,
      mem_idx: delAddressAlert.item.mem_idx,
    }
    try {
      const {data, status} = api.delete('members/address', {
        data: formData
      })
      if(status === 200) {
        console.log(data);
        alert('삭제성공')
        setDelAddressAlert({
          ...delAddressAlert,
          active: false,
          idx: 0,
          item: null
        })
      }

    }catch (e) {
      alert('삭제 실패')
      console.log('삭제 실패')
      console.error(e)
    }

  }
  return (
    <>
    <AddressModal setView={setView} width={'70vw'} height={'500px'}>
      <h3 className='addressList-title'>
        <span>주소지 관리</span>
        <button className='btn' onClick={() => {setAddAddressModal(true)}}>주소 추가</button>
      </h3>
      <table className='addressList-table'>
        <thead>
        <tr>
          <th>기본배송지</th>
          <th>배송 받는 사람</th>
          <th>배송지 이름</th>
          <th>전화번호</th>
          <th>핸드폰번호</th>
          <th>우편번호</th>
          <th>주소</th>
          <th>상세주소</th>
          <th>관리</th>
        </tr>
        </thead>
        <tbody>
        {data.map(row => (
          <tr key={row.ad_id}>
            <td>
              <label>
                <input type="checkbox" name='ad_id' value={row.ad_id} checked={row.ad_id === formData.ad_id} onChange={checkInput}/>
              </label>
            </td>
            <td>{row.ad_name}</td>
            <td>{row.ad_subject}</td>
            <td>{row.ad_tel}</td>
            <td>{row.ad_hp}</td>
            <td>{row.ad_zonecode}</td>
            <td>{row.ad_addr1}</td>
            <td>{row.ad_addr2}</td>
            <td>
              <div className='btn-wrap'>
                <button onClick={() => {
                  setSelectItem(row)
                  setDetailAdrressModal(true);
                }}>
                  <BiEdit/>
                </button>
                <button className='cancle' onClick={() => {
                  setDelAddressAlert({
                    ...delAddressAlert,
                    active : true,
                    idx: row.ad_id,
                    item: row
                  })
                }}>
                  <BiTrash />
                </button>
              </div>

            </td>
          </tr>
        ))}
        </tbody>
      </table>
      <div className='btn-wrap mt20'>
        <button className='success w150 btn' onClick={() => {
          defaultAddressEdit();
        }}>기본배송지 설정
        </button>
        <button className='cancle btn' onClick={() => {
          setView(false)
        }}>취소
        </button>
      </div>
    </AddressModal>
      {detailAdrressModal && <UserDetailAddress setView={setDetailAdrressModal} data={selectItem}/>}
      {addAddressModal && <UserDetailAddress setView={setAddAddressModal} data={{
        "ad_id" : 0,
        "mem_idx" : data[0].mem_idx,
        "ad_subject" : '',
        "ad_name" : '',
        "ad_tel" : '',
        "ad_hp" : '',
        "ad_zonecode" : '',
        "ad_addr1" : '',
        "ad_addr2" : '',
        }} /> }
      {delAddressAlert.active && <Alert setView={setDelAddressAlert} delapi={delData}>
        삭제하시겠습니까?
      </Alert>}
    </>
  );
}


