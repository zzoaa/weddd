import React, {useEffect, useState} from 'react';
import api from "../../../api/axios.js";
import {
  NativeSelect,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,

} from "@mui/material";
import {GrNotes} from "react-icons/gr";
import DefaultModal from "../../../features/DefaultModal.jsx";

export default function PartnerList() {
  const [partnerData, setPartnerData] = useState(null)
  const [partnerDetailData, setPartnerDetailData]= useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const userData = JSON.parse(sessionStorage.getItem('ud'))
  const [detailFormData, setDetailFormData] = useState({
    reg_user: userData.id,
    cont_idx: 0,
  })

  useEffect(() => {
    getData()
  }, [detailModal]);

  //제휴 목록 불러오기
  async function getData() {
    try {
      const { data} = await api.get('/partner/contact/list/all')
      // console.log(data);
      setPartnerData(data)
    }catch (e) {
      alert('불러오기 실패')
      console.error(e);
    }
  }
  //제휴 상세 내용 불러오기
  async function getDetailData(cont_idx) {
    try {
      const {data} = await api.get(`partner/contact/${cont_idx}`)
      console.log(data);
      setPartnerDetailData(data);
    }catch (e) {
      console.error(e);
    }
  }
  //제휴 모달 켜기
  async function detailModalOn(cont_idx) {
    await getDetailData(cont_idx)
    setDetailModal(true)
    setDetailFormData({
      ...detailFormData,
      cont_idx: cont_idx
    })
  }



  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(event.target.value);
    setPage(0);
  };

  function inputChange(e) {
    setDetailFormData({
      ...detailFormData,
      [e.target.name] : e.target.value
    })
  }

  async function memoSubmit() {
    try {
      const {status} = await api.put('partner/contact', detailFormData)
      if(status === 200) {
        setDetailModal(false)
        setDetailFormData({
          reg_user: userData.id,
          cont_idx: 0,
        })
      }
    }catch (e) {
      alert('메모 작성 실패')
      console.log(e)
    }
  }

  if(!partnerData) return <div>Loading....</div>

  return (
    <section className={'partner-section'}>
      <h2 className='title'>
        <span>제휴 문의 관리</span>
      </h2>
      <Table className={'partner-table'}>
        <TableHead className={'p-head'}>
          <TableRow className={'list-tr'}>
            <TableCell align={'center'} className={'list-th'}>상태</TableCell>
            <TableCell align={'center'} className={'list-th'}>타입</TableCell>
            <TableCell align={'center'} className={'list-th'}>회사명</TableCell>
            <TableCell align={'center'} className={'list-th'}>이메일</TableCell>
            <TableCell align={'center'} className={'list-th'}>전화번호</TableCell>
            <TableCell align={'center'} className={'list-th'}>내용</TableCell>
            <TableCell align={'center'} className={'list-th'}>문의자</TableCell>
            <TableCell align={'center'} className={'list-th'}>작성일자</TableCell>
            <TableCell align={'center'} className={'list-th'}>관리</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {partnerData.map(item => (
            <TableRow className={'list-tr'} key={item.cont_idx}>
              <TableCell align={'center'} className={'list-td'}>
                <span className={(item.consult_status === '진행 중' ? 'going ' : '') +
                (item.consult_status === '상담 종료' ? 'succ ' : '') + 'part-label'}>{item.consult_status}</span>
                {/*{item.consult_status === '진행 중' && <span>{item}</span>}*/}
              </TableCell>
              <TableCell align={'center'} className={'list-td'}>{item.cont_type}</TableCell>
              <TableCell align={'center'} className={'list-td'}>{item.company_name}</TableCell>
              <TableCell align={'center'} className={'list-td'}>{item.cont_mail}</TableCell>
              <TableCell align={'center'} className={'list-td'}>{item.cont_phone}</TableCell>
              <TableCell align={'center'} className={'list-td'}>{item.cont_text}</TableCell>
              <TableCell align={'center'} className={'list-td'}>{item.user_name}</TableCell>
              <TableCell align={'center'} className={'list-td'}>{item.reg_date.slice(0, 10)}</TableCell>
              <TableCell align={'center'} className={'list-td'}>
                <div className={'btn-wrap'}>
                  <button onClick={() => {detailModalOn(item.cont_idx)}}>
                    <GrNotes />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={5}
        rowsPerPage={rowsPerPage}
        labelRowsPerPage={'보여질 글 수'}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {detailModal && partnerDetailData && <DefaultModal setView={setDetailModal} width={'60vw'} height={'600px'} api={memoSubmit}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className={'list-th'}>상태</TableCell>
              <TableCell className={'list-td'}>
                <NativeSelect
                  fullWidth
                  defaultValue={partnerDetailData.consult_status}
                  inputProps={{
                    name: 'consult_status',
                  }}
                  onChange={inputChange}
                >
                  <option value={'상담 대기'}>상담 대기</option>
                  <option value={'진행 중'}>진행 중</option>
                  <option value={'상담 종료'}>상담 종료</option>
                </NativeSelect>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className={'list-th'}>관리자 메모</TableCell>
              <TableCell className={'list-td'}>
                <textarea className={'super_memo'} name="super_memo" defaultValue={partnerDetailData.super_memo} onChange={inputChange}></textarea>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DefaultModal>}
    </section>
  );
}


