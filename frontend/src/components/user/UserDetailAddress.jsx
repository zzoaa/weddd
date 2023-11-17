import React, {useEffect, useState} from 'react';
import AddressModal from "../../features/AddressModal.jsx";
import api from "../../api/axios.js";

export default function UserDetailAddress({setView, data}) {
  const [address, setAddress] = useState({
    ad_zonecode : 0,
    ad_addr1: '',
    ad_addr2: '',
  });
  const [formData, setFormData] = useState({
    "ad_id" : data.ad_id,
    "mem_idx" : data.mem_idx,
    "ad_subject" : data.ad_subject,
    "ad_name" : data.ad_name,
    "ad_tel" : data.ad_tel,
    "ad_hp" : data.ad_hp,
    "ad_zonecode" : data.ad_zonecode,
    "ad_addr1" : data.ad_addr1,
    "ad_addr2" : data.ad_addr2,
  })

  useEffect(() => {
    setAddress({
      ...address,
      ad_zonecode: data.ad_zonecode,
      ad_addr1: data.ad_addr1,
      ad_addr2: data.ad_addr2
    })
  }, []);

  return (
    <AddressModal setView={setView} width={'40vw'} height={'65vh'}>
      <h3 className='addressList-title'>주소지 관리</h3>
      <table className='addressList-table'>
        <tbody>
        <tr>
          <th>배송 받는 사람</th>
          <td>
            <input type={'text'} defaultValue={data.ad_name} name={'ad_name'} onChange={handleInput}/>
          </td>
        </tr>
        <tr>
          <th>배송지 이름</th>
          <td>
            <input type={'text'} defaultValue={data.ad_subject} name={'ad_subject'} onChange={handleInput}/>
          </td>
        </tr>
        <tr>
          <th>전화번호</th>
          <td>
            <input type={'text'} defaultValue={data.ad_tel} name={'ad_tel'} onChange={handleInput}/>
          </td>
        </tr>
        <tr>
          <th>핸드폰번호</th>
          <td>
            <input type={'text'} defaultValue={data.ad_hp} name={'ad_hp'} onChange={handleInput}/>
          </td>
        </tr>
        <tr>
          <th>
            우편번호
            <span className='btn-wrap'>
              <button onClick={handleSearch}>주소검색</button>
            </span>
          </th>
          <td>
            <input type={'text'} value={formData.ad_zonecode} name={'ad_zonecode'} readOnly={true}/>
          </td>
        </tr>
        <tr>
          <th>주소</th>
          <td>
            <input type="text" value={formData.ad_addr1} name={'ad_addr1'} readOnly={true}/>
          </td>
        </tr>
        <tr>
          <th className='addr-2'>상세주소</th>
          <td>
            <input type="text" value={formData.ad_addr2} name={'ad_addr2'} onChange={handleInput}/>

          </td>
        </tr>
        </tbody>
      </table>
      <div className='btn-wrap mt20'>
        <button className='success btn' onClick={() => {
          submit()
        }}>{formData.ad_id !== 0 ? '수정' : '등록'}
        </button>
        <button className='cancle btn' onClick={() => {
          setView(false)
        }}>취소
        </button>
      </div>
    </AddressModal>




  );
  function handleSearch() {
    new window.daum.Postcode({
      oncomplete: function(data) {
        console.log(data);
        setFormData({
          ...formData,
          ad_zonecode: data.zonecode,
          ad_addr1: data.address,
        })
      }
    }).open();
  }
  function handleInput(e) {
    setFormData({
      ...formData,
      [e.target.name] : e.target.value
    })
  }
  async function submit() {
    try {
      if(formData.ad_id !== 0) {
        const {status} = await api.put('members/address', formData)
        if(status === 200) {
          alert('수정 성공')
          setView(false);
        }
      }else {

        const {status} = await api.post('members/address', formData)
        if(status === 200) {
          alert('등록 성공')
          setView(false);
        }
      }

    }catch (e) {
      if(formData.ad_id !== 0) {
        alert('수정실패')
        console.log('수정 실패!')
        console.error(e)
      }else {
        alert('등록실패')
        console.log('등록 실패!')
        console.error(e)
      }


    }

  }
}


