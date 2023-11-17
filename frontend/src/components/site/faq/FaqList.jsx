import React, {useEffect, useState} from 'react';
import api from "../../../api/axios.js";
import {BiAddToQueue, BiEdit, BiTrash} from "react-icons/bi";
import FaqListEdit from "./FaqListEdit.jsx";
import Alert from "../../../features/Alert.jsx";
import FaqItems from "./FaqItems.jsx";

export default function FaqList() {
  const [data, setData] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [listModal, setListModal] = useState(false);
  const [faqModal, setFaqModal] = useState(false);
  const [selectList, setSelectList] = useState({
    type: '',
    idx: 0,
  });
  const [selectFaq, setSelectFaq] = useState({type: 'add', idx: 0,})
  const [listAlert, setLIstAlert] = useState({
    active: false,
    idx: 0,
    dellist: [],
  });
  const [faqAlert, setFaqAlert] = useState({
    active: false,
    idx: 0,
  })
  useEffect(() => {
    getData();
  }, [listModal, listAlert]);

  useEffect(() => {
    if(selectList.idx !== 0) {
      getDetailData(selectList.idx)
    }

  }, [faqModal]);

  if (!data) {
    return (<div>loading...</div>)
  }
  return (
    <>
      <section className='faq-list-section'>
        <h1 className='title'>FAQ 관리</h1>
        <div className="inner">
          <table className="faqlist-table">
            <thead>
            <tr>
              <th>이름</th>
              <th className={'flex'}>
                <span>관리</span>
                <span className='add'><BiAddToQueue onClick={() => {
                  listModalToggle('add', 0)
                }}/></span>
              </th>
            </tr>
            </thead>
            <tbody>
            {data.map(row => (
              <tr key={row.fac_idx} className={row.fac_idx === selectList.idx ? 'on' : ''}>
                <td>
                  <div onClick={() => {
                    getDetailData(row.fac_idx)
                    setSelectList({
                      ...selectList,
                      idx: row.fac_idx
                    })
                  }}>{row.fac_title}</div>
                </td>
                <td>
                  <div>
                    <BiEdit onClick={() => {
                      listModalToggle('edit', row.fac_idx)
                    }}/>
                    <BiTrash onClick={() => {
                      setLIstAlert((prevState) => {
                        const newarray = [...prevState.dellist, row.fac_idx]
                        return {...prevState, active: true, dellist: newarray}
                      })
                    }}/>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
          {detailData && <table className='faqdetail-table'>
            <thead>
            <tr>
              <th>제목</th>
              <th>내용</th>
              <th className={'flex'}>
                <span>관리</span>
                <span className='add' onClick={() => {addDetailData('add', selectList.idx)}}><BiAddToQueue/></span>
              </th>
            </tr>
            </thead>
            <tbody>
            {detailData.length === 0 && <tr>
              <td colSpan={3}>등록된 글이 없습니다.</td>
            </tr>}
            {detailData.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <div>{item.faq_title}</div>
                </td>
                <td>
                  <div className='faq_content'>
                    {item.faq_content}
                  </div>
                </td>
                <td>
                  <div>
                    <BiEdit onClick={() => {
                      addDetailData('edit', selectList.idx, item)
                    }}/>
                    <BiTrash onClick={() => {setFaqAlert({...faqAlert, active: true, idx: item.faq_idx})}}/>
                  </div>
                </td>
              </tr>
            ))}
            </tbody>
          </table>}
        </div>
        {listModal && <FaqListEdit type={selectList.type} setView={setListModal} facidx={selectList.idx}/>}
        {faqModal && <FaqItems type={selectFaq.type} setView={setFaqModal} facidx={selectList.idx} item={selectFaq}/>}
        {listAlert.active && <Alert setView={setLIstAlert} delapi={delFaqList}>
          삭제 하시겠습니까?
        </Alert>}
        {faqAlert.active && <Alert setView={setFaqModal} delapi={delDetailFaq}>삭제 하시겠습니까?</Alert>}
      </section>
    </>
  );

  /**
   * 카테고리 목록 불러오기
   * @returns {Promise<void>}
   */
  async function getData() {
    await api.get('faq/category').then(res => {
      // console.log(res);
      setData(res.data)
    }).catch(err => console.error(err))
  }

  /**
   * faq리스트 모달창 토글 함수
   * @param type
   * @param idx
   */
  function listModalToggle(type, idx) {
    setSelectList(prevState => {
      setListModal(true)
      return {...prevState, type, idx}
    })
  }

  /**
   * faq카테고리 삭제
   * @returns {Promise<void>}
   */
  async function delFaqList() {
    const formData = {
      faqIds: listAlert.dellist
    };
    try {
      const {status} = await api.post('faq/category/delete', formData)
      if (status === 200) {
        alert('삭제 성공')
        setLIstAlert({
          ...listAlert,
          active: false,
          idx: 0,
          dellist: []
        })
      }
    } catch (e) {
      alert('삭제중 에러')
      console.log(e)
    }
  }

  /**
   * 카테고리에 등록된 글 목록 불러오기
   * @param facIdx 카테고리 idx
   * @returns {Promise<void>}
   */
  async function getDetailData(facIdx) {
    try {
      const {data} = await api.get(`faq/post/list/${facIdx}`)
      // console.log(data);
      setDetailData(data);
    } catch (e) {
      alert('상세내역 불러오기 실패');
      console.error(e);
    }
  }

  /**
   * faq 글내용 수정 등록 토글
   * @param type
   * @param idx
   * @param item
   */
  function addDetailData(type, idx, item) {
    setSelectFaq(prevState => {
          setFaqModal(true)
          return {...prevState, type, idx, item}
      })
  }

  /**
   * faq 상세 글 삭제
   * @returns {Promise<void>}
   */
  async function delDetailFaq() {
    const formData = {
      faq_idx : faqAlert.idx,
    }
    try {
      const {status} =await api.post('faq/post/delete', formData)
      if(status === 200) {
        alert('삭제 성공');
        setFaqAlert({
          active: false,
          idx: 0
        })
      }
    }catch (e) {
      alert('faq 글 삭제 중 에러 발생')
      console.error(e);
    }

  }
}


