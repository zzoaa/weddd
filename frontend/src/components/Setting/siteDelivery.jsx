import React, {useEffect, useState} from 'react'
import api from '../../api/axios';
import 'react-quill/dist/quill.snow.css';
import {AiOutlinePlus} from "react-icons/ai";

export default function SiteDelivery() {
  const [formData, setFormData] = useState(null)
  const [costArray, setCostArray] = useState([]);

  async function getSetting() {
    await api.get('super/setting/basic').then(res => {
      // console.log(res.data);
      setFormData({
        ...formData,
        'shop_delivery_company': res.data.shop_delivery_company, // 배송사
        'shop_delivery_cost': res.data.shop_delivery_cost, // 차등 적용할 가격
        'shop_delivery_info': res.data.shop_delivery_info, // 배송 정책
        'shop_delivery_type': res.data.shop_delivery_type, // 배송 유형 [무료, 차등적용]
        'shop_refund_info': res.data.shop_refund_info, // 교환/반품 안내 정책

      })
      setCostArray(
        JSON.parse(res.data.shop_delivery_cost)
      )
    }).catch(error => console.error('통신중 에러 ', error))
  }

  async function editDelivery(e) {
    e.preventDefault();

    await api.post('super/setting/basic', formData).then(res => {
      // console.log(res)
      alert(res.data.message)
    }).catch(error => console.error(error))
  }


  useEffect(() => {
    getSetting()
  }, []);

  if (!formData) {
    return (
      <div>Loading....</div>
    )
  }


  return (
    <section className='delivery-section'>
      <h1 className='delivery-title'>배송 설정</h1>
      <form className='delivery_form' onSubmit={editDelivery}>
        <article className='shop_delivery_company'>
          <label className="form_label">
            <div className='label_name'>배송업체</div>
            <select name="delivery_company" defaultValue={formData.shop_delivery_company} onChange={(e) => {
              setFormData({
                ...formData,
                'shop_delivery_company': e.target.value
              })
            }}>
              <option value="없음">없음</option>
              <option value="우체국">우체국</option>
              <option value="CJ대한통운">CJ대한통운</option>
              <option value="롯데택배">롯데택배</option>
              <option value="한진택배">한진택배</option>
              <option value="경동택배">경동택배</option>
            </select>
          </label>
        </article>
        <article className='shop_delivery_type'>
          <label className='form_label'>
            <span className='label_name'>배송비 유형</span>
            <select name="delivery_company" defaultValue={formData.shop_delivery_type} onChange={(e) => {
              setFormData({
                ...formData,
                'shop_delivery_type': e.target.value
              })
            }}>
              <option value="무료">무료</option>
              <option value="차등">금액별 차등적용</option>
            </select>
          </label>
        </article>
        {formData.shop_delivery_type === '차등' && (
          <article className='shop_delivery_cost'>
            <label className='form_label'>
              <span className='label_name'>배송비 설정</span>
              <div className='cost_price'>
                <div className='title'>구매금액</div>
                {costArray.map((item, idx) => {

                  return (
                    <label key={idx} className='price_table'>
                      <input type="text" value={item.price} onChange={(e) => {
                        const tempArray = [...costArray]
                        tempArray[idx].price = Number(e.target.value)
                        setCostArray(tempArray)
                        setFormData({
                          ...formData,
                          'shop_delivery_cost' : JSON.stringify(costArray)
                        })
                      }}/>
                      <span>원 까지</span>
                    </label>
                  )
                })}
              </div>
              <div className='cost_cost'>
                <div className='title'>구매금액</div>
                {costArray.map((item, idx) => {

                  return (
                    <label key={idx} className='price_table'>
                      <input type="text" value={item.sc_cost} onChange={(e) => {
                        const tempArray = [...costArray]
                        tempArray[idx].sc_cost = Number(e.target.value)
                        setCostArray(tempArray)
                        setFormData({
                          ...formData,
                          'shop_delivery_cost' : JSON.stringify(costArray)
                        })
                      }}/>
                      <span>원</span>
                    </label>
                  )
                })}
              </div>
              <div className='add_cost'>
                <button type={'button'} onClick={() => {
                  setCostArray(prevItems => [...prevItems, {'price': '', 'sc_cost': ''}])
                }}>
                  <AiOutlinePlus/>범위 추가
                </button>
                <button type={'button'} onClick={() => {
                  setCostArray(prevItems => {
                    const tempArry = prevItems.slice(0, prevItems.length - 1)
                    setFormData({
                      ...formData,
                      'shop_delivery_cost' : JSON.stringify(tempArry)
                    })
                    return tempArry
                  })


                }}>
                  <AiOutlinePlus/>범위 삭제
                </button>
              </div>
            </label>
          </article>
        )}
        <article className='shop_delivery_info'>
          <label className='form_label'>
            <span className='label_name'>배송정보 설정</span>
            <textarea value={formData.shop_delivery_info} onChange={(e) => {
              setFormData({
                ...formData,
                'shop_delivery_info': e.target.value
              })
            }}/>
          </label>
        </article>
        <article className='shop_refund_info'>
          <label className='form_label'>
            <span className='label_name'>교환/반품 설정</span>
            <textarea value={formData.shop_refund_info} onChange={e=> {
              setFormData({
                ...formData,
                'shop_refund_info': e.target.value
              })
            }}/>
          </label>
        </article>
        <button className="btn delivery-btn">저장하기</button>
      </form>
    </section>
  )
}
