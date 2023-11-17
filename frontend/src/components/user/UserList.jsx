import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {BiEdit} from "react-icons/bi";
import DefaultTable from "../../features/DefaultTable.jsx";
import UserEdit from "./UserEdit.jsx";

export default function UserList() {
  const [list, setList] = useState([]);
  const [editModal, setEditModal] = useState(false)
  const [editMem, setEditMem] = useState(null);
  async function _getList() {
    return await api.get('members/list/all');
  }

  useEffect(() => {
    _getList().then(res => {
      setList(res.data);
    });
  }, [editModal]);

  return (
    <div className='user-list'>
      <DefaultTable title='UserList'>
        <thead>
          <tr>
            <th>순번</th>
            <th>상태</th>
            <th>권한</th>
            <th>등급</th>
            <th>아이디</th>
            <th>닉네임</th>
            <th>E-mail</th>

            <th>email 수신동의</th>
            <th>sms 수신동의</th>
            <th>가입일시</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
        {list.map((user, index) => (
          <tr key={index}>
            <td>{index}</td>
            <td>{user.mem_status == 'Y' ? '정상' : '비활성화'}</td>
            <td>{user.mem_auth}</td>
            <td>{user.lev_idx}</td>
            <td>{user.mem_userid}</td>
            <td>{user.mem_nickname}</td>
            <td>{user.mem_email}</td>

            <td>{user.mem_recv_email}</td>
            <td>{user.mem_recv_sms}</td>
            <td>{user.mem_regtime.slice(0,10)}</td>
            <td>
              <button onClick={() => {
                setEditModal(true)
                setEditMem(user);
              }}>
                <BiEdit />
              </button>
            </td>
          </tr>
        ))}
        </tbody>
      </DefaultTable>
      {editModal && <UserEdit setView={setEditModal} userdata={editMem}/>}
    </div>
  );
}
