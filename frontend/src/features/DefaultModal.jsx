import React from 'react'
import {MdClose} from "react-icons/md";

export default function DefaultModal(props) {
  const {setView, children, api, width, height} = props;

  return (
    <div className="DefaultModal-outter">
      <div className="DefaultModal-inner" style={{
        width : width ?? '',
        height : height ?? ''
      }}>
        <button className="close-btn" onClick={() => {
          setView(false)
        }}><MdClose/></button>
        <div className={"children"}>
          {children}
        </div>
        <div className="btn-wrap">
          <button className="success btn" onClick={() => {
            api ? api() : null
          }}>OK</button>
          <button className="cancle btn" onClick={() => {
            setView(false)
          }}>CANCLE</button>
        </div>
      </div>
    </div>
  )
}
