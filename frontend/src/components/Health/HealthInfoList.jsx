import React, {useEffect, useState} from "react";
import {MdModeEditOutline, MdAssignment, MdDelete} from "react-icons/md";
import api, {baseURL} from "../../api/axios";
import InfoModal from "./InfoModal";
import InfoEditModal from "./InfoEditModal";
import InfoDetailModal from "./InfoDetailModal.jsx";
import Alert from "../../features/Alert.jsx";
import {NavLink} from "react-router-dom";

function HealthInfoList() {
  const [data, setData] = useState(null); // 데이터를 저장할 상태
  const [firstselectedCatId, setfirstSelectedCatId] = useState(null); // 추가: 선택된 항목의 cat_idx를 저장하는 상태
  const [secondSelectedCatId, setSecondSelectedCatId] = useState(null);
  const [infoDetailModal, setInfoDetailModel] = useState({
    active: false,
    idx: -1,
  })
  const [editModal, setEditModal] = useState({
    active: false,
    idx: -1,
  });
  const [modalActived, setModalActived] = useState(false);
  useEffect(() => {
    setSecondSelectedCatId(null);
  }, [firstselectedCatId]);

  useEffect(() => {
    async function _listGet() {
      const response = await api.get("healthinfo/category/list/all");
      // 먼저, 모든 항목을 ID를 기준으로 매핑합니다.
      const map = {};
      response.data.forEach((item) => {
        map[item.cat_idx] = {...item, children: []};
      });

      const result = [];
      response.data.forEach((item) => {
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

      setData(result);
    }

    _listGet(); // 함수 호출
    setfirstSelectedCatId(null);
    setSecondSelectedCatId(null);
  }, [modalActived, editModal]);

  function refreshItems() {

    async function _listGet() {
      const response = await api.get("healthinfo/category/list/all");
      // 먼저, 모든 항목을 ID를 기준으로 매핑합니다.
      const map = {};
      response.data.forEach((item) => {
        map[item.cat_idx] = {...item, children: []};
      });

      const result = [];
      response.data.forEach((item) => {
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

      setData(result);
    }

    _listGet(); // 함수 호출
    setfirstSelectedCatId(null);
    setSecondSelectedCatId(null);
  }



  // 데이터가 로드되지 않았을 때 로딩 메시지 표시 (옵션)
  if (!data) {
    return (
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          border: "1px solid balck",
          transform: "translate(-50%, -50%)",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="health-info">
        <div className="button-wrap">
          <h1 className="title">건강 정보</h1>
          <button className="info-add" onClick={() => {
            setModalActived(true);
          }}>건강정보 등록
          </button>
        </div>
        <ul
          className="info-container"
          data-depth={1}
          onClick={(e) => _InfoClickHandler(e, data, setfirstSelectedCatId, 1)}
        >
          <li className="__info-item">
            <span className="item-text">대분류</span>
          </li>
          {/* 데이터를 화면에 그리는 로직 (예: 리스트 렌더링) */}
          {data.map((item) => {
            return (
              <li key={item.cat_idx} className="__info-item">
                {item.cat_parent_id === 0 && (
                  <>
                    <EditButton idx={item.cat_idx} data={item} setEditModal={setEditModal}
                                refreshItems={refreshItems} setInfoDetailModel={setInfoDetailModel}/>
                    <span
                      className="item-text"
                      data-catid={item.cat_idx}
                      data-depth={item.cat_depth}
                      data-parentid={item.cat_parent_id}
                    >
                        <span className='img-wrap'>
                            <img src={item.icon_filepath && baseURL + item.icon_filepath.slice(1)} />
                        </span>
                      {item.cat_title}
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ul>
        {firstselectedCatId && (
          <InfoListchild
            data={firstselectedCatId}
            depth={2}
            selectedCatId={firstselectedCatId}
            setSecondSelectedCatId={setSecondSelectedCatId}
            setEditModal={setEditModal}
            refreshItems={refreshItems}
            setInfoDetailModel={setInfoDetailModel}
          />
        )}
        {firstselectedCatId && secondSelectedCatId && (
          <InfoListchild
            data={secondSelectedCatId}
            depth={3}
            selectedCatId={secondSelectedCatId}
            setModalActived={setModalActived}
            setEditModal={setEditModal}
            refreshItems={refreshItems}
            setInfoDetailModel={setInfoDetailModel}
          />
        )}
      </div>
      {modalActived && <InfoModal data={data} modalActived={setModalActived}/>}
      {editModal.active && <InfoEditModal data={editModal} setEditModal={setEditModal}/>}
      {infoDetailModal.active && <InfoDetailModal data={infoDetailModal} setInfoModal={setInfoDetailModel}/>}

    </>
  );
}

function InfoListchild(prop) {

  return (
    <ul
      className="info-container"
      data-depth={prop.depth}
      onClick={(e) =>
        _InfoClickHandler(
          e,
          prop.data,
          prop.setSecondSelectedCatId,
          Number(prop.depth),
        )
      }
    >
      <li className="__info-item">
        <span className="title-item">
          {prop.depth === 2 ? "소분류" : "질병명"}
        </span>
      </li>
      {prop.data.children.map((item) => {
        return (
          <li key={item.cat_idx} className="__info-item">
            {
              <>
                <EditButton idx={item.cat_idx} data={item} setEditModal={prop.setEditModal}
                            refreshItems={prop.refreshItems} setInfoDetailModel={prop.setInfoDetailModel}/>
                <span
                  className="item-text"
                  data-catid={item.cat_idx}
                  data-depth={item.cat_depth}
                  data-parentid={item.cat_parent_id}
                >
                                  {item.cat_title}
                </span>
              </>
            }
          </li>
        );
      })}
    </ul>
  );
}

function _InfoClickHandler(e, data, setSelectedCatId, depth) {
  const target = e.target.closest("[data-catid]");
  const infoItem = e.target.closest(".__info-item");

  if (!target) {
    return;
  }

  const prevtarget = document.querySelectorAll(
    `ul[data-depth="${target.dataset.depth}"] .__info-item.on`
  );
  // console.log(prevtarget);
  if (prevtarget.length > 0) {
    prevtarget.forEach((item) => {
      item.classList.remove("on");
    });
  }

  infoItem.classList.add("on");
  const currentIndex = target.dataset.catid;

  if (depth === 1) {
    const first = data.filter((item) => item.cat_idx == currentIndex)[0];
    if (first && first.children.length > 0) {
      setSelectedCatId(first);
    } else {
      setSelectedCatId(null);
    }
  } else if (depth === 2) {
    const second = data.children.filter((item) => {
      return item.cat_idx == currentIndex;
    })[0];
    if (second && second.children.length > 0) {
      setSelectedCatId(second);
    } else {
      setSelectedCatId(null);
    }
  }

}

function EditButton(data) {
  const [alertView, setalertView] = useState({
    idx: 0,
    active: false
  });

  function editClick() {
    data.setEditModal(() => {
      return {
        active: true,
        idx: data.idx
      }

    })
  }
  async function delClick() {
    console.log(data.idx)
    const formData = {
      'catIds': [data.idx]
    }
    try {
      const response = await api.post('healthinfo/category/delete', formData)
      // console.log(response)
      if (response.status == 200) {
        data.refreshItems();
      }

    } catch (e) {
      alert('에러발생');
    }

  }


  async function infoClick() {

    data.setInfoDetailModel({
      active: true,
      idx: data.idx
    })

  }

  return (
    <>
      {data.data.children.length > 0
        ? (
          <>
            <button className="edit-btn btn" onClick={editClick}><MdModeEditOutline/></button>
            <button className="del-btn btn" onClick={()=> {
              setalertView({
                ...alertView,
                active: true
              })
            }}><MdDelete/></button>
          </>
        )
        : (
          <>
            <button className="edit-btn btn" onClick={editClick}><MdModeEditOutline/></button>
            <button className="del-btn btn" onClick={()=> {
              setalertView({
                ...alertView,
                active: true
              })
            }}><MdDelete/></button>
            <NavLink className='btn info-btn' to={`/health/info/${data.idx}`}><MdAssignment/></NavLink>
            {/*<button className="info-btn btn" onClick={infoClick}></button>*/}
          </>
        )
      }
      {alertView.active && <Alert setView={setalertView} delapi={delClick}>
        <div>삭제 하시겠습니까?</div>
      </Alert>}
    </>
  )
}

export default HealthInfoList;
