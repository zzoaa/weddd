import React from 'react'
import {MdClose} from "react-icons/md";

export default function AddressModal(props) {
  const {setView, children, width, height} = props;

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
      </div>
    </div>
  )
}
