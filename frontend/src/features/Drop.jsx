import React, { useState } from "react";
import { NavLink } from "react-router-dom";

function Dropdown({ actived, activeToggle, options }) {
  const handleClick = () => {
    activeToggle((actived) => {
      return actived === options["title"] ? null : options["title"];
    });
  };

  return (
    <div className="dropdown">
      <button onClick={handleClick}>{options["title"]}</button>
      {actived === options["title"] && (
        <ul className="dropdown-menu">
          {options["menus"].map((option, index) => (
            <li className={"dropdown-list"} key={index} onClick={handleClick}>
              <NavLink to={option.link}>{option.name}</NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dropdown;
