import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import api from "../../api/axios.js";
import DefaultTable from "../../features/DefaultTable.jsx";
import 'react-quill/dist/quill.bubble.css';
import ReactQuill from "react-quill";

export default function HealthInfoEdit() {
  const navigate = useNavigate();
  const {cat_id} = useParams();
  const [data, setData] = useState(null)
  //건강기능식품
  const [foodList, setFoodList] = useState(null)
  //건강식품
  const [funcFoodList, setFuncFoodList] = useState(null);
  //추천레시피
  const [recipeList, setRecipeList] = useState(null);
  //추천운동
  const [exerciseList, setExerciseList] = useState(null)
  const userData = JSON.parse(sessionStorage.getItem('ud'))
  const [formData, setFormData] = useState(null);
  const [foodArray, setFoodArray] = useState([]);
  const [funcFoodArray, setFuncFoodArray] = useState([]);
  const [exArray, setExArray] = useState([]);
  const [recipeArray, setRecipeArray] = useState([]);
  useEffect(() => {
    getData();
  }, []);
  /**
   * 뒤로가기 함수
   * return @void
   */
  const goBack = () => {
    navigate(-1);
  };

  /**
   * 상세 글 불러오기
   * @returns {Promise<void>}
   */
  async function getData() {
    try {
      const {data, status} = await api.get(`healthinfo/post/${cat_id}`);
      if(status === 200) {

        setData(data);
        data.health_food.map(item => {
          setFoodArray(prevState => {
            // 이미 값이 배열에 있는지 확인합니다.
            if (!prevState.includes(item.food_idx)) {
              // 값이 배열에 없는 경우에만 값 추가
              return [...prevState, item.food_idx];
            }
            // 값이 이미 있는 경우 이전 배열을 반환 (변경 없음)
            return prevState;
          })
        })

        data.health_func_food.map(item => {
          setFuncFoodArray(prevState => {
            // 이미 값이 배열에 있는지 확인합니다.
            if (!prevState.includes(item.food_idx)) {
              // 값이 배열에 없는 경우에만 값 추가
              return [...prevState, item.food_idx];
            }
            // 값이 이미 있는 경우 이전 배열을 반환 (변경 없음)
            return prevState;
          })
        })
        data.rec_exercise.map(item => {
          setExArray(prevState => {
            // 이미 값이 배열에 있는지 확인합니다.
            if (!prevState.includes(item.ex_idx)) {
              // 값이 배열에 없는 경우에만 값 추가
              return [...prevState, item.ex_idx];
            }
            // 값이 이미 있는 경우 이전 배열을 반환 (변경 없음)
            return prevState;
          })
        })
        data.rec_recipe.map(item => {
          setRecipeArray(prevState => {
            // 이미 값이 배열에 있는지 확인합니다.
            if (!prevState.includes(item.rec_idx)) {
              // 값이 배열에 없는 경우에만 값 추가
              return [...prevState, item.rec_idx];
            }
            // 값이 이미 있는 경우 이전 배열을 반환 (변경 없음)
            return prevState;
          })
          recipeArray.push(item.rec_idx)
        })
        setFormData({
          upd_user: userData.id,
          info_idx: data.info_idx,
          cat_idx: data.cat_idx,
          disease_cause: data.disease_cause,
          disease_define: data.disease_define,
          disease_name: data.disease_name,
          disease_symp: data.disease_symp,
          health_food: foodArray,
          health_func_food: funcFoodArray,
          rec_exercise: exArray,
          rec_recipe: recipeArray,
        })
        const funcfood_response = await api.get('healthinfo/funcfood/list/all')
        const food_response = await api.get('healthinfo/food/list/all')
        const exercise_response = await api.get('healthinfo/exercise/list/all')
        const recipe_response = await api.get('healthinfo/recipe/list/all')
        setFuncFoodList(funcfood_response.data);
        setFoodList(food_response.data);
        setExerciseList(exercise_response.data);
        setRecipeList(recipe_response.data);
      }

    } catch (e) {
      try {
        const funcfood_response = await api.get('healthinfo/funcfood/list/all')
        const food_response = await api.get('healthinfo/food/list/all')
        const exercise_response = await api.get('healthinfo/exercise/list/all')
        const recipe_response = await api.get('healthinfo/recipe/list/all')
        const catitem = await api.get(`healthinfo/category/${cat_id}`)
        setFuncFoodList(funcfood_response.data);
        setFoodList(food_response.data);
        setExerciseList(exercise_response.data);
        setRecipeList(recipe_response.data);
        setData({
          upd_user: userData.id,
          info_idx: cat_id,
          cat_idx: 0,
          disease_cause: 0,
          disease_define:0,
          disease_name: catitem.data[0].cat_title,
          disease_symp: 0,
          health_food: foodArray,
          health_func_food: funcFoodArray,
          rec_exercise: exArray,
          rec_recipe: recipeArray,
        });
        setFormData({
          upd_user: userData.id,
          info_idx: 0,
          cat_idx: Number(cat_id),
          disease_cause: 0,
          disease_define:0,
          disease_name: catitem.data[0].cat_title,
          disease_symp: 0,
          health_food: foodArray,
          health_func_food: funcFoodArray,
          rec_exercise: exArray,
          rec_recipe: recipeArray,
        })
      }catch (e) {
        alert('에러 발생 관리자에게 문의주세요.')
        console.log(e);
      }

    }
  }

///
  /**
   * 수정하기 함수
   * @returns {Promise<void>}
   */
  async function editData() {
    console.log(formData);
    const editData = {
      ...formData,
      health_food: foodArray,
      health_func_food: funcFoodArray,
      rec_exercise: exArray,
      rec_recipe: recipeArray,
    }
  console.log(editData);
    if(editData.info_idx !== 0) {
      try {
        const {status} = await api.put('healthinfo/post', editData)
        if (status === 200) {
          alert('수정 성공')
          goBack();
        } else {
          alert(`수정 실패! \n
                  error_code : ${status}`)
        }
      } catch (e) {
        alert('수정중 에러 발생')
      }
    }else {
      delete editData.info_idx
      const {status} = await api.post('healthinfo/post', editData)
      if (status === 200) {
        alert('등록 성공')
        goBack();
      } else {
        alert(`등록 실패! \n
                  error_code : ${status}`)
      }
    }

  }

  /**
   *
   * @param e event
   * @param setfunc callback
   */
  function handleCheckboxChange(e, setfunc) {
    const {value, checked} = e.target;
    const foodIndex = parseInt(value, 10);
    setfunc(prevArray => {
      if (checked) {
        // 체크박스가 선택된 경우 배열에 값 추가
        return [...prevArray, foodIndex];
      } else {
        // 체크박스가 선택 해제된 경우 배열에서 값 제거
        return prevArray.filter(item => item !== foodIndex);
      }
    })
  }

  if (!data) {
    return (
      <>
        <div>loading....
          <button onClick={goBack}>뒤로가기</button>
        </div>
      </>
    )
  }
  return (
    <section className='healthInfoEdit-section'>
      <button onClick={goBack}>뒤로가기</button>
      <DefaultTable title={"건강정보 상세 설정"} tableClass='healthEdit-table'>
        <tbody>
        <tr>
          <th className='w200'>병명</th>
          <th>{data.disease_name}</th>
        </tr>
        <tr>
          <th>정의</th>
          <td>
            <div className="table-wrap">
              <ReactQuill className={'table-text'} defaultValue={data.disease_define}
                          onChange={(value) => {
                            setFormData({...formData, disease_define: value})
                          }}/>
            </div>
          </td>
        </tr>
        <tr>
          <th>원인</th>
          <td>
            <div className="table-wrap">
              <ReactQuill className={'table-text'} defaultValue={data.disease_cause}
                          onChange={(value) => {
                            setFormData({...formData, disease_cause: value})
                          }}/>
            </div>
          </td>
        </tr>
        <tr>
          <th>증상</th>
          <td>
            <div className="table-wrap">
              <ReactQuill className={'table-text'} defaultValue={data.disease_symp}
                          onChange={(value) => {
                            setFormData({...formData, disease_symp: value})
                          }}/>
            </div>
          </td>
        </tr>
        </tbody>
      </DefaultTable>
      <div className='H20'></div>
      <DefaultTable title='추가설정'>
        <thead>
        <tr>
          <th>건강기능식품</th>
          <th>건강식품</th>
          <th>추천레시피</th>
          <th>추천운동</th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td className='text-left v-top'>
            <div className='inflex-col P10'>
              {funcFoodList && funcFoodList.map((row, idx) => (
                <label key={row.food_idx}>
                  <input
                    type='checkbox'
                    name='health_func_food'
                    value={row.food_idx}
                    defaultChecked={funcFoodArray.includes(row.food_idx)}
                    onChange={(e) => {
                      handleCheckboxChange(e, setFuncFoodArray)
                    }}
                  />
                  <span>{row.food_name}</span>
                </label>
              ))}
            </div>
          </td>
          <td className='text-left v-top'>
            <div className='inflex-col P10'>
              {foodList && foodList.map(row => (
                <label key={row.food_idx}>
                  <input
                    type='checkbox'
                    value={row.food_idx}
                    defaultChecked={foodArray.includes(row.food_idx)}
                    onChange={(e) => {
                      handleCheckboxChange(e, setFoodArray)
                    }}
                  />
                  <span>{row.food_name}</span>
                </label>
              ))}
            </div>
          </td>
          <td className='text-left v-top'>
            <div className='inflex-col P10'>
              {recipeList && recipeList.map(row => (
                <label key={row.rec_idx}>
                  <input
                    type='checkbox'
                    value={row.rec_idx}
                    defaultChecked={recipeArray.includes(row.rec_idx)}
                    onChange={(e) => {
                      handleCheckboxChange(e, setRecipeArray)
                    }}
                  />
                  <span>{row.rec_name}</span>
                </label>
              ))}
            </div>
          </td>
          <td className='text-left v-top'>
            <div className='inflex-col P10'>
              {exerciseList && exerciseList.map(row => (
                <label key={row.ex_idx}>
                  <input
                    type='checkbox'
                    value={row.ex_idx}
                    defaultChecked={exArray.includes(row.ex_idx)}
                    onChange={(e) => {
                      handleCheckboxChange(e, setExArray)
                    }}
                  />
                  <span>{row.ex_name}</span>
                </label>
              ))}
            </div>
          </td>
        </tr>
        </tbody>
      </DefaultTable>
      <div className='btn-wrap'>
        <button className={'default-btn'} onClick={editData}>저장하기</button>
      </div>
    </section>
  );
}


