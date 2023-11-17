import React, {useEffect, useState} from 'react';
import api from '../../api/axios.js'
import {NavLink} from "react-router-dom";
import {Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";

export default function OderLIst() {
  const [data, setData] = useState(null)
  const [checkedArray, setCheckedArray] = useState([])
  /**
   * {
   *         "od_id": 2023091211401781,
   *         "od_status": "배송준비",
   *         "od_delivery_company": "대한통운",
   *         "od_delivery_num": "1234"
   *  },
   */

  //주문 목록 불러오기
  async function getOrderList() {
    await api.get('/super/orders').then(res => {
      console.log(res);
      setData(res.data)
    }).catch(err => console.error(err))
  }

  // 배송정보 입력 값 변경 핸들러
  const handleInputChange = (index, event) => {
    const newOrders = [...data];
    newOrders[index][event.target.name] = event.target.value;
    setData(newOrders);
  };

  async function editDelivery() {
    const formData = [];
    for(let i = 0; i < checkedArray.length; i++) {
      const tmpObj = {
        "od_id": data[checkedArray[i]].od_id,
        "od_status": data[checkedArray[i]].od_status,
        "od_delivery_company": data[checkedArray[i]].od_delivery_company,
        "od_delivery_num": data[checkedArray[i]].od_delivery_num
      }
      formData.push(tmpObj)
    }
    // console.log(formData)
    try {
      const {status} = await api.put('super/orders/status', formData)
      if(status === 200) {
        alert('변경 성공')
        getOrderList();
      }
    } catch (e) {
      alert('배송정보 변경 실패')
      console.error(e)
    }
  }



  useEffect(() => {
    getOrderList()
  }, [])
  if (!data) {
    return (
      <div>Loading....</div>
    )
  }
  return (
    <section className='order-list-section'>
      <h1 className='title'>주문관리</h1>
      <div className="btn-wrap">
        <button type='button' className='btn' onClick={editDelivery}>배송정보 저장</button>
      </div>
      <Table className={'order-list-table'}>
        <TableHead>
          <TableRow>
            <TableCell size={'small'} align={'center'} className={'list-th'} colSpan={3}>주문정보</TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'} colSpan={2}>주문자 정보</TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'} colSpan={6}>결제 정보</TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'} colSpan={3}>배송 정보</TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'} colSpan={4}>안내 발송</TableCell>
          </TableRow>
          <TableRow>
            <TableCell size={'small'} align={'center'} className={'list-th'}>
            </TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>
              <div>주문번호</div>
              <div>주문일시</div>
            </TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>
              주문상품
            </TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>주문자</TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>연락처</TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>결제수단</TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>
              <div>상품금액</div>
              <div>배송비</div>
            </TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>주문금액</TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>
              <div>취소금액</div>
              <div>환불금액</div>
            </TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>결제금액</TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>미수금액</TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>주문상태</TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>배송회사</TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>운송장번호</TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>주문완료</TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>입금안내</TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>입금확인</TableCell>
            <TableCell size={'small'} align={'center'} className={'list-th'}>발송완료</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {
            data.map((item, idx) => (
                <TableRow key={item.od_idx}>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    <input type="checkbox" value={item.od_idx} className='checkbox' onChange={(e) => {
                      if (e.target.checked) {
                        const newArray = [...checkedArray, idx];
                        setCheckedArray(newArray);
                      } else {
                        const filterArray = checkedArray.filter((filI) => {
                          return filI !== idx
                        })
                        setCheckedArray(filterArray)
                      }
                    }}/>
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    <NavLink to={String(item.od_id)} style={{fontWeight: "bold"}}>{item.od_id}</NavLink>
                    <div>{
                      dateChange(item.od_time)
                    }</div>
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    {item.od_title}
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    {item.od_name}
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    {item.od_hp}
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    {item.od_settle_case}
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    <div>{item.od_cart_price}</div>
                    <div>{item.od_send_cost}</div>
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    {item.od_receipt_price}
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    <div>{item.od_cancel_price}</div>
                    <div>{item.od_refund_price}</div>
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    {item.od_receipt_price - item.od_cancel_price - item.od_receipt_price - item.od_misu}
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    {item.od_misu}
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'} >
                    <select className='order-state' name={'od_status'} defaultValue={item.od_status} onChange={(e) => {
                      handleInputChange(idx, e)
                    }}>
                      <option value=''>선택해주세요</option>
                      <option value='구매대기'>구매대기</option>
                      <option value='입금대기'>입금대기</option>
                      <option value='입금완료'>입금완료</option>
                      <option value='상품준비중'>상품준비중</option>
                      <option value="주문취소">주문취소</option>
                      <option value="환불">환불</option>
                      <option value="반품">반품</option>
                      <option value="교환">교환</option>
                      <option value="배송중">배송중</option>
                      <option value="배송완료">배송완료</option>
                      <option value="장바구니삭제">장바구니삭제</option>
                    </select>
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    <select className='order-delivery-com' name={'od_delivery_company'} defaultValue={item.od_delivery_company} onChange={(e) => {
                      handleInputChange(idx, e)
                    }}>
                      <option value="우체국">우체국</option>
                      <option value="CJ대한통운">CJ대한통운</option>
                      <option value="롯데택배">롯데택배</option>
                      <option value="한진택배">한진택배</option>
                      <option value="경동택배">경동택배</option>
                      <option value=''>선택해주세요</option>
                    </select>
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    <input type="text" defaultValue={item.od_delivery_num} name={'od_delivery_num'} onChange={(e) => {
                      handleInputChange(idx, e)
                    }}/>
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    <span className={item.od_oc_send == 'Y' ? 'on' : null}></span>
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    <span className={item.od_ip_send == 'Y' ? 'on' : null}></span>
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    <span className={item.od_ic_send == 'Y' ? 'on' : null}></span>
                  </TableCell>
                  <TableCell size={'small'} align={'center'} className={'list-td'}>
                    <span className={item.od_sc_send == 'Y' ? 'on' : null}></span>
                  </TableCell>
                </TableRow>
              )
            )
          }
        </TableBody>
      </Table>
    </section>
  );
}

function dateChange(str) {
  const dateObj = new Date(str);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 1을 더해줍니다.
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getUTCHours()).padStart(2, '0');
  const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
  // console.log(formattedDate); // "2023-09-25 07:29"를 출력합니다.
  return formattedDate;
}
