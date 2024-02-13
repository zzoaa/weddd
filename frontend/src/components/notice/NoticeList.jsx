import React, {useEffect, useState} from 'react';
import {Button, Checkbox, Table, TableBody, TableCell, TableHead, TablePagination, TableRow} from "@mui/material";
import api, {baseURL} from "../../api/axios.js";
import {NavLink, useNavigate} from "react-router-dom";
import Alert from "../../features/Alert.jsx";

export default function NoticeList() {
  const userData = JSON.parse(sessionStorage.getItem('ud'))
  const navigate = useNavigate();
  const [noticeData, setNoticeData] = useState()
  const [delObj, setDelObj] = useState({})
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [delAlert, setDelAlert] = useState({
    active: false,
    idx: 0,
  })
  const [tempFormData, setTempFormData] = useState({
    "tip_type": "TIP",
    "tip_title": "제목",
    "tip_sub_title": "부제목",
    "tip_content": "팁 콘텐트",
    "ox_content": "",
    "ox_comment": "",
    "reg_user": userData.id
  })
  useEffect(() => {
    getData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(event.target.value);
    setPage(0);
  };

  let status;
  async function getData() {
    try {
      let {data, status} = await api.get('notice/list')
      console.log(data);
      if(data && data.length > 0){setNoticeData(data)};
    } catch (e) {
      alert('불러오기 오류')
      console.error(e);
    }
  }

  async function addSubmit() {
    try {
      const {data, status} = await api.post('notice/write', tempFormData, {
        headers: {
          // "Content-Type": "multipart/form-data",
          "Authorization": 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsIm5hbWUiOiJhZG1pbiIsImlhdCI6MTcwNjY3NTc3OSwiZXhwIjoxNzA2NzYyMTc5fQ.AAtl-R6ESeIZcqm_smYoa_Bcw8ka3YLfma0t4Ba45aA',
        }
      })
      if (status === 200) {
        navigate(`${data.not_idx}`)
      }
    } catch (e) {
      alert('등록 실패')
      console.error(e);
    }
  }

  async function delSubmit() {
    const formData = {
      deleteIdxsList: [],
    }
    for (let key in delObj) {

      if (delObj[key]) {

        formData.deleteIdxsList.push(key)
      }
    }

    try {
      const {status} = await api.put('notice/delete', formData)
      // console.log(res);
      if(status === 200) {
        alert('삭제 성공')
        setDelAlert({
          ...delAlert,
          active: false,
        })
        getData();
      }

    }catch (e) {
      alert('삭제 실패')
      console.error(e);

    }
  }

  if (!noticeData) return (
      <section className={'tip-list-section'}>
        <h2 className='title'>
          <span>공지 이벤트 관리</span>
          <div className="btn-wrap">
            <Button className={'mr16'} color={"primary"} variant={'outlined'} size={'small'}
                    onClick={addSubmit}>등록하기</Button>
            <Button color={"primary"} variant={'outlined'} size={'small'} onClick={() => {setDelAlert({
              ...delAlert,
              active: true,
            })}}>선택 삭제하기</Button>
          </div>
        </h2>
      <div>Loading....</div>
      </section>
  )
  return (
    <section className={'tip-list-section'}>
      <h2 className='title'>
        <span>공지 이벤트 관리</span>
        <div className="btn-wrap">
          <Button className={'mr16'} color={"primary"} variant={'outlined'} size={'small'}
                  onClick={addSubmit}>등록하기</Button>
          <Button color={"primary"} variant={'outlined'} size={'small'} onClick={() => {setDelAlert({
            ...delAlert,
            active: true,
          })}}>선택 삭제하기</Button>
        </div>
      </h2>
      <div>
        <Table className={'tip-table'}>
          <TableHead className={'t-head'}>
            <TableRow className={'list-tr'}>
              <TableCell align={'center'} className={'list-th'}></TableCell>
              <TableCell align={'center'} className={'list-th'}>번호</TableCell>
              <TableCell align={'center'} className={'list-th'}>썸네일</TableCell>
              <TableCell align={'center'} className={'list-th'}>제목</TableCell>
              <TableCell align={'center'} className={'list-th'}>부 제목</TableCell>
              <TableCell align={'center'} className={'list-th'}>작성일자</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {noticeData.map(row => (
              <TableRow key={row.not_idx}>
                <TableCell align={'center'} className={'list-td'}>
                  <Checkbox size={'small'} onChange={(e) => {
                    setDelObj({
                      ...delObj,
                      [row.not_idx]: e.target.checked
                    })
                  }}/>
                </TableCell>
                <TableCell align={'center'} className={'list-td'}>{row.not_idx}</TableCell>
                <TableCell align={'center'} className={'list-td'}>
                  <div className="img-wrap">
                    {row.thumb_filepath && (
                      <img src={row.thumb_filepath}/>
                    )}
                  </div>
                </TableCell>
                <TableCell align={'center'} className={'list-td'}>
                  <NavLink className={'list-link'} to={`${row.not_idx}`}>{row.not_title}</NavLink>
                </TableCell>
                <TableCell align={'center'} className={'list-td'}>{row.not_subtitle}</TableCell>
                <TableCell align={'center'} className={'list-td'}>{row.not_datetime.slice(0, 10)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={noticeData.length}
          rowsPerPage={rowsPerPage}
          labelRowsPerPage={'보여질 글 수'}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
      {delAlert.active && <Alert setView={setDelAlert} delapi={delSubmit}>
        삭제하시겠습니까?
      </Alert>}
    </section>
  );
}



