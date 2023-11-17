import React, {useEffect, useState} from 'react'
import api from '../../api/axios.js'

export default function SiteSetting() {
  const [data, setData] = useState(null);
  const [formData, setFormData] = useState({})

  async function getSetting() {
    await api.get('super/setting/basic').then(res => {
        console.log(res.data)
        setData(res.data);
      }
    ).catch(e => {
      alert('설정을 가져오는데 에러가 발생했습니다.')
      console.log(e);
    })
  }

  function changEvent(e) {
    console.log(e.target.name);
    setFormData({
      ...formData,
      [e.target.name] : e.target.value
    })
  }

  async function Submit(e) {
    e.preventDefault();

    await api.post('super/setting/basic', formData).then(res => {
      console.log(res)
      alert('설정이 변경 되었습니다.')
    }).catch(e => console.error(e))
  }

  useEffect(() => {
    getSetting()
  }, []);

  if (!data) {
    return (
      <div>Loading.....</div>
    )
  }

  return (
    <section className='setting_section'>
      <h1 className='setting_title'>사이트 설정</h1>
      <form className='shop_setting_form' onSubmit={Submit}>
        <table className='shop_setting_table'>
          <thead>
          <tr>
            <th className='text-center' colSpan={2}>포트원 환경 설정</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <th>가맹점 식별코드</th>
            <td>
              <input className='w100' type="text" name='shop_portone_imp_code' defaultValue={data.shop_portone_imp_code} onChange={changEvent}/>
            </td>
          </tr>
          <tr>
            <th>REST API</th>
            <td>
              <input className='w100' type="text" name='shop_portone_api_key' defaultValue={data.shop_portone_api_key} onChange={changEvent}/>
            </td>
          </tr>
          <tr>
            <th>REST API Secret</th>
            <td>
              <input className='w100' type="text" name='shop_portone_api_secret' defaultValue={data.shop_portone_api_secret} onChange={changEvent}/>
            </td>
          </tr>
          </tbody>
        </table>
        <button className='default-btn'>저장하기</button>
      </form>
      <article className='company_article'>
        <form id='company_form' className='company_form' onSubmit={Submit}>
          <h2 className='company_title'>회사 정보 설정</h2>
          <label className='form-label'>
            <span className='form-name'>사업자명</span>
            <input className='form-input' name={'company_name'} defaultValue={data.company_name} onChange={changEvent}/>
          </label>
          <label className='form-label'>
            <span className='form-name'>대표자명</span>
            <input className='form-input' name={'company_ceo'} defaultValue={data.company_ceo} onChange={changEvent}/>
          </label>
          <label className='form-label'>
            <span className='form-name'>사업장등록번호</span>
            <input className='form-input' name={'company_biznum'} defaultValue={data.company_biznum} onChange={changEvent}/>
          </label>
          <label className='form-label'>
            <span className='form-name'>통신판매업 신고번호</span>
            <input className='form-input' name={'company_shopnum'} defaultValue={data.company_shopnum} onChange={changEvent}/>
          </label>
          <label className='form-label'>
            <span className='form-name'>회사 전화번호</span>
            <input className='form-input' name={'company_tel'} defaultValue={data.company_tel} onChange={changEvent}/>
          </label>
          <label className='form-label'>
            <span className='form-name'>회사 FAX</span>
            <input className='form-input' name={'company_fax'} defaultValue={data.company_fax} onChange={changEvent}/>
          </label>
          <label className='form-label'>
            <span className='form-name'>회사 주소</span>
            <input className='form-input' name={'company_address'} defaultValue={data.company_address} onChange={changEvent}/>
          </label>
          <div className='form-group'>
            <label className='form-label privacy'>
              <span className='form-name'>개인정보 관리책임자</span>
              <input className='form-input' name={'company_privacy_name'} defaultValue={data.company_privacy_name} onChange={changEvent}/>
            </label>
            <label className='form-label privacy br1'>
              <span className='form-name'>email</span>
              <input className='form-input' name={'company_privacy_email'} defaultValue={data.company_privacy_email} onChange={changEvent}/>
            </label>
          </div>
          <button className={'btn default-btn'} type='submit'>저장하기</button>
        </form>
      </article>
    </section>
  )
}
