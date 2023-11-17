import React from 'react'
import {MdClose} from "react-icons/md";

export default function Alert(props) {
  const {setView, children, delapi} = props;

  return (
    <div className="alert-outter">
      <div className="alert-inner">
        <button className="close-btn" onClick={() => {
          setView((prev) => {
            return {
              ...prev,
              'active': false
            }
          })
        }}><MdClose/></button>
        <div className={"children"}>
        {children}
        </div>
        <div className="btn-wrap">
          <button className="success btn" onClick={() => {
            delapi()
          }}>OK</button>
          <button className="cancle btn" onClick={() => {
            setView((prev) => {
              return {
                ...prev,
                'active': false
              }
            })
          }}>CANCLE</button>
        </div>
      </div>
    </div>
  )
}
