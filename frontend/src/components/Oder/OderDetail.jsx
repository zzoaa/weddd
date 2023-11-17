import React, {useEffect, useState} from 'react';
import {useParams} from "react-router-dom";
import api from '../../api/axios.js'
import {Loading} from "../loading.jsx";
import "https://cdn.iamport.kr/v1/iamport.js"
import {Table, TableBody, TableCell, TableHead, TableRow, TextField} from "@mui/material";

export default function OderDetail() {
  const [data, setData] = useState(null);
  const [formData, setFormData] = useState({
    "od_id": 0,
    'mem_idx': 0,
    "od_status": '',
    "od_cart_price": 0,
    "od_send_cost": 0,
    "od_receipt_price": 0,
    "od_cancel_price": 0,
    "od_refund_price": 0,
    "od_misu": 0,
    "od_shop_memo": '',
    "od_delivery_company": '',
    "od_delivery_num": 0
  });
  // useParams 훅을 사용하여 orderid 값을 가져옵니다.
  const {orderid} = useParams();

  /**
   * 주문 상세내역 불러오기
   * @returns {Promise<void>}
   */
  async function getData() {
    await api.get(`super/orders/${orderid}`).then(res => {
      console.log(res.data);
      setData(res.data)
      setFormData({
        ...formData,
        'mem_idx': res.data.mem_idx,
        "od_id": res.data.od_id,
        "od_status": res.data.od_status,
        "od_cart_price": res.data.od_cart_price, //주문상품 금액
        "od_send_cost": res.data.od_send_cost, //배송비
        "od_receipt_price": res.data.od_receipt_price, // 총 주문 금액
        "od_cancel_price": res.data.od_cancel_price, //취소금액
        "od_refund_price": res.data.od_refund_price, //환불 금액
        "od_misu": res.data.od_misu,//미수금액
        "od_shop_memo": res.data.od_shop_memo, //관리자 메모
        "od_delivery_company": res.data.od_delivery_company, // 배송사
        "od_delivery_num": res.data.od_delivery_num //배송번호
      })
    })
  }

  async function editData() {
    try {
      const {status} = await api.put('super/orders', formData)
      if(status === 200) {
        alert('수정 성공')
        getData();
      }


    }catch (e) {
      alert('수정 실패')
      console.error(e)
    }
  }

  function onChange(e) {
    if(e.target.name === 'od_refund_price') {
      setFormData({
        ...formData,
        [e.target.name] : Number(e.target.value)
      })
    }else {
      setFormData({
        ...formData,
        [e.target.name] : e.target.value
      })
    }

  }

  useEffect(() => {
    getData()
  }, [])
  if (!data) {
    return (
      <Loading/>
    )
  }
  return (
    <div className='oderdetail-section'>
      <Table className={'order-list-table'}>
        <TableHead>
          <TableRow>
            <TableCell align={'center'} className={'list-th'}>주문번호</TableCell>
            <TableCell align={'center'} className={'list-th'}>상품명</TableCell>
            <TableCell align={'center'} className={'list-th'}>수량</TableCell>
            <TableCell align={'center'} className={'list-th'}>금액</TableCell>
            <TableCell align={'center'} className={'list-th'}>상태</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.cartData.length > 0 && data.cartData.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell align={'center'} className={'list-td'}>{row.od_id}</TableCell>
              <TableCell align={'center'} className={'list-td'}>{row.prd_name}</TableCell>
              <TableCell align={'center'} className={'list-td'}>{row.cart_qty}</TableCell>
              <TableCell align={'center'} className={'list-td'}>{row.cart_price}</TableCell>
              <TableCell align={'center'} className={'list-td'}>{row.cart_status}</TableCell>
            </TableRow>
          ))}

        </TableBody>
      </Table>
      <div className='datail-info half'>
        <h3>상품 주문정보</h3>
        <form>
          <table className='info-table'>
            <tbody>
            <tr>
              <th>주문번호</th>
              <td colSpan={3}>{data.od_id}</td>
            </tr>
            <tr>
              <th>주문상태</th>
              <td colSpan={3} className='text-left'>
                <select name="od_status" defaultValue={data.od_status} className='w100' onChange={onChange}>
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
              </td>
            </tr>
            <tr>
              <th>주문상품</th>
              <td colSpan={3}>{data.od_title}</td>
            </tr>
            <tr>
              <th>주문자</th>
              <td colSpan={3}>{data.od_name}</td>
            </tr>
            <tr>
              <th>휴대폰</th>
              <td>{data.od_hp}</td>
              <th>전화번호</th>
              <td>{data.od_tel}</td>
            </tr>
            <tr>
              <th>우편번호</th>
              <td colSpan={3}>{data.od_zonecode}</td>
            </tr>
            <tr>
              <th>주소</th>
              <td colSpan={3}>{data.od_addr1}</td>
            </tr>
            <tr>
              <th>상세주소</th>
              <td colSpan={3}>{data.od_addr2}</td>
            </tr>
            <tr>
              <th>요청사항</th>
              <td colSpan={3}>{data.od_memo}</td>
            </tr>
            <tr>
              <th>관리자 메모</th>
              <td colSpan={3}>
                <textarea className='w100' name="od_shop_memo" defaultValue={data.od_shop_memo} placeholder={'관리자 필요 사항을 메모해주세요.'} onChange={onChange}></textarea>
              </td>
            </tr>
            </tbody>
          </table>
          <table className='price-table'>
            <thead>
            <tr>
              <th colSpan={6}>결제금액 정보</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <th>총 상품금액</th>
              <td>{formData.od_receipt_price}</td>
              <th>배송비</th>
              <td>{formData.od_send_cost}</td>
              <th>주문금액</th>
              <td>{formData.od_cart_price}</td>
            </tr>
            <tr>
              <th>환불금액</th>
              <td colSpan={5}>
                <TextField type={'number'} fullWidth variant={'standard'} defaultValue={data.od_refund_price} name={'od_refund_price'} onChange={onChange}></TextField>
              </td>
              {/*<th>취소금액</th>*/}
              {/*<td colSpan={2}>{data.od_cancel_price}</td>*/}
            </tr>
            <tr>
              <th>미수금</th>
              <td colSpan={2}>{formData.od_misu}</td>
              <th>결제금액</th>
              <td colSpan={2}>{formData.od_receipt_price - formData.od_misu - formData.od_refund_price}</td>
            </tr>
            </tbody>
          </table>
          <table className="delivery-table">
            <thead>
            <tr>
              <th colSpan={4}>배송정보</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <th>택배사</th>
              <td className='text-left'>
                <select className='order-delivery-com' defaultValue={data.od_delivery_company} name={'od_delivery_company'} onChange={onChange}>
                  <option value="우체국">우체국</option>
                  <option value="CJ대한통운">CJ대한통운</option>
                  <option value="롯데택배">롯데택배</option>
                  <option value="한진택배">한진택배</option>
                  <option value="경동택배">경동택배</option>
                  <option value=''>선택해주세요</option>
                </select>
              </td>
              <th>송장번호</th>
              <td className='text-left'>
                <input type="text" defaultValue={data.od_delivery_num} name={'od_delivery_num'} placeholder={'운송장번호'} onChange={onChange}/>
              </td>
            </tr>
            </tbody>
          </table>
          <button type='button' className='default-btn' onClick={editData}>주문정보 저장</button>
        </form>
      </div>
      <div className='pg-ingo half'>
        <h3>PG사 결제 정보</h3>
        <table className="pg-table">
          <tbody>
          <tr>
            <th>결제 수단</th>
            <th>{payMethodCheck(data.od_settle_case)}</th>
          </tr>
          <tr>
            <th>결제금액</th>
            <td className='text-left'>
              <span className='dp-ib w50 mr10 p5'>{data.od_receipt_price}</span>
              <button type='button' >영수증 조회</button>
            </td>
          </tr>
          <tr>
            <th>결제취소 금액</th>
            <td className='text-left'>
              <input className='w50 p5 mr10' type="text" name='od_refund_price' defaultValue={data.od_refund_price}/>
              <button disabled type='button'>PG사 결제취소 요청</button>
            </td>
          </tr>
          <tr>
            <th>결제취소 사유</th>
            <td className='text-left'>
              <input className='w50 p5' type="text" name='od_refund_memo' placeholder='취소 사유를 입력해주세요.'/>
            </td>
          </tr>
          </tbody>
        </table>
        <span className='sub-text'>실제 결제금액의 취소 처리는 이곳에서 처리하셔야 합니다.</span>
      </div>
    </div>
  );

  /**
   * card (신용카드)
   * trans(실시간계좌이체)
   * vbank(가상계좌)
   * phone(휴대폰소액결제)
   * paypal (페이팔 SPB 일반결제)
   * applepay (애플페이)
   * naverpay(네이버페이)
   * samsungpay(삼성페이)
   * kpay(KPay앱 )
   * kakaopay(카카오페이)
   * payco(페이코)
   * lpay(LPAY)
   * ssgpay(SSG페이)
   * tosspay(토스간편결제)
   * cultureland(컬쳐랜드)
   * smartculture(스마트문상)
   * culturegift(문화상품권)
   * happymoney(해피머니)
   * booknlife(도서문화상품권)
   * point(베네피아 포인트 등 포인트 결제 )
   * wechat(위쳇페이)
   * alipay(알리페이)
   * unionpay(유니온페이)
   * tenpay(텐페이)
   * pinpay(핀페이)
   * ssgpay_bank(SSG 은행계좌)
   * skpay(SKPAY)
   * naverpay_card(네이버페이 - 카드)
   * naverpay_point(네이버페이 - 포인트)
   * paypal(페이팔)
   * toss_brandpay(토스페이먼츠 브랜드페이)
   */
  function payMethodCheck(payMethod){
    let result;
    switch (payMethod) {
      case 'card' :
        result = '카드'
        break;
      case 'trans' :
        result = '실시간 계좌이체'
        break;
      case 'vbank' :
        result = '가상계좌'
        break;
      case 'phone' :
        result = '휴대폰 소액 결제'
        break;
      case 'naverpay' :
        result = '네이버페이'
        break;
      case 'kakaopay' :
        result = '카카오페이'
        break;
      default :
        result = payMethod
        break;
    }

    return result;
  }
}


