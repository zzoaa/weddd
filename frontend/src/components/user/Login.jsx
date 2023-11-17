import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useDispatch } from "react-redux";
import { login } from "../../store/userSlice";

export default function Login() {
  const [values, setValues] = useState({
    id: "",
    password: "",
  });
  const navigate = useNavigate();
  const dispath = useDispatch();

  const handleChange = (e) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const authChk = await api.post(
        "members/auth/check",
        {
          loginId: values.id,
          loginPass: values.password,
        }
      );
      if (authChk.status === 200 && authChk.data.mem_auth >= 7){
        const response = await api.post(
          "members/authorize",
          {
            loginId: values.id,
            loginPass: values.password,
          }
        );
  
        if (response.status === 200) {
          // 로그인 성공
          // console.log(response.data);
  
          dispath(
            login({
              id: response.data.userData.id,
              name: response.data.userData.name,
              email: "",
            })
          );
          sessionStorage.setItem("at", response.data.accessToken);
          sessionStorage.setItem("rt", response.data.refreshToken);
          sessionStorage.setItem("ud", JSON.stringify(response.data.userData));
  
          navigate("/");
        } else {
          // 로그인 실패
          alert(response.error);
          // console.log("로그인 실패:", response.data);
        }
      }
    } catch (error) {
      console.error("로그인 중 에러 발생:", error);
    }
  };

  return (
    <div className="form-warp">
      <form className="form" onSubmit={handleSubmit}>
        <label>
          <span>ID</span>
          <input
            type="text"
            name="id"
            value={values.id}
            onChange={handleChange}
            placeholder="ID를 입력해주세요."
          />
        </label>
        <label>
          <span>PW</span>
          <input
            type="password" // 비밀번호 필드이므로 type을 "password"로 변경
            name="password"
            value={values.password}
            onChange={handleChange}
            placeholder="PassWord를 입력해주세요."
          />
        </label>
        <button type="submit">로그인</button>
      </form>
    </div>
  );
}
