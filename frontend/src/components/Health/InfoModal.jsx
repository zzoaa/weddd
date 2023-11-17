import React, { useEffect, useState } from "react";
import api, {baseURL} from "../../api/axios";
import { useSelector } from "react-redux";
import {MdClose} from "react-icons/md";

export default function InfoModal(infodata) {
  // console.log(infodata);
  const [formData, setFormData] = useState({
    reg_user: 0,
    cat_depth: '1',
    cat_parent_id: 0,
    icon_filepath: '',
    cat_title: "",
  });
  const userData = useSelector((state) => state.user.userData);
  const [btnActived, setBtnActived] = useState(false);

  useEffect(() => {
    setFormData({...formData, reg_user: Number(userData.id)})

  }, [])
  return (
    <div className="modal-outter">
      <div className="modal-inner">
        <button className="close-btn" onClick={() => {
          infodata.modalActived(false)
        }}><MdClose /></button>
        <form
          id="infoadd"
          className="infoadd"
          onSubmit={(e) => {
            __onsubmit(e, formData, infodata.modalActived);
          }}
        >
          <label className="form-label">
            <span>정보 단계</span>
            <select
              name="cat_depth"
              onChange={(e) => {
                setFormData({ ...formData, cat_depth: e.target.value });
              }}
            >
              <option value="1">대분류</option>
              <option value="2">소분류</option>
              <option value="3">질병명</option>
            </select>
          </label>
          <label className="form-label">
            <span>부모 여부</span>
            {formData.cat_depth == 1 ? (
              <>
                <span> : 없음</span>
                <input
                  type="hidden"
                  name="cat_parent_id"
                  value={0}
                  onChange={() => {
                    setFormData({ ...formData, cat_parent_id: 0 });
                  }}
                />
              </>
            ) : (
              <>
                <select
                  name="cat_parent_id"
                  value={formData.cat_parent_id}
                  onChange={(e) => {
                    setFormData({ ...formData, cat_parent_id: Number(e.target.value) });
                  }}

                >
                  <option value={null}>-- 선택해주세요 --</option>
                  {infodata.data.map((item, idx) => {

                    return (
                      <React.Fragment key={item.cat_idx}>
                        {formData.cat_depth == 2 && (
                          <option key={item.cat_idx} value={item.cat_idx}>
                            대분류 : {item.cat_title}
                          </option>
                        )}
                        {/* 단계가 질명병일때만 전부 다 보여줘야됨 */}
                        {formData.cat_depth == 3 &&
                          item.children.length > 0 &&
                          item.children.map((childItem, idx) => {
                            return (
                              <option

                                key={childItem.cat_idx}
                                value={childItem.cat_idx}
                              >
                                &nbsp;&nbsp;소분류 : {childItem.cat_title}
                              </option>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
                </select>
              </>
            )}
          </label>
          <label className="form-label">
            <span>건강정보 이름</span>
            <input
              type="text"
              name="cat_title"
              value={formData.cat_title}
              onChange={
                (e) => {
                  setFormData({
                    ...formData,
                    cat_title: e.target.value,
                  }); //setFormData
                  setBtnActived(true);
                } // onChange
              }
            />
          </label>
          {formData.cat_depth === '1' && <label className='form-label'>
            {formData.icon_filepath && typeof (formData.icon_filepath) === 'string' &&
                <img style={{width: '100px', objectFit: 'contain'}}
                     src={baseURL + formData.icon_filepath.slice(1)}/>}
            <input type="file" name="icon_" onChange={(e) => {
              const file = e.target.files[0]
              setFormData({
                ...formData,
                icon_filepath: file,
              })
            }}/>
          </label>}
          <input type="hidden" name="reg_user" />
          <button type="submit" disabled={!btnActived}>
            등록하기
          </button>
        </form>
      </div>
    </div>
  );
}

async function __onsubmit(e, formData, setModal) {
  e.preventDefault();

  try {
    const response = await api.post("healthinfo/category", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });
    console.log(response);
    setModal(() => false);
  } catch (e) {
    alert("에러 발생!!", e.error);
  }
}
