import React, {useEffect, useState} from 'react';
import api from "../../api/axios.js";
import {Table, TableBody, TableCell, TableHead, TableRow} from "@mui/material";


export default function SubscribeList() {
  const [subData, setSubData] = useState(null)
  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    try {
      const {status,data} = await api.get('shop/sub/list/all')
      if(status === 200) {
        console.log(data);
        setSubData(data);
      }
    }catch (e) {
      alert('불러오기 실패')
      console.error(e)
    }
  }

  if(!subData) return <div>Loading.....</div>

  return (
    <section className={'subscrib-section'}>
      <h1 className='title'>구독 관리</h1>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell size='medium' align='center' className='list-th'>구독번호</TableCell>
            <TableCell size='medium' align='center' className='list-th'>주문번호</TableCell>
            <TableCell size='medium' align='center' className='list-th'>주문이름</TableCell>
            <TableCell size='medium' align='center' className='list-th'>주문자</TableCell>
            <TableCell size='medium' align='center' className='list-th'>금액</TableCell>
            <TableCell size='medium' align='center' className='list-th'>구독날짜</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subData.map(row => (
            <TableRow key={row.sub_idx}>
              <TableCell size='small' align='center' className='list-td'>{row.sub_idx}</TableCell>
              <TableCell size='small' align='center' className='list-td'>{row.od_id}</TableCell>
              <TableCell size='small' align='center' className='list-td'>{row.od_title}</TableCell>
              <TableCell size='small' align='center' className='list-td'>{row.mem_nickname}</TableCell>
              <TableCell size='small' align='center' className='list-td'>{row.price}</TableCell>
              <TableCell size='small' align='center' className='list-td'>{row.reg_datetime.slice(0, 10)}</TableCell>
            </TableRow>
          ))}

        </TableBody>
      </Table>
    </section>
  );
}


