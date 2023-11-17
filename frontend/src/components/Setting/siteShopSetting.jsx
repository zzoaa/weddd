import React, {useEffect, useState} from 'react';
import api from '../../api/axios.js'

export default function SiteShopSetting() {
  const [data, setData] = useState();

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

  useEffect(() => {
    getSetting()
  }, [])
  if (!data) {
    return (
      <div>Loading....</div>
    )
  }
  return (
    <div>추후 개발</div>
  );
}


