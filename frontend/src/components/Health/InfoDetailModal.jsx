import React, {useEffect, useState} from 'react';
import {MdClose, MdEditSquare} from "react-icons/md";
import api from "../../api/axios.js";
import {useSelector} from "react-redux";

function InfoDetailModal(props) {

    const [data, setData] = useState(null);
    const userData = useSelector((state) => state.user.userData)
    const [formOn, setFormOn] = useState(false)
    const [formData, setFormData] = useState({
        "cat_idx": props.data.idx,
        "disease_name": "병명",
        "disease_define": "정의",
        "disease_cause": "원인",
        "disease_symp": "증상",
    });
    const [btnName, setBtnName] = useState('수정하기')

    useEffect(() => {
        console.log(props, 'modalProp')

        async function fetch() {
            await api.get(`healthinfo/post/${props.data.idx}`).then(res => {
                console.log(res);
                setData(res.data)
            }).catch(e => {
                console.log(e.response.data.error)
                if (e.response.data.error == '조회 할 게시글을 찾을 수 없습니다.') {
                    setData(
                        {
                            "info_idx": props.data.idx,
                            "info_status": "Y",
                            "disease_name": "병명",
                            "disease_define": "정의",
                            "disease_cause": "원인",
                            "disease_symp": "증상",
                        },
                    )
                    setBtnName('등록하기')
                    setFormOn(true)

                }
            })

        }

        fetch();

    }, []);

    useEffect(() => {
        function fetch() {
            api.get(`healthinfo/post/${props.data.idx}`).then(res => {
                console.log(res, 'hooo');
                setFormData({
                    ...formData,
                    "info_idx": res.data.info_idx,
                    "disease_name": res.data.disease_name,
                    "disease_define": res.data.disease_define,
                    "disease_cause": res.data.disease_cause,
                    "disease_symp": res.data.disease_symp,
                    "upd_user": userData.id
                })
                setData(res.data)
            }).catch(() => {
                console.log('error01')
                api.get(`healthinfo/category/${props.data.idx}`).then(res => {

                    // console.log(res);
                    setFormData({
                        ...formData,
                        'disease_name': res.data.cat_title,
                        "reg_user": userData.id
                    })

                }).catch(e => {
                    console.error('에러 발생 ', e)
                })
            })

        }

        fetch();

    }, [formOn]);

    function inputChage(e, formName) {
        // console.log(e.target.value)
        setFormData({
            ...formData,
            [formName]: e.target.value
        })

    }

    async function submit(e) {
        e.preventDefault();
        if (btnName === '등록하기') {
            await api.post('healthinfo/post', formData).then(res => {
                // console.log(res)
            }).catch(e => console.error('등록중 에러', e))

        } else {
            await api.put('healthinfo/post', formData).then(res => console.log(res)).catch(e => {
                console.log('수정중 에러', e)

            })
        }

        setFormOn(false)
    }


        if (!data) {
            return (
                <div className="modal-outter">
                    <div className="modal-inner">
                        <button className="close-btn"><MdClose/></button>
                        <div>통신중 ....</div>
                    </div>
                </div>
            )
        }

        return (
            <div className="modal-outter">
                <div className="modal-inner">
                    <button className="close-btn" onClick={() => {
                        props.setInfoModal({idx: 0, active: false})
                    }}><MdClose/></button>
                    {formOn && <form onSubmit={submit}>
                        <label>
                            <input readOnly={true} className={'main-title'} value={`병명 : ${formData.disease_name}`}/>
                            <button className={'edit-icon'} type={'submit'}>{btnName}</button>
                        </label>
                        <label>
                            <div className={'title'}>정의</div>
                            <textarea type={'text'} className={'dec textarea'} onChange={(e) => {
                                inputChage(e, 'disease_define')
                            }} value={formData.disease_define}/>
                        </label>
                        <label>
                            <div className={'title'}>원인</div>
                            <textarea type={'text'} className={'dec textarea'} onChange={(e) => {
                                inputChage(e, 'disease_cause')
                            }} value={formData.disease_cause}/>
                        </label>
                        <label>
                            <div className={'title'}>증상</div>
                            <textarea type={'text'} className={'dec textarea'} onChange={(e) => {
                                inputChage(e, 'disease_symp')
                            }} value={formData.disease_symp}/>
                        </label>
                    </form>}
                    {!formOn &&
                        <>
                            <div className={'main-title'}>병명 : {data.disease_name}</div>
                            <button className={'edit-icon'} type={'button'} onClick={() => {
                                setFormOn(true)
                            }}>{btnName}
                            </button>
                            <div className={'title'}>정의</div>
                            <div className={'dec'}>{data.disease_define}</div>
                            <div className={'title'}>원인</div>
                            <div className={'dec'}>{data.disease_cause}</div>
                            <div className={'title'}>증상</div>
                            <div className={'dec'}>{data.disease_symp}</div>
                        </>
                    }
                </div>
            </div>
        );
    }

    export default InfoDetailModal;
