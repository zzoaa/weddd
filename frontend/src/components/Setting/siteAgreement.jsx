import React, {useEffect, useState} from 'react';
import api from '../../api/axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function SiteAgreement() {
  const [privacyValue, setPrivacyValue] = useState('');
  const [siteValue, setSiteValue] = useState('');


  async function getSetting() {
    api.get('super/setting/basic').then(res => {

      setPrivacyValue(res.data.agreement_privacy);
      setSiteValue((res.data.agreement_site))
    }).catch(error => console.error('통신중 에러 ', error))
  }

  function submit(e) {
    e.preventDefault();
    console.log(e.target.name);
    if(e.target.name == 'site') {

      api.post('super/setting/basic', {
        'agreement_site' : siteValue
      }).then(res => {
        console.log(res);
      })
    }else if(e.target.name === 'privacy') {


      api.post('super/setting/basic', {
        'agreement_privacy' : privacyValue
      }).then(res => {
        console.log(res);
      })
    }

  }

  useEffect(() => {
    getSetting()
  }, []);

  return (
    <section className='agreement-section'>
      <form className='agreement-form' name='site' onSubmit={submit}>
        <div className={'title-box'}>
          <h2 className='title'>사이트 이용약관</h2>
          <button className='site-btn btn'>저장하기</button>
        </div>
        <ReactQuill theme="snow" value={siteValue} onChange={setSiteValue}/>
      </form>
      <form className='agreement-form' name='privacy' onSubmit={submit}>
        <div className="title-box">
          <h2 className="title">개인정보 처리방침</h2>
          <button className="privacy-btn btn">저장하기</button>
        </div>
        <ReactQuill theme="snow" value={privacyValue} onChange={setPrivacyValue}/>
      </form>
    </section>
  )
}