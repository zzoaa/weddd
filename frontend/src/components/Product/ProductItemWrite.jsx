import React, {useEffect, useMemo, useRef, useState} from "react";
import ReactQuill from "react-quill";

import api, {baseURL} from "../../api/axios.js";
import {useNavigate, useParams} from "react-router-dom";
import 'react-quill/dist/quill.snow.css';
import {BsTrash} from "react-icons/bs";
import Alert from "../../features/Alert.jsx";


const ProductItemWrite = () => {
    const [inputs, setInputs] = useState(null);
    const reactQuillRef = useRef(null);
    const navigate = useNavigate();
    /**
     * quill 라이브러리 옵션
     * 이미지 처리는 useMemo를 사용하지 않으면 에러가 발생함
     * @type {{toolbar: ([{header: (number|boolean)[]}]|string[])[]}}
     */
    const quillModule = useMemo(() => {
        return {
            toolbar: {
                container: [
                    [{header: [1, 2, 3, 4, 5, false]}],
                    ["bold", "underline"],
                    ["image"],
                ],
                handlers: {
                    image: imageHandler,
                },
            }
        }
    }, [])

    async function imageHandler() {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();
        input.addEventListener("change", async () => {
            const file = input.files?.[0];
            const formData = new FormData();
            formData.append("files", file);
            try {
                const res = await api.post(`products/addAttachment`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                console.log(res);
                const editor = reactQuillRef.current.getEditor();
                const range = editor.getSelection();
                // 가져온 위치에 이미지를 삽입한다
                editor.insertEmbed(range.index, "image", baseURL + res.data[0].path.slice(1));
                // 성공적으로 수정되었을 때의 로직 (예: 알림 표시)
            } catch (error) {
                console.error('파일 업로드 실패', error);
                // 실패했을 때의 로직 (예: 에러 메시지 표시)
            }
        })
    }

    //상품 이미지 배열
    const [images, setImages] = useState(null);
    const [thumbImg, setThumbImg] = useState(null);
    // 카테고리 선택 이미지 배열
    const [categoryList, setCategoryList] = useState(null)
    // Url에서 상품 아이디 가져오기
    const {prd_id} = useParams();
    const [imgDelAlert, setImgDelAlert] = useState({
        active: false,
        idx: 0,
    })
    console.log('hoho')
    useEffect(() => {
        getData()

    }, [imgDelAlert]);
    const handleImageChange = (e) => {
        const selectedImages = Array.from(e.target.files);
        console.log(selectedImages)
        imageUploading(selectedImages);
    };
    const changeInput = (e) => {
        const {name, value} = e.target; //비구조화 할당으로 e.target에서 값 추출
        setInputs({
            ...inputs, //기존의 input객체 복사
            [name]: value, //변경되는 부분 반영
        });
    };

    function onSubmit(e) {
        e.preventDefault();
        const formData = inputs;
        formData.prd_item_options = JSON.stringify(formData.prd_item_options)
        // for(const key in thumbImg) {
        //     formData.prd_thumbnail = Number(key);
        // }
        // Object.entries(thumbImg).map(([key, value]) => {
        //     formData.prd_thumbnail = key;
        // })
        thumbImg.map(item => {
            formData.prd_thumbnail = item.att_idx
        })

        api.put('products/write', formData).then(res => {
            console.log(res)
            alert('수정에 성공했습니다.!')
            navigate(-1)
        }).catch(err => console.error('저장중 에러 발생', err))
    }

    if (!inputs) {
        return (
            <div>Loading.......</div>
        )
    }
    return (<div className="product-item-write-container">
        <form className='product-item-write-form' onSubmit={onSubmit}>
            <div className="product-item-write-title">상품 정보 입력</div>
            <div className="product-item-write-wrap">
                <div className="product-item-write">
                    <div className="product-item-write-desc">상품 기본 정보</div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">상품코드</div>
                        <div className="product-item-write-right">
                            <input
                                name="prd_idx"
                                readOnly="readonly"
                                type="text"
                                className="form-control"
                                value={inputs.prd_idx}
                                onChange={changeInput}
                            />
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">상품 분류</div>
                        <div className="product-item-write-right">
                            <select
                                className="form-control"
                                onChange={(e) => {
                                    setInputs({
                                        ...inputs, cat_id: Number(e.target.value)
                                    })
                                }}
                                value={inputs.cat_id}
                            >
                                <option value="0">상품 분류 선택</option>
                                {categoryList && categoryList.map(item => {
                                    return (<option key={item.cat_id} value={item.cat_id}>{item.cat_title}</option>)
                                })}
                            </select>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">상품명</div>
                        <div className="product-item-write-right">
                            <input
                                name="prd_name"
                                type="text"
                                className="form-control"
                                defaultValue={inputs.prd_name}
                                onChange={(e) => {
                                    setInputs({
                                        ...inputs, prd_name: e.target.value
                                    })
                                }}
                            />
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">기본 설명</div>
                        <div className="product-item-write-right">
                            <input
                                type="text"
                                name="prd_summary"
                                className="form-control"
                                value={inputs.prd_summary}
                                onChange={(e) => {
                                    setInputs({
                                        ...inputs, prd_summary: e.target.value
                                    })
                                }}
                            />
                            <div className="product-item-write-sub">
                                상품에 대한 간략한 설명을 입력하세요.
                            </div>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">표시상태</div>
                        <div className="product-item-write-right">
                            <label className="toggle-box">
                                <input
                                    type="radio"
                                    name="prd_status"
                                    defaultValue={inputs.prd_status}
                                    checked={inputs.prd_status === "Y"}
                                    onChange={() => {
                                        setInputs({
                                            ...inputs, prd_status: 'Y'
                                        })
                                    }}
                                />
                                <span className="checkbox-label">표시중</span>
                            </label>
                            <label className="toggle-box">
                                <input
                                    type="radio"
                                    name="prd_status"
                                    defaultValue={inputs.prd_status}
                                    checked={inputs.prd_status === "N"}
                                    onChange={() => {
                                        setInputs({
                                            ...inputs, prd_status: 'N'
                                        })
                                    }}
                                />
                                <span className="checkbox-label">감춤</span>
                            </label>
                            <div className="product-item-write-sub">
                                상품의 표시상태를 설정합니다. [감춤]으로 설정할 경우 사용자의
                                페이지에서는 노출되지 않습니다.
                            </div>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">판매상태</div>
                        <div className="product-item-write-right">
                            <label className="toggle-box">
                                <input
                                    type="radio"
                                    name="prd_sell_status"
                                    defaultValue='Y'
                                    checked={inputs.prd_sell_status === "Y"}
                                    onChange={() => {
                                        setInputs({
                                            ...inputs, prd_sell_status: 'Y'
                                        })
                                    }}
                                />
                                <span className="checkbox-label">판매중</span>
                            </label>
                            <label className="toggle-box">
                                <input
                                    type="radio"
                                    name="prd_sell_status"
                                    defaultValue='O'
                                    checked={inputs.prd_sell_status === "O"}
                                    onChange={() => {
                                        setInputs({
                                            ...inputs, prd_sell_status: 'O'
                                        })
                                    }}
                                />
                                <span className="checkbox-label">품절</span>
                            </label>
                            <label className="toggle-box">
                                <input
                                    type="radio"
                                    name="prd_sell_status"
                                    defaultValue='D'
                                    checked={inputs.prd_sell_status === "D"}
                                    onChange={() => {
                                        setInputs({
                                            ...inputs, prd_sell_status: 'D'
                                        })
                                    }}
                                />
                                <span className="checkbox-label">일시판매중단</span>
                            </label>
                            <div className="product-item-write-sub">
                                상품의 표시상태를 설정합니다. [감춤]으로 설정할 경우 사용자의
                                페이지에서는 노출되지 않습니다.
                            </div>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">상품 판매가</div>
                        <div className="product-item-write-right">
                            <input
                                type="text"
                                name="prd_price"
                                className="form-control"
                                defaultValue={inputs.prd_price}
                                onChange={(e) => {
                                    setInputs({
                                        ...inputs, prd_price: Number(e.target.value)
                                    })
                                }}
                            />
                        </div>
                        <div className="product-item-write-left line">상품 시중가</div>
                        <div className="product-item-write-right">
                            <input
                                type="text"
                                name="prd_cust_price"
                                className="form-control"
                                defaultValue={inputs.prd_cust_price}
                                onChange={(e) => {
                                    setInputs({
                                        ...inputs, prd_cust_price: Number(e.target.value)
                                    })
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="product-item-write" style={{display:'none'}}>
                    <div className="product-item-write-desc">판매 옵션 설정</div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">필수선택옵션</div>
                        <div className="product-item-write-right">
                            <label className="toggle-box">
                                <input
                                    type="radio"
                                    name="prd_use_options"
                                    value="Y"
                                    checked={inputs.prd_use_options === 'Y'}
                                    onChange={() => {
                                        setInputs({
                                            ...inputs, prd_use_options: 'Y'
                                        })
                                    }}
                                />
                                <span className="checkbox-label">필수 선택옵션 사용</span>
                            </label>
                            <label className="toggle-box">
                                <input
                                    type="radio"
                                    name="prd_use_options"
                                    value="N"
                                    checked={inputs.prd_use_options === 'N'}
                                    onChange={() => {
                                        setInputs({
                                            ...inputs, prd_use_options: 'N'
                                        })
                                    }}
                                />
                                <span className="checkbox-label">필수 선택옵션 사용 안함</span>
                            </label>
                        </div>
                    </div>
                    {inputs.prd_use_options === "Y" ? (<div className="product-item-write-line" style={{display: 'none',}}>
                        <div className="product-item-write-left">필수선택옵션</div>
                        <div className="product-item-write-right">
                            <div className="product-item-write-sub">
                                필수옵션 항목들을 입력하고 옵션 반영하기를 입력하면, 자동으로
                                옵션 조합이 세팅됩니다.
                            </div>
                            <div className="product-item-write-obtions-use-wrap">
                                <div className="produt-item-wrtie-options-use-title-wrap">
                                    <div className="produt-item-wrtie-options-use-title">
                                        옵션명
                                    </div>
                                    <div className="produt-item-wrtie-options-use-title">
                                        옵션상세
                                    </div>
                                </div>
                                {Array.from({length: 3}).map((_, idx) => (
                                    <div key={idx} className="produt-item-wrtie-options-use-wrap">
                                        <div className="produt-item-wrtie-options-use">
                                            <input
                                                type="text"
                                                name="prd_item_options"
                                                className="form-control"
                                                defaultValue={inputs.prd_item_options[idx].title}
                                                onChange={(e) => {
                                                    setInputs(prevState => ({
                                                        ...prevState,
                                                        prd_item_options: prevState.prd_item_options.map((item, indexToUpdate) => {
                                                            if (idx === indexToUpdate) {
                                                                return {...item, title: e.target.value};
                                                            }
                                                            return item;
                                                        })
                                                    }));
                                                }}
                                            />
                                        </div>
                                        <div className="produt-item-wrtie-options-use">
                                            {inputs.prd_item_options[idx].items && inputs.prd_item_options[idx].items.map((_, opindex) => (
                                                <input
                                                    key={opindex}
                                                    type="text"
                                                    name="prd_item_options"
                                                    className="form-control mb10"
                                                    defaultValue={inputs.prd_item_options[idx].items[opindex]}
                                                    onChange={(e) => {
                                                        setInputs(prevState => ({
                                                            ...prevState,
                                                            prd_item_options: prevState.prd_item_options.map((item, indexToUpdate) => {
                                                                if (idx === indexToUpdate) {
                                                                    return {
                                                                        ...item,
                                                                        items: item.items.map((opitem, opupIndex) => {
                                                                            if (opindex === opupIndex) {
                                                                                return e.target.value;
                                                                            }
                                                                            return opitem;
                                                                        })
                                                                    };
                                                                }
                                                                return item;
                                                            })
                                                        }));
                                                    }}
                                                />))}
                                            <div
                                                className="product-item-write-optinos-btn"
                                                onClick={() => {
                                                    setInputs(prevState => ({
                                                        ...prevState,
                                                        prd_item_options: prevState.prd_item_options.map((item, indexToUpdate) => {
                                                            if (idx === indexToUpdate) {
                                                                return {...item, items: [...item.items, '']};
                                                            }
                                                            return item;
                                                        })
                                                    }));
                                                }}
                                            >
                                                + 옵션 항목 추가
                                            </div>
                                        </div>
                                    </div>))}
                            </div>
                        </div>
                    </div>) : null}
                    <div className="product-item-write-line ">
                        <div className="product-item-write-left">추가 옵션</div>
                        <div className="product-item-write-right">
                            <div className="product-item-write-sub">
                                사용여부를 [미사용]으로 설정하고 저장하면 삭제처리 됩니다.
                            </div>
                            <input type="text" name="prd_price" className="form-control"/>
                        </div>
                    </div>
                </div>
                <button className='btn op_btn' type='button' style={{display:'none'}}>적용하기</button>
                <div className="product-item-write" onChange={(e) => {
                    // console.log(e.target)
                }}>
                    <div className="product-item-write-desc">
                        상품요약정보
                        <div className="product-item-write-sub">
                            전자상거래 등에서의 상품 등의 정보제공 관한 고시에 따라 총 35개
                            상품군에 대해 상품 특성 등을 양식에 따라 입력할 수 있습니다.
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">상품군</div>
                        <div className="product-item-write-right">
                            <select name="prd_item_group" className="form-control" defaultValue={inputs.prd_item_group}>
                                <option value="wear">의류</option>
                                <option value="shoes">구두/신발</option>
                                <option value="bag">가방</option>
                                <option value="fashion">패션잡화(모자/벨트/액세서리)</option>
                                <option value="bedding">침구류/커튼</option>
                                <option value="furniture">
                                    가구(침대/소파/싱크대/DIY제품)
                                </option>
                                <option value="image_appliances">영상가전 (TV류)</option>
                                <option value="home_appliances">
                                    가정용전기제품(냉장고/세탁기/식기세척기/전자레인지)
                                </option>
                                <option value="season_appliances">
                                    계절가전(에어컨/온풍기)
                                </option>
                                <option value="office_appliances">
                                    사무용기기(컴퓨터/노트북/프린터)
                                </option>
                                <option value="optics_appliances">
                                    광학기기(디지털카메라/캠코더)
                                </option>
                                <option value="microelectronics">
                                    소형전자(MP3/전자사전등)
                                </option>
                                <option value="mobile">휴대폰</option>
                                <option value="navigation">네비게이션</option>
                                <option value="car">
                                    자동차용품(자동차부품/기타자동차용품)
                                </option>
                                <option value="medical">의료기기</option>
                                <option value="kitchenware">주방용품</option>
                                <option value="cosmetics">화장품</option>
                                <option value="jewelry">귀금속/보석/시계류</option>
                                <option value="food">식품(농수산물)</option>
                                <option value="general_food">가공식품</option>
                                <option value="diet_food">건강기능식품</option>
                                <option value="kids">영유아용품</option>
                                <option value="instrument">악기</option>
                                <option value="sports">스포츠용품</option>
                                <option value="books">서적</option>
                                <option value="reserve">호텔/펜션예약</option>
                                <option value="travel">여행패키지</option>
                                <option value="airline_ticket">항공권</option>
                                <option value="rent_car">자동차대여서비스(렌터카)</option>
                                <option value="rental_water">
                                    물품대여서비스(정수기,비데,공기청정기 등)
                                </option>
                                <option value="rental_etc">
                                    물품대여서비스(서적,유아용품,행사용품 등)
                                </option>
                                <option value="digital_contents">
                                    디지털콘텐츠(음원,게임,인터넷강의 등)
                                </option>
                                <option value="gift_card">상품권/쿠폰</option>
                                <option value="etc">기타</option>
                            </select>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">식품의 유형</div>
                        <div className="product-item-write-right">
                            <input type="text" name="food_type" className="form-control"/>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">생산자</div>
                        <div className="product-item-write-right">
                            <input type="text" name="producer" className="form-control"/>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">소재지</div>
                        <div className="product-item-write-right">
                            <input type="text" name="location" className="form-control"/>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">제조연월일</div>
                        <div className="product-item-write-right">
                            <input type="text" name="manufacture_date" className="form-control"/>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">유통기한 또는 품질유지기한</div>
                        <div className="product-item-write-right">
                            <input type="text" name="expiration_or_quality_maintenance_date" className="form-control"/>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">포장단위별 용량(중량)</div>
                        <div className="product-item-write-right">
                            <input type="text" name="packaging_unit_volume_or_weight" className="form-control"/>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">
                            포장단위별 수량
                        </div>
                        <div className="product-item-write-right">
                            <input type="text" name="packaging_unit_quantity" className="form-control"/>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">원재료명 및 함량</div>
                        <div className="product-item-write-right">
                            <input type="text" name="ingredients_and_content" className="form-control"/>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">영양정보</div>
                        <div className="product-item-write-right">
                            <input type="text" name="nutritional_information" className="form-control"/>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">상품별 세부 사양</div>
                        <div className="product-item-write-right">
                            <input type="text" name="product_specific_details" className="form-control"/>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">기능정보</div>
                        <div className="product-item-write-right">
                            <input type="text" name="functional_information" className="form-control"/>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">
                            섭취량, 섭취방법 및 섭취 시 주의사항
                        </div>
                        <div className="product-item-write-right">
                            <input type="text" name="intake_amount_method_and_precautions" className="form-control"/>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">
                            질병의 예방 및 치료를 위한 의약품이 아니라는 내용의 표현
                        </div>
                        <div className="product-item-write-right">
                            <input type="text" name="non_medication_for_disease_prevention_and_treatment_statement" className="form-control"/>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">
                            유전자재조합식품에 해당하는 경우의 표시
                        </div>
                        <div className="product-item-write-right">
                            <input type="text" name="genetically_modified_food_indication" className="form-control"/>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">
                            표시광고 사전심의필
                        </div>
                        <div className="product-item-write-right">
                            <input type="text" name="advertisement_pre_review_required" className="form-control"/>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">
                            수입식품에 해당하는 경우 "건강기능식품에 관한 법률에 따른 수입신고를 필함"의 문구
                        </div>
                        <div className="product-item-write-right">
                            <input type="text" name="import_declaration_required_for_imported_food" className="form-control"/>
                        </div>
                    </div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">
                            소비자상담 관련 전화번호
                        </div>
                        <div className="product-item-write-right">
                            <input type="text" name="consumer_consultation_phone_number" className="form-control"/>
                        </div>
                    </div>
                </div>
                <div className="product-item-write">
                    <div className="product-item-write-desc">상품 이미지 등록</div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">상품 이미지 등록</div>
                        <div className="product-item-write-right">
                            <label htmlFor="product-image-input" className="upload-zone">
                                여기를 클릭하여, 이미지를 업로드 하세요.
                            </label>
                            <input
                                type="file"
                                id="product-image-input"
                                name="userfile"
                                accept="image/*"
                                multiple
                                style={{display: 'none'}}
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>
                    {images && (
                        <div className="product-item-write-line">
                            <div className="product-item-write-left">업로드된 이미지</div>
                            <div className="product-item-write-right">
                                {images.map((row, idx) => (
                                    <div key={row.att_idx} className={`upload-img-wrap ${thumbImg[0]['att_idx'] === row.att_idx ? 'active' : ''}`}>
                                        <label>
                                            <input type="checkbox" checked={thumbImg[0]['att_idx'] === row.att_idx}
                                                   onChange={() => {
                                                       const newArray = [row]
                                                       // console.log(newArray)
                                                       setThumbImg(newArray);
                                                   }}
                                            />
                                            <span>대표 썸네일</span>
                                            <BsTrash style={{fontSize: '20px', color: '#b20202'}} onClick={() => {
                                                setImgDelAlert({
                                                    ...imgDelAlert,
                                                    active: true,
                                                    idx: row.att_idx,
                                                })
                                            }}/>
                                        </label>
                                        <img
                                            src={baseURL + row.att_filepath.slice(1)}
                                            alt="Uploaded preview"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="product-item-write" >
                    <div className="product-item-write-desc">판매 상세설명</div>
                    <div className="product-item-write-line">
                        <div className="product-item-write-left">상세설명</div>
                        <div className="product-item-write-right">
                            <ReactQuill
                                theme="snow"
                                defaultValue={inputs.prd_content}
                                onChange={(value) => {
                                    setInputs({
                                        ...inputs, prd_content: value
                                    })
                                }}
                                ref={reactQuillRef}
                                modules={quillModule}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <button className='btn' type='submit'>작성하기</button>
        </form>
        {imgDelAlert.active && <Alert delapi={delImg} setView={setImgDelAlert}>
            삭제 하시겠습니까?
        </Alert>}
    </div>);

    async function imageUploading(file) {
        const formData = new FormData();
        console.log('upfile', file);
        formData.append("prd_idx", prd_id);
        file.forEach(singleFile => {
            formData.append("files", singleFile);
        })
        try {
            const {status} = await api.post(`products/addAttachment`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            if(status === 200) {
                getData();
            }
        } catch (error) {
            console.error('파일 업로드 실패', error);
            // 실패했을 때의 로직 (예: 에러 메시지 표시)
        }
    }

    /**
     * 이미지 삭제 처리
     * @returns {Promise<void>}
     */
    async function delImg() {
        console.log(inputs);
        if(inputs.prd_thumbnail === imgDelAlert.idx) {
            alert('썸네일은 삭제 할수 없습니다.')
            setImgDelAlert({
                ...imgDelAlert,
                active: false,
                idx: 0,
            })
            return;
        }
        const formData = {
            att_idx: imgDelAlert.idx
        }
        console.log(formData)
        try {
            const {data, status} = await api.post('/products/deleteAttachment', formData)
            console.log(data);
            if (status === 200) {
                setImgDelAlert({
                    ...imgDelAlert,
                    active: false,
                    idx: 0,
                })
            }
        } catch (e) {
            console.log('삭제 실패')
        }
    }

    async function getData() {
        await api.get(`products/detail/${prd_id}`).then(res => {
            res.data.prd_status = 'Y'
            res.data.prd_item_group = 'diet_food'
            if (res.data.prd_item_options) {
                res.data.prd_item_options = JSON.parse(res.data.prd_item_options)
            }
            console.log(res.data);
            setInputs(res.data)
            if (res.data.attach_path) {
                setImages(res.data.attach_path)
                setThumbImg(res.data.thumbnail);
            }
            // console.log('res', res.data);
        }).catch(err => console.error('상품정보 로드중 에러 발생', err))
        api.get('category/list').then(res => {
            setCategoryList(res.data)
        }).catch(err => {
            console.error('카테고리를 가져오는 도중 에러 발생', err)
        })
    }
};
export default ProductItemWrite;
