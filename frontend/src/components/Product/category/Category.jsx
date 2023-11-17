import React, {useEffect, useState} from 'react';
import api, {baseURL} from "../../../api/axios.js";
import {MdDelete, MdModeEditOutline} from "react-icons/md";
import DefaultModal from "../../../features/DefaultModal.jsx";
import Alert from "../../../features/Alert.jsx";

export default function Category() {
  const [CategoryList, setCategoryList] = useState([])
  const [modalCat, setModalCat] = useState([]);
  const [formData, setFormData] = useState({
    cat_id: 0,
    cat_parent_id: 0,
    cat_depth: 1,
  })
  const [modalView, setmodalView] = useState({
    active: false,
    idx: 0,
    item: null,
  })
  const [alert, setAlert] = useState({
    active: false,
    idx : 0,
  })

  async function getCategory() {
    try {
      const response = await api.get('category/list/depth')
      console.log(response);
      setCategoryList(response.data)
    } catch (e) {
      console.log('error')
      console.log(e)
    }
  }

  async function Submit(e) {
    e.preventDefault();
    const name = e.target.name
    let url = null;
    url = name === 'adding' ? 'category/add' : 'category/edit'
    if (!url) {
      return;
    }
    try {
      let response = null;
      if (name === 'adding') {
        response = await api.post(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      } else if (name === 'editing') {
        response = await api.put(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }
      if (response.status === 200) {
        getCategory();
        setmodalView({
          ...modalView,
          active: false,
          idx: 0,
          item: null,
        })
      }
    } catch (e) {
      console.log('상품 분류 제출 오류 발생', e)
    }
  }

  useEffect(() => {
    getCategory()
  }, []);
  return (
    <>
      <div className='category-list'>
        <h1 className='title'>상품 분류 관리</h1>
        <button className='add-btn' onClick={() => {
          modalview()
        }}>상품 분류 추가
        </button>
        <ul className='mainCategory-menu'>
          <li className='maincategory-head'>
            <span>ID</span>
            <span>아이콘</span>
            <span>이름</span>
            <span>관리</span>
          </li>
          {CategoryList && CategoryList.map((mainCategory, index) => (
            <React.Fragment key={index}>
              <li key={mainCategory.cat_id}>
                <span>{mainCategory.cat_id}</span>
                <span>
                  <img className='icon-img' src={baseURL + (mainCategory.icon_filepath).slice(1)} alt={mainCategory.cat_title}/>
                </span>
                <span>{mainCategory.cat_depth_title}</span>
                <span>
                  <button className="edit-btn btn" onClick={() => {
                    modalview(mainCategory)
                  }}><MdModeEditOutline/></button>
                    <button className='edit-btn btn' onClick={() => {
                      setAlert({
                        ...alert,
                        active: true,
                        idx : mainCategory.cat_id
                      })
                    }}>
                        <MdDelete/>
                    </button>
                </span>
              </li>
              {mainCategory.secondDepthList.length > 0 && mainCategory.secondDepthList.map((second, idx) => (
                <React.Fragment key={idx}>
                  <li key={second.cat_id}>
                    <span>{second.cat_id}</span>
                    <span>
                      <img className='icon-img' src={baseURL + (second.icon_filepath).slice(1)} alt={second.cat_title}/>
                    </span>
                    <span>{second.cat_depth_title}</span>
                    <span>
                      <button className="edit-btn btn" onClick={() => {
                        modalview(second)
                      }}><MdModeEditOutline/>
                      </button>
                      <button className='edit-btn btn' onClick={() => {
                        setAlert({
                          ...alert,
                          active: true,
                          idx: second.cat_id
                        })
                      }}>
                        <MdDelete/>
                      </button>
                    </span>
                  </li>
                  {second.thirdDepthList.length > 0 && second.thirdDepthList.map((third, idx) => (
                    <li key={third.cat_id}>
                      <span>{third.cat_id}</span>
                      <span>
                      <img className='icon-img' src={baseURL + (third.icon_filepath).slice(1)} alt={third.cat_title}/>
                    </span>
                      <span>{third.cat_depth_title}</span>
                      <span>
                      <button className="edit-btn btn" onClick={() => {
                        modalview(third)
                      }}>
                        <MdModeEditOutline/>
                      </button>
                      <button className='edit-btn btn' onClick={() => {
                        setAlert({
                          ...alert,
                          active: true,
                          idx: third.cat_id
                        })
                      }}>
                        <MdDelete/>
                      </button>
                    </span>
                    </li>
                  ))}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </ul>
      </div>
      {modalView.active && <DefaultModal setView={setmodalView} width={'500px'} height={'500px'}>
        <h3 className='modal-title'>
          {modalView.idx === 0 ? '등록하기' : '수정하기'}
        </h3>
        <form className='modal-form' name={modalView.idx === 0 ? 'adding' : 'editing'} onSubmit={Submit}>
          <label>
            <span className='label-name'>카테고리 단계 설정</span>
            <select name="cat_depth" onChange={(e) => {
              onChange(e)
              cateDepthChange(e.target.value)
            }} defaultValue={modalView.item.cat_depth}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </label>
          <label>
            <span className='label-name'>상위 카테고리 선택</span>
            <select name='cat_parent_id' onChange={onChange} defaultValue={modalView.idx}>
              {modalView.idx === 0 && <option value='0'>새로 생성</option>}
              {modalCat.map(category => (
                <React.Fragment key={category.cat_id}>
                  <option value={category.cat_id}>{category.cat_title}</option>
                </React.Fragment>
              ))}
            </select>
          </label>
          <label>
            <span className='label-name'>카테고리 아이콘</span>
            {modalView.item.icon_filepath && (
              <img className='modal-img' src={baseURL + modalView.item.icon_filepath.slice(1)}/>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={onChange}
              name={'icon_filepath'}
            />
          </label>
          <label>
            <span className='label-name'>카테고리 이름</span>
            <input type="text" name='cat_title' onChange={onChange} defaultValue={modalView.item.cat_title}/>
          </label>
          <button className='default-btn' type='submit'>적용하기</button>
        </form>
      </DefaultModal>}
      {alert.active && <Alert setView={setAlert} delapi={delitem}>
        삭제 하시겠습니까?
      </Alert> }

    </>
  );

  function modalview(item) {
    setmodalView({
      ...modalView,
      active: true,
      idx: item ? item.cat_id : 0,
      item: item ? item : {cat_title: ''},
    })
    if (item) {
      setFormData({
        ...formData,
        cat_id: item.cat_id,
        cat_depth: item.cat_depth,
        cat_parent_id: item.cat_parent_id,
      })
      cateDepthChange(String(item.cat_depth))
    } else {
      // 상태를 업데이트합니다.
      setFormData({
        cat_parent_id: 0,
        cat_depth: 1,
      });
      setModalCat([])
    }
  }

  function onChange(e) {
    const target = e.target;
    if (target.name === 'icon_filepath') {
      setFormData({
        ...formData,
        icon_filepath: e.target.files[0]
      })
    } else if (target.name === 'cat_parent_id' || target.name === 'cat_depth') {
      setFormData(prevFormData => ({
        ...prevFormData,
        [e.target.name]: Number(e.target.value)
      }));
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      })
    }
  }

  function cateDepthChange(value) {
    // const value = e.target.value;
    setModalCat([])
    if (value === '1') {
      setModalCat([])
    } else if (value === '2') {
      setModalCat(CategoryList)
    } else if (value === '3') {
      CategoryList.map((item) => {
        if (item.secondDepthList.length > 0) {
          item.secondDepthList.map((secondItem) => {
            setModalCat(prevState => [...prevState, secondItem])
          })
        }
      })
    }
    console.log(value);
  }

  async function delitem() {
    const formData = new FormData();
    // console.log(alert.idx);
    formData.append('cat_id', String(alert.idx))


    await api.delete('category/del', {
      data: {
        cat_id : alert.idx
      }
    }).then(res=>{
      console.log(res)
      setAlert({
        active: false,
        idx: 0,
      })
      getCategory()
    }).catch(err=>console.error(err))
  }
}


