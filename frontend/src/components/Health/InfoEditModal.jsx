import React, { useState, useEffect } from "react";
import api, {baseURL} from "../../api/axios";
import { useSelector } from "react-redux";
import { MdClose } from "react-icons/md";

export default function InfoEditModal(editidx) {
  const [data, setData] = useState(null);
  const [formData, setFormData] = useState({
    cat_idx: 0,
    reg_user: 0,
    cat_depth: 1,
    cat_parent_id: 0,
    cat_title: "",
    icon_filepath: '',
  });
  const userData = useSelector((state) => state.user.userData);

  useEffect(() => {
    async function _infoGet() {
      const response = await api.get(
        `/healthinfo/category/${editidx.data.idx}`
      );
      const allData = await api.get("healthinfo/category/list/all");

      const map = {};
      allData.data.forEach((item) => {
        map[item.cat_idx] = { ...item, children: [] };
      });

      const result = [];
      allData.data.forEach((item) => {
        // cat_parent_id가 0인 경우 최상위 항목입니다.
        if (item.cat_parent_id === 0) {
          result.push(map[item.cat_idx]);
        } else {
          // 그렇지 않은 경우 해당 항목의 부모의 children 배열에 추가합니다.
          if (map[item.cat_parent_id]) {
            map[item.cat_parent_id].children.push(map[item.cat_idx]);
          }
        }
      });
      // console.log(response);
      setFormData(() => {
        return {
          cat_idx: editidx.data.idx,
          reg_user: userData.id,
          cat_depth: response.data[0].cat_depth,
          cat_parent_id: response.data[0].cat_parent_id,
          cat_title: response.data[0].cat_title,
          icon_filepath: response.data[0].icon_filepath,
        };
      });
      setData(result);
      // console.log(result);
    }
    _infoGet();
    // console.log(editidx.data, 'hoho');
  }, []);
  // console.log(formData)
  return (
    <div className="modal-outter">
      <div className="modal-inner">
        <button className="close-btn" onClick={() => {
          editidx.setEditModal(() => {
            return {
              active: false,
              idx: -1,
            };
          });
        }}><MdClose /></button>
        {!data && <div>Loding.....</div>}
        {data && (
          <form
            id="infoadd"
            className="infoadd"
            onSubmit={(e) => {
              __onsubmit(e, formData, editidx.setEditModal);
            }}
          >
            <label className="form-label">
              <span>정보 단계</span>
              <select
                name="cat_depth"
                onChange={(e) => {
                  setFormData({ ...formData, cat_depth: e.target.value });
                }}
                value={formData.cat_depth}
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
                    value={formData.cat_depth}
                  />
                </>
              ) : (
                <>
                  <select
                    name="cat_parent_id"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        cat_parent_id: e.target.value,
                      });
                    }}
                  >
                    {data.map((item) => {
                      // console.log(item);
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
                            item.children.map((childItem) => {
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
            <button type="submit">등록하기</button>
          </form>
        )}
      </div>
    </div>
  );
}

async function __onsubmit(e, formData, setModal) {
  e.preventDefault();
  try {
    const response = await api.put("healthinfo/category", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    });
    console.log(response);
    setModal((state) => {
      return {
        active: false,
        idx: -1,
      };
    });
  } catch (e) {
    console.error(e);
    alert("에러 발생!!", e.error);
  }
}
