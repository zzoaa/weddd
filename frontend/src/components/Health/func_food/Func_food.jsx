import React, {useEffect, useState} from 'react';
import DefaultTable from "../../../features/DefaultTable.jsx";
import api, {baseURL} from "../../../api/axios.js";
import {BiEdit, BiTrash} from "react-icons/bi";
import {NavLink} from "react-router-dom";
import Alert from "../../../features/Alert.jsx";

export default function FuncFood() {
  const [data, setData] = useState(null)
  const [delAlert, setDelAlert] = useState({
    active: false,
    idx : 0,
  })
  useEffect(() => {
    getData();
  }, [delAlert]);

  async function getData() {
    try {
      const {data} = await api.get('/healthinfo/funcfood/list/all')
      setData(data);
    }catch (e) {
      console.log(e)
      alert('불러오기 실패!')
    }

  }

  async function delData() {
    const del_id = delAlert.idx
    const delArray = {
      "funcFoodIds": []
    }
    delArray.funcFoodIds.push(del_id);
    try {
      await api.post('healthinfo/funcfood/delete', delArray)
      setDelAlert({
        ...delAlert,
        active: false,
        idx: 0,
      })
    }catch (e) {
      console.log(e)
      alert('삭제중 에러')
    }
  }

  if (!data) return <div>Loading....</div>
  return (
    <section className='func_food_section'>
      <div className="btn-wrap">
        <NavLink to={'add'}>등록하기</NavLink>
      </div>

      <DefaultTable title={'건강기능 식품 관리'} tableClass={'func_food_table'} >
        <thead>
        <tr>
          <th>ID</th>
          <th>이름</th>
          <th>등록된 이미지</th>
          <th>관리</th>

        </tr>
        </thead>
        <tbody>
        {data.map(row => (
          <tr key={row.food_idx}>
            <td>{row.food_idx}</td>
            <td>{row.food_name}</td>
            <td>{row.thumb_filepath.length < 1 ? '등록된 이미지가 없습니다.' : (
              <div className='img-wrap'><img src={baseURL + row.thumb_filepath.slice(1)} alt={row.food_name}/></div>)}
            </td>
            <td>
              <div className='btn-wrap'>
                <NavLink to={`${row.food_idx}`}>
                  <BiEdit/>
                </NavLink>
                <BiTrash onClick={() => {
                  setDelAlert({
                    idx : row.food_idx,
                    active: true
                  })
                }}/>
              </div>
            </td>

          </tr>
        ))}
        </tbody>
      </DefaultTable>
      {delAlert.active && <Alert setView={setDelAlert} delapi={delData}>
        삭제하시겠습니까?
      </Alert>}
    </section>
  );
}


