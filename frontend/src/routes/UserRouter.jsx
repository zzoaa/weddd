// HealthRouter.jsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UserList from '../components/user/UserList';
import RankList from "../components/user/rank/RankList.jsx";


function UserRouter() {

    return (
        <Routes>
            <Route path="list" element={<UserList />} />
          <Route path="rank" element={<RankList />}></Route>
        </Routes>
    );
}

export default UserRouter;
