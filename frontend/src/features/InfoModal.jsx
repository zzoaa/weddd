import React, {useState} from 'react';
import {Button} from "@mui/material";
import {MdClose} from "react-icons/md";
import "../assets/css/features/InfoModal.css"
/**
 *
 * @param children
 * @param setView
 * @param width {String}
 * @param height {String}
 * @param api {Function}
 * @returns {Element}
 * @constructor
 */
export default function InfoModal({children, setView, width, height, api}) {

  return (
    <div className='info-modal-back'>
      <div className="info-modal" style={{
        width : width ?? '',
        height : height ?? ''
      }}>
        <div className='btn-wrap end mb16'>
          <button className='info-btn' onClick={ () => {
            setView((prev) => {
              return {
                ...prev,
                'active': false
              }
            })
          }}>
            <MdClose />
          </button>
        </div>
        <div>
          {children}
        </div>
      <div className="btn-wrap center mt16">
        <Button className='mr16' variant="contained" color="primary" size="small" onClick={() => {
          api();
        }}>확인</Button>
        <Button variant="contained" color="warning" size="small" onClick={() => {
          setView((prev) => {
            return {
              ...prev,
              'active': false
            }
          })
        }}>취소</Button>
      </div>
      </div>
    </div>
  );
}


