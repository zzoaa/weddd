import React from 'react';

export default function DefaultTable({title, children, tableClass}) {
  return (
    <div className='table-widget'>
      <h2 className='table-title'>{title}</h2>
    <table className={tableClass}>
      {children}
    </table>
    </div>
  );
}


