import React, {useEffect, useState, useMemo, useRef} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import api, {baseURL} from "../../api/axios.js";
import {Button, NativeSelect, Table, TableBody, TableCell, TableRow, TextField} from "@mui/material";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import DefaultModal from "../../features/DefaultModal.jsx";
import Alert from "../../features/Alert.jsx";

export default function NoticeEdit() {
  const {not_idx} = useParams();

  const reactQuillRef = useRef(null);
  const quillModule = useMemo(() => {
    return {
      toolbar: {
        container: [
          [{'header': [1, 2, 3, 4, false]}],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          ['image'],
          ['clean']
        ],
        handlers: {
          image: imageHandler,
        },
      }
    }
  }, [])

  async function imageHandler() {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();
    input.addEventListener("change", async () => {
      const file = input.files?.[0];
      const formData = new FormData();
      formData.body
      formData.append("files", file);

      try {
        const res = await api.post(`uploads/notice`, {
          files: file
        }, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          Accept : "*/*"
        });
        console.log(res);
        const editor = reactQuillRef.current.getEditor();
        const range = editor.getSelection();
        // 가져온 위치에 이미지를 삽입한다
        editor.insertEmbed(range.index, "image", res.data[0]);
        // console.log('이미지 삽입')
        // 성공적으로 수정되었을 때의 로직 (예: 알림 표시)
      } catch (error) {
        console.error('파일 업로드 실패', error);
        // 실패했을 때의 로직 (예: 에러 메시지 표시)
      }
    })
  }
  async function thumbnailHandler(file) {
      try {
        setFormData({
          ...formData,
          thumb_filepath: file,
        })

        const res = await api.post(`uploads/notice`, {
          files: file,
          att_target_type: 'NOTICE',
          att_target: parseInt(not_idx)

        }, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          Accept : "*/*"
        });
        console.log(res);

        if (res) {
          setImgpath(res.data[0]);
          setFormData({
            ...formData,
            thumb_filepath: res.data[0],
          })
        }

        //
        // const editor = reactQuillRef.current.getEditor();
        // const range = editor.getSelection();
        // // 가져온 위치에 이미지를 삽입한다
        // editor.insertEmbed(range.index, "image", res.data[0]);
        // console.log('이미지 삽입')
        // 성공적으로 수정되었을 때의 로직 (예: 알림 표시)
      } catch (error) {
        console.error('파일 업로드 실패', error);
        // 실패했을 때의 로직 (예: 에러 메시지 표시)
      }
  }


  const navigate = useNavigate();
  const userData = JSON.parse(sessionStorage.getItem('ud'))
  const [noticeData, setNoticeData] = useState(null)
  const [imgpath, setImgpath] = useState('')
  const [formData, setFormData] = useState({
    "not_idx": parseInt(not_idx),
    // "not_title": "",
    // "not_subtitle": "",
    // "not_content": "",
  })

  useEffect(() => {
    getData();

  }, []);

  //건강팁 상세 내역 불러오기
  async function getData() {
    try {
      console.log('not_idx' + not_idx);
      const {data} = await api.get(`notice/post/${not_idx}`)
      setNoticeData(data);
      // setFormData({
      //   ...formData,
      //   not_title: data.not_title,
      //   not_type: data.not_type,
      //   not_sub_title: data.not_sub_title,
      //   not_content: data.not_content,
      // })
      if (data.thumb_filepath) {
        setImgpath(data.thumb_filepath);
      }
      // console.log(data);
    } catch (e) {
      alert('불러오기 실패')
      console.log(e);
      navigate(-1);
    }
  }

  //수정 하기 서버에 전송
  async function Submit() {
    console.log(formData);
    try {
      const {status} = await api.put('notice/edit', formData, {
        headers: {
          // "Content-Type": "multipart/form-data",
          "Authorization": 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzgsIm5hbWUiOiJhZG1pbiIsImlhdCI6MTcwNjY3NTc3OSwiZXhwIjoxNzA2NzYyMTc5fQ.AAtl-R6ESeIZcqm_smYoa_Bcw8ka3YLfma0t4Ba45aA',
        }
      })
      if (status === 200) {
        alert('수정 성공')
        getData();
      }
    } catch (e) {
      alert('수정 실패')
      console.error(e);
    }
  }

  function inputChange(e) {
    console.log(e.target.value);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (!noticeData) return <div>Loading....</div>
  return (
    <section className='tip-edit-section'>
      <h2 className="title">
        <span>건강팁 상세 관리</span>
        <div className="btn-wrap">
          <Button color={"primary"} variant={'outlined'} size={'small'} onClick={() => {
            navigate(-1)
          }}>뒤로하기</Button>
        </div>
      </h2>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell className={'edit-th'}>제목</TableCell>
            <TableCell className={'edit-td'}>
              <TextField fullWidth id="standard-basic" label="제목" variant="standard" name={'not_title'}
                         defaultValue={noticeData.not_title} onChange={inputChange}/>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'edit-th'}>부 제목</TableCell>
            <TableCell className={'edit-td'}>
              <TextField fullWidth id="standard-basic" label="부제목" variant="standard" name='not_subtitle'
                         defaultValue={noticeData.not_subtitle} onChange={inputChange}/>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'edit-th'}>내용</TableCell>
            <TableCell className={'edit-td'}>
              {<ReactQuill
                  ref={reactQuillRef}
                  modules={quillModule}
                  theme="snow"
                  defaultValue={noticeData.not_content}
                  onChange={(value) => {
                    setFormData({
                      ...formData,
                      not_content: value,
                    })
                  }}>
              </ReactQuill> }
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className={'edit-th'}>썸네일 이미지</TableCell>
            <TableCell className={'edit-td'}>
              {!!imgpath && (
                <div className={'img-wrap'}>
                  <img src={imgpath}/>
                </div>
              )}
              <TextField fullWidth type={'file'} label="Standard" variant="standard" name='thumb_filepath'
                         onChange={(e) => {
                           const file = e.target.files[0]
                           thumbnailHandler(file)
                           // setFormData({
                           //   ...formData,
                           //   thumb_filepath: file,
                           // })
                         }}/>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className="btn-wrap">
        <Button variant={'contained'} color={'primary'} onClick={Submit}>수정하기</Button>
      </div>

    </section>
  );

  function Pagination ({ currentPage, pageSize, totalCount }) {
    const totalPages = Math.ceil(totalCount / pageSize);

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <div key={i} className={`coupon-page ${currentPage === i ? 'active' : ''}`} onClick={() => {
          setCouponPage({
            ...couponPage,
            page: i
          })
        }}>
          {i}
        </div>
      );
    }

    return <div className='coupon-pagination'>{pages}</div>;
  }

}


