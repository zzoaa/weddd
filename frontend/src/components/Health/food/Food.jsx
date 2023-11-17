import React, {useEffect, useState} from 'react';
import api, {baseURL} from "../../../api/axios.js";
import DefaultTable from "../../../features/DefaultTable.jsx";
import {NavLink, useNavigate} from "react-router-dom";
import {BiEdit, BiTrash} from "react-icons/bi";
import Alert from "../../../features/Alert.jsx";

export default function Food() {
  const [data, setData] = useState(null)
  const [delAlert, setDelAlert] = useState({
    active: false,
    idx : 0,
  });
  const [addAlert, setAddAlert] = useState({
    active: false,
    idx: 0,
  })
  const userData = JSON.parse(sessionStorage.getItem('ud'))
  const navigate = useNavigate();
  useEffect(() => {
    getData();
  }, [delAlert]);

  async function getData() {
    try {
      const {data} = await api.get('healthinfo/food/list/all')
      setData(data);
    }catch (e) {
      console.log(e)
      alert('불러오기 실패!')
    }

  }
  async function delData() {
    const del_id = delAlert.idx
    const delArray = {
      "foodIds": []
    }
    delArray.foodIds.push(del_id);
    try {
      await api.post('healthinfo/food/delete', delArray)
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

  async function addProcess() {

    try {
      const addData = {
        reg_user : userData.id
      }
      const {data, status} = await api.post('healthinfo/food', addData)

      if(status === 200) {
        navigate(`${data.newId}`)
      }else {
        alert('알수 없는 오류 발생\n 관리자에게 문의주세요.')
      }

    }catch (e) {
      alert('등록중 에러 발생')
      console.log(e)
    }

  }
  if (!data) return <div>Loading...</div>
  return (
    <section className='food_section'>
      <div className="btn-wrap">
        <button type={"button"} onClick={() => {
          setAddAlert({
            ...addAlert,
            active: true,
          })
        }}>등록하기</button>
      </div>
      <DefaultTable title={'건강 식품 관리'} tableClass={'food_table'}>
        <thead>
        <tr>
          <th>ID</th>
          <th>등록된 아이콘</th>
          <th>이름</th>
          <th>등록된 이미지</th>
          <th>해시태그</th>
          <th>관리</th>
        </tr>
        </thead>
        <tbody>
        {data && data.map(row => (
          <tr key={row.food_idx}>
            <td>{row.food_idx}</td>
            <td>
              {!row.icon_filepath ? '등록된 이미지가 없습니다.' : (
                  <div className='img-wrap'><img src={baseURL + row.icon_filepath.slice(1)} alt={row.food_name}/></div>)}
            </td>
            <td>{row.food_name}</td>
            <td>
              {!row.thumb_filepath ? '등록된 이미지가 없습니다.' : (
              <div className='img-wrap'><img src={baseURL + row.thumb_filepath.slice(1)} alt={row.food_name}/></div>)}
            </td>
            <td>
              <div>
                {row.food_summary.map((item, idx) => (
                    <span key={idx}>{item}</span>
                ))}
              </div>
            </td>
            <td>
              <div className='btn-wrap'>
                <NavLink to={`${row.food_idx}`}>
                  <BiEdit/>
                </NavLink>
                <BiTrash onClick={() => {
                  setDelAlert({
                    idx: row.food_idx,
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
      {addAlert.active && <Alert setView={setAddAlert} delapi={addProcess}>
        등록하시겠습니까?
      </Alert>}
    </section>
  );
}


