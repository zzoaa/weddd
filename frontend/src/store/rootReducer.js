import { combineReducers } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import productReducer from './productSlice';
// import boardReducer from './boardSlice';

const rootReducer = combineReducers({
  user: userReducer,
  product: productReducer,
  // board: boardReducer,
});

export default rootReducer;
