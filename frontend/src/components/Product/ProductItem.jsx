import React, {useEffect, useState} from "react";
import api, {baseURL} from "../../api/axios";
import {useNavigate} from "react-router-dom";
import DefaultModal from "../../features/DefaultModal.jsx";
import Alert from "../../features/Alert.jsx";
import Pagination from '@mui/material/Pagination';
import TabList from '@mui/lab/TabList';
import TabContext from '@mui/lab/TabContext';
import Tab from '@mui/material/Tab';

const ProductItem = () => {
    const [data, setData] = useState(null);
    const [addModal, setAddModal] = useState({
        active: false,
        idx: 0,
    })
    const navigate = useNavigate();
    const [nav, setNav] = useState({
        page: 1,
        pagerow: 10,
        count : 0
    })
    const [delAlert, setDelAlet] = useState({
        active: false,
        idx: 0,
    })
    const [copyAlert, setCopyAlert] = useState({
        active: false,
        idx : 0
    })
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/products/list?page=${nav.page}&pagerow=${nav.pagerow}`);
                // console.log(response);
                const tmpPage = Math.floor(response.data.totalCount / nav.pagerow)
                const tmpCount = response.data.totalCount % nav.pagerow > 0 ? 1 : 0
                setNav({
                    ...nav,
                    count: tmpPage + tmpCount
                })
                setData(response.data);
            } catch (error) {
                console.error("API 요청 중 에러 발생:", error);
            }
        };
        fetchData();
    },[])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(`/products/list?page=${nav.page}&pagerow=${nav.pagerow}`);
                // console.log(response);

                setData(response.data);
            } catch (error) {
                console.error("API 요청 중 에러 발생:", error);
            }
        };
        fetchData();

    }, [delAlert, nav]);

    function formatNumberWithCommas(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }


    async function addItemIndex() {
        await api.post('products/add').then(res => {
            // console.log(res)
            setAddModal({
                ...addModal,
                idx: res.data.prd_idx[0],
                active: false
            })
            sessionStorage.setItem('prd_idx', String(res.data.prd_idx[0]))

            navigate(`/product/item_write/${res.data.prd_idx[0]}`)
        }).catch(err => {
            console.error('상품 등록중 에러발생', err)
        })
    }

    async function delApi() {
        const formData = {
            "prd_idx": delAlert.idx
        }
        try {
            const res = await api.put('products/del', formData)
            console.log(res);
            setDelAlet({
                ...delAlert,
                active: false,
                idx: 0,
            })
        } catch (e) {
            alert('삭제 실패')
            console.log(e)
        }
    }

    async function copyItem() {
        try {
            const {status, data} = await api.post('products/copy', {
                prd_idx : copyAlert.idx
            })
            if(status === 200) {
                setCopyAlert({
                    active: false,
                    idx: 0
                })
                alert('복사 성공')
                navigate(`/product/item_write/${data.new_idx}`)
            }
        }catch (e) {
            alert('상품 복사 실패')
            console.error(e);
        }
    }

    return data ? (
        <>
            {addModal.active && <DefaultModal setView={setAddModal} width={'300px'} height={'250px'} api={addItemIndex}>
                <div style={{display: "flex", flexDirection: 'column', height: '100%', justifyContent: 'center'}}>
                    상품을 등록하시겠습니까?
                </div>
            </DefaultModal>}
            <div className="prudct-item-contianer">
                <div className="product-item-list-top">
                    <div className="prduct-item-count">
                        상품 관리 (총 검색 수 {data.totalCount})
                    </div>
                    <div className="prduct-item-new-button" onClick={() => {
                        setAddModal({...addModal, active: true})
                    }}>+ 신규 상품 등록
                    </div>
                </div>

                <form className="product-item-list-wrap">
                    <div className="product-item-list-head">
                        <div className="product-item-head w5"></div>
                        <div className="product-item-head w8">상품 코드</div>
                        <div className="product-item-head w10">상품 분류</div>
                        <div className="product-item-head w25">상품 명</div>
                        <div className="product-item-head w7">정가</div>
                        <div className="product-item-head w7">판매가</div>
                        <div className="product-item-head w5">현재 재고</div>
                        <div className="product-item-head w5">표시 상태</div>
                        <div className="product-item-head w5">판매 상태</div>
                        <div className="product-item-head w5">조회수</div>
                        <div className="product-item-head w5">판매수</div>
                        <div className="product-item-head w5">찜</div>
                        <div className="product-item-head w10">관리</div>
                    </div>
                    {data.products.map((el, idx) => {
                        // console.log(el);
                        return (
                            <div key={idx} className="product-item-list">
                                <div className="product-item w5">
                                    <div className='img-wrap'>
                                        {el.thumbnail && <img src={baseURL + el.thumbnail[0].att_filepath.slice(1)}
                                                              alt={el.prd_name}/>}
                                    </div>
                                </div>
                                <div className="product-item w8 center">{el.prd_idx}</div>
                                <div className="product-item w10">{el.cat_title}</div>
                                <div className="product-item w25">{el.prd_name}</div>
                                <div className="product-item w7 right">
                                    ￦{formatNumberWithCommas(el.prd_cust_price)}
                                </div>
                                <div className="product-item w7 right">
                                    ￦{formatNumberWithCommas(el.prd_price)}
                                </div>
                                <div className="product-item w5 sright">
                                    {formatNumberWithCommas(el.prd_stock_qty)}
                                </div>
                                <div className="product-item center w5">
                                    {el.prd_status === "Y" ? (
                                        <label className="label label-success">표시중</label>

                                    ) : el.prd_status === "N" ? (
                                        <label className="label label-false">삭제</label>
                                    ) : el.prd_status === "H" ? (
                                        <label className="label label-false">숨김</label>
                                    ) : (
                                        <label className="label label-temporary">임시등록</label>
                                    )}
                                </div>
                                <div className="product-item w5 center">
                                    {el.prd_sell_status === "Y" ? (
                                        <label className="label label-success">판매중</label>
                                    ) : el.prd_sell_status === "O" ? (
                                        <label className="label label-false">품절</label>
                                    ) : (
                                        <label className="label label-false">판매중지</label>
                                    )}
                                </div>
                                <div className="product-item w5 right">{el.prd_hit}</div>
                                <div className="product-item w5 right">{el.prd_sell_count}</div>
                                <div className="product-item w5 right">{el.prd_wish_count}</div>
                                <div className="product-item w10">
                                    <div className="product-item-setting-btn-wrap">
                                        <div className="product-item-setting-btn" onClick={() => {
                                            navigate(`/product/item_write/${el.prd_idx}`)
                                        }}>수정
                                        </div>
                                        <div className="product-item-setting-btn" onClick={() => {
                                            setCopyAlert({
                                                ...copyAlert,
                                                active: true,
                                                idx: el.prd_idx
                                            })
                                        }}>복사
                                        </div>
                                        <div className="product-item-setting-btn" onClick={() => {
                                            setDelAlet({
                                                ...delAlert,
                                                active: true,
                                                idx: el.prd_idx,
                                            })
                                        }}>삭제
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </form>
            </div>
            <div className='pagerow'>
                <TabContext value={String(nav.pagerow)}>

                    <TabList className={'pagerow-tab'} onChange={(e, value) => {
                        setNav({
                            ...nav,
                            pagerow: Number(value)
                        })
                    }}>
                        <Tab className={'tab'} label="5" value="5"/>
                        <Tab className={'tab'} label="10" value="10"/>
                        <Tab className={'tab'} label="15" value="15"/>
                    </TabList>
                </TabContext>
            </div>
            <Pagination className='pagination' count={nav.count} size="small"
                        variant="outlined" color="primary" page={nav.page} onChange={(e, value) => {
                setNav({
                    ...nav,
                    page: value
                })
            }}/>
            {delAlert.active && <Alert setView={setDelAlet} delapi={delApi}>
                삭제 하시겠습니까?
            </Alert>}
            {copyAlert.active && <Alert setView={setCopyAlert} delapi={copyItem}>
                복사 하시겠습니까?
            </Alert>}
        </>
    ) : null;


};
export default ProductItem;
