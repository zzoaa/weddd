import React, {useEffect, useState} from 'react'
import api, {baseURL} from '../../../api/axios'
import {VscEdit, VscTrash} from "react-icons/vsc";
import Alert from "../../../features/Alert.jsx";
import DefaultModal from "../../../features/DefaultModal.jsx";

export default function DisplayList() {
  const [data, setData] = useState(null);
  const [displayItem, setDisplayItem] = useState(null);
  const [itemAlert, setitemAlert] = useState({
    idx: 0,
    active: false
  });
  const [dspAlert, setDspAlert] = useState({
    idx: 0,
    active: false
  });
  const [modalView, setModalView] = useState({
    active: false,
    idx: -1,
  });
  const [dspItemModal, setDspItemModal] = useState({
    'active': false,
    'idx': -1,
  })
  const [dspAddItemList, setDspAddItemList] = useState([])
  const [selectAddItem, setSelectAddItem] = useState({
    'idx': -1,
  })
  const [delDisplayItem, setDelDisplayItem] = useState(
    {
      'dsp_idx': 0,
      'prd_idx': 0,
    }
  );
  /*formData*/
  const [formData, setFormData] = useState({
    "dsp_key": "",
    "dsp_title": ""
  })

  /**
   * 진열장 목록 가져오기
   * @returns {Promise<void>}
   */
  async function getDisplayList() {
    await api.get('products/displays').then(res => {
      // console.log(res)
      setData(res.data);
    })
  }

  useEffect(() => {
    setFormData({
      ...formData,
      'dsp_id' : modalView.idx > 0 ? modalView.idx : '',
      'dsp_title': modalView.idx > 0 ? modalView.title : '',
    })
  }, [modalView])

  /**
   * 진열장에 속한 아이템 가져오기
   * @param id
   * @returns {Promise<void>}
   */
  async function getDisplayItemList(id) {
    await api.get(`products/display/${id}`).then(res => {
      // console.log(res);
      setDisplayItem(res.data)
    })
  }

  /**
   * 진열장 품목 추가 가능 리스트 불러오기
   * @param dspId 디스플레이 아이디
   * @returns {Promise<void>}
   */
  async function getDisplayaddItemList(dspId) {
    await api.get(`products/display/items/${dspId}`).then(res => {
      console.log(res)
      setDspAddItemList(res.data)
    }).catch(err => console.error('진열장 추가 품목 불로오다 에러', err))
  }

  /**
   * 진열장 품목 추가하기 api 통신
   */
  function addDisplayItem() {
    const formData = {
      'dsp_idx': dspItemModal.idx,
      'prd_idx': selectAddItem.idx
    }
    api.post('products/display/item', formData).then(res => {
      setDspItemModal({
        ...dspItemModal,
        active: false
      })
      getDisplayItemList(dspItemModal.idx)
    }).catch(err => console.error('진열장 품목 추가 에러', err))
  }

  async function delDisplay() {
    await api.delete('products/display/del', {
      data: {
        'dsp_id': dspAlert.idx,
      }
    }).then(res => {
      console.log('삭제 성공', res)
      getDisplayList()
    }).catch(e => {
      console.log('삭제 실패', e)
    })
    setDspAlert(false)
  }

  /**
   * 진열장에 속한 아이템 품목제외
   * @returns {Promise<void>}
   */
  async function delDisplayItemApi() {
    console.log(delDisplayItem)
    await api.delete('products/display/drop', {
      data: {
        'dsp_idx': delDisplayItem.dsp_idx,
        'prd_idx': delDisplayItem.prd_idx,
      }
    }).then(res => {
      console.log('삭제 성공', res)
      setDisplayItem(null);
    }).catch(e => {
      console.log('삭제 실패', e)
    })
    setitemAlert(false)
  }

  async function addDisplay() {
    await api.post('products/display/add', formData).then(res => {
      console.log(res);
    }).catch(err => console.error(err, '등록중 에러가 발생했습니다.'))
  }

  async function editDisplay() {
    await api.put('products/display/update', formData).then(res => {
      console.log(res);
    }).catch(err => console.error(err, '수정중 에러가 발생했습니다.'))
  }

  useEffect(() => {
    getDisplayList()
  }, []);
  if (!data) {
    return (<section className={'dis-section'}>
      <div>
        <h1 className={'title'}> 진열장 목록 </h1>
        <button className={'add_btn'}>진열장 추가</button>
      </div>
      <div className="data-wrap">
        진열장 목록이 없습니다.
      </div>
    </section>)
  }
  return (<section className={'dis-section'}>
    <div className='dis-top'>
      <h1 className={'title'}> 진열장 목록 </h1>
      <button className={'add_btn'} onClick={() => {
        setModalView({
          ...modalView,
          'active': true
        })
      }}>진열장 추가
      </button>
    </div>
    <div className="data-wrap">
      <ul className="dis-list">
        <li className={'dis-item-header'}>
          <span className={'dis-name'}>진열장 이름</span>
          <span className={'dis-btn-box'}>관리</span>
        </li>
        {data.map(item => {
          return (<li key={item.dsp_idx} className={'dis-item'}>
            <span className="dis-name">{item.dsp_title}</span>
            <span className="dis-btn-box">
              <button className={'btn'} type={'button'} onClick={() => {
                getDisplayItemList(item.dsp_idx)
                setDelDisplayItem({
                  ...delDisplayItem,
                  'dsp_idx': item.dsp_idx,
                })
                setDspItemModal({
                  ...dspItemModal,
                  'idx': item.dsp_idx,
                })
              }}>품목관리</button>
              <button className={'btn'} type={'button'} onClick={() => {
                setModalView({
                  ...modalView,
                  'active': true,
                  idx : item.dsp_idx,
                  title : item.dsp_title,
                  key : item.dsp_key,
                })
              }}><VscEdit/></button>
              <button className={'btn'} type={'button'} onClick={() => {
                setDspAlert({
                  ...dspAlert,
                  'idx': item.dsp_idx,
                  active: true,
                })
              }}><VscTrash/></button>
            </span>
          </li>)
        })}
      </ul>
      {displayItem && (<ul className='disitem-list'>
        <li className="disitem-header">
          <span className="disitem-name">상품명</span>
          <span className="disitem-btn-box">
            <button className="btn" onClick={() => {
              setDspItemModal({
                ...dspItemModal,
                'active': true,
              })
              getDisplayaddItemList(dspItemModal.idx)
            }}>품목추가</button>
          </span>
        </li>
        {displayItem.map(disItem => {
          return (<li key={disItem.dspi_idx} className={'disitem-list-item'}>
            <div className={'disitem-img-box'}>
              <img src={baseURL+ disItem.thumbnail_path.slice(1)} alt={disItem.prd_name}/>
            </div>
            <span className={'disitem-name'}>{disItem.prd_name}</span>
            <span className="disitem-btn-box">
                    <button className={'btn'} onClick={() => {
                      setitemAlert({
                        ...itemAlert,
                        active: true
                      })
                      setDelDisplayItem({
                        ...delDisplayItem,
                        'prd_idx': disItem.prd_idx
                      })
                    }}>품목제외</button>
                  </span>
          </li>)
        })}
      </ul>)}
    </div>
    {itemAlert.active && <Alert setView={setitemAlert} delapi={delDisplayItemApi}>
      <div>삭제 하시겠습니까?</div>
    </Alert>}
    {dspAlert.active && <Alert setView={setDspAlert} delapi={delDisplay}>
      <div>삭제 하시겠습니까?</div>
    </Alert>}
    {modalView.active && <DefaultModal setView={setModalView} width={'400px'} height={'250px'} api={modalView.idx > 0 ? editDisplay : addDisplay}>
      <>
        <h2 style={{
          fontSize: '18px',
          marginBottom: '16px'
        }}>{modalView.idx < 0 ? '진열장 등록' : '진열장 수정'}</h2>
        <>
          <label style={{
            width: '100%',
            marginBottom: '16px',
            fontSize: '14px',
            alignSelf: 'flex-start',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{
              marginRight: '16px',
            }}>고유 KEY</span>
            <input style={{width: '70%'}} type="text" name='display_key' onChange={(e) => {
              setFormData({
                ...formData,
                'dsp_key': e.target.value
              })
            }} defaultValue={modalView.idx > 0 ? modalView.key : ''} readOnly={modalView.idx > 0}/>
          </label>
          <label style={{
            width: '100%',
            fontSize: '14px',
            alignSelf: 'flex-start',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{
              marginRight: '16px'
            }}>진열장 이름</span>
            <input style={{width: '70%'}} type="text" name='display_name' onChange={(e) => {
              setFormData({
                ...formData,
                'dsp_title': e.target.value
              })
            }}  defaultValue={modalView.idx > 0 ? modalView.title : ''}/>
          </label>
        </>
      </>
    </DefaultModal>}
    {dspItemModal.active &&
      <DefaultModal setView={setDspItemModal} width={'400px'} height={'650px'} api={addDisplayItem}>
        <>
          <h2 style={{
            fontSize: '18px',
            marginBottom: '16px'
          }}>진열장 품목 등록</h2>
          <table>
            <thead>
            <tr>
              <th width={'70%'}>상품명</th>
              <th>관리</th>
            </tr>
            </thead>
            <tbody>
            {dspAddItemList && dspAddItemList.map((item) => {
              return (
                <tr key={item.prd_idx} style={{
                  borderBottom: '1px solid #d8d8d8',
                  outline: selectAddItem.idx === item.prd_idx ? '1px solid red' : ''
                }}>
                  <td style={{
                    padding: '5px 0',
                    borderRight: '1px solid #d8d8d8'
                  }}>{item.prd_name}</td>
                  <td style={{
                    padding: '5px 0',
                    borderRight: '1px solid #d8d8d8'
                  }}>
                    <button style={{padding: '5px'}}
                            onClick={() => {
                              setSelectAddItem({...selectAddItem, 'idx': item.prd_idx})
                            }}>추가하기
                    </button>
                  </td>
                </tr>
              )
            }) //dspAddItemList.map
            }
            </tbody>
          </table>
        </>
      </DefaultModal>}
  </section>)
}
