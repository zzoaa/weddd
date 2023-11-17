/**
 * surveys Controller
 * --------------------------------------------------------------------------------
 * 사용자 컨트롤러
 *
 * getStatics   접속
 * postStatics  사용자 접속시 통계데이타를 입력처리
 *
 * @namespace surveys
 * @author 장선근
 * @version 1.0.0.
 */

const surveyController = {};
const surveyModel = loadModule('survey', 'model')
// const productModel = loadModule('products', 'model')

/**
 * Global Middleware
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const db = database();

//설문조사 질문 등록
surveyController.addQuestItem = async(req, res) => {
    try {
        const surveyData = req.body;
        console.log('새로 설문조사에 담을 내용물: '+ surveyData)

        const newsurveyQuest = await surveyModel.addQuestItem(surveyData);

        return res.status(200).json({ "quest_idx" : newsurveyQuest[0] });
    } catch (error) {
        console.error("Error adding survey:", error);
        return res.status(500).json({ error: "Failed to add survey" });
    }
};

/*설문조사 목록 불러오기*/
surveyController.getSurveyList = async(req, res) => {
    try {

        // 데이터베이스에서 설문조사 목록을 조회
        const surveyList = await surveyModel.getSurveyList();
        // console.log(surveyList)

        // 설문 선택지 매칭하기 --------------------------------
        
        for(let i = 0; i < surveyList.length; i++) {
            let foundedArray = [];
            
            if(surveyList[i].choiceArray == null) continue; //만약 surveyList[i].choiceArray 의 값이 null 이면 다음 반복문으로
            const foundArray = JSON.parse(surveyList[i].choiceArray);
            // const foundArray = surveyList[i].choiceArray
            console.log('type of foundArray: ' + typeof(foundArray));
            console.log(foundArray);

            for(let j = 0; j < foundArray.length; j++) {
                const choice_idx = foundArray[j]
                const surveyChoice = await surveyModel.getSurveyChoiceById(surveyList[i].quest_idx, choice_idx);
            
                console.log('surveyChoice: ');
                console.log(surveyChoice);

                foundedArray.push(surveyChoice);
            }
        
            surveyList[i].choiceArray = foundedArray;
        }


        // 설문조사 목록 반환
        return res.status(200).json(surveyList);
    } catch (error) {
        console.error("Error fetching survey list:", error);
        return res.status(500).json({ error: "Failed to fetch survey list" });
    }
};


/* 설문조사 결과 ------------------------------------------------------ */
//설문조사 결과 목록 불러오기
surveyController.getResultListById = async(req, res) => {
    try {
        const mem_idx = req.params.mem_idx;

        // 데이터베이스에서 설문조사 목록을 조회
        const surveyResultList = await surveyModel.getResultListById(mem_idx);
        // console.log(surveyResultList);
        // console.log(surveyList)

        // 관심사 해시태그 parse 처리 --------------------------------
        if(surveyResultList.length > 0) {
            for(let i = 0; i < surveyResultList.length; i++) {
                const interest_parsed = JSON.parse(surveyResultList[i].interest_array);
                console.log('typeof(interest_parsed): ' + typeof(interest_parsed));
                surveyResultList[i].interest_array = interest_parsed;
            }
        }

        // // 추천 영양소 리스트 받아오기 --------------------------------
        
        // let recNutInfoArray = [];

        // if(surveyResultList.length === 0) {
        //     recNutInfoArray = null;
        // } else {
        //     console.log('이거 탐?');
        //     for(let i = 0; i < surveyResultList.length; i++) {
        //         const recNutsArray = JSON.parse(surveyResultList[i].rec_nuts);
        //         console.log('recNutsArray: ')
        //         console.log(recNutsArray);
    
        //         for(let j = 0; j < recNutsArray.length; j++) {
        //             const rec_idx = recNutsArray[i];
    
        //             const rec_nut_info = await surveyModel.getRecommandInfoById(rec_idx, 'NUT');
    
        //             recNutInfoArray.push(rec_nut_info); //return 받은 영양소 객체 정보를 배열에 추가 .
        //         }

        //         surveyResultList[i].rec_nuts = recNutInfoArray;
        //     }
    
        // }

        // console.log('recNutInfoArray: ');
        // console.log(recNutInfoArray);


        // 설문조사 목록 반환
        return res.status(200).json(surveyResultList);
    } catch (error) {
        console.error("Error fetching survey list:", error);
        return res.status(500).json({ error: "Failed to fetch survey list" });
    }
};

//설문조사 결과 상세 불러오기
surveyController.getResultDetailById = async(req, res) => {
    try {
        // 데이터베이스에서 설문조사 상세보기 조회
        const result_idx = req.params?.result_idx ?? '';
        const resultDetail = await surveyModel.getResultDetailById(result_idx);

        console.log(resultDetail)

        if(resultDetail == null) {
            return res.status(500).json({ error: "Failed to find survey detail" });
        }

        // resultDetail.habit_imp_list = JSON.parse(resultDetail.habit_imp_list)

        const found_multis = JSON.parse(resultDetail.rec_multis);
        const found_eachs = JSON.parse(resultDetail.rec_eachs);
        const found_nuts = JSON.parse(resultDetail.rec_nuts);

        /* 멀티팩 정보 찾아오기 */
        const recMultiInfoArray = [];
        for (const rec_idx of found_multis) {
            const rec_multi_info = await surveyModel.getRecommandInfoById(rec_idx, 'MULTI');

            if(rec_multi_info.pill_idx_array != null) {
                const pill_info_multis = []
                const pill_idx_array = JSON.parse(rec_multi_info.pill_idx_array);

                for(const pill_idx of pill_idx_array){
                    const pillInfoById = await surveyModel.getPillInfoById(pill_idx);
                    pill_info_multis.push(pillInfoById)
                }
                rec_multi_info.pill_idx_array = pill_info_multis;
            }

            
            /* contain_eachs - JSON.parse 처리하기 */
            const contain_eachs_array = JSON.parse(rec_multi_info.contain_eachs);
            rec_multi_info.contain_eachs = contain_eachs_array;

            recMultiInfoArray.push(rec_multi_info);

        }

        resultDetail.rec_multis = recMultiInfoArray;
        console.log('resultDetail.rec_multis: ');
        console.log(resultDetail.rec_multis);

        /* 단일팩 정보 찾아오기 */
        const recEachInfoArray = [];
        for (const rec_idx of found_eachs) {
            const pill_info_eachs = [];
            const rec_each_info = await surveyModel.getRecommandInfoById(rec_idx, 'EACH');
            
            console.log('rec_each_info::')
            console.dir(rec_each_info);
            console.log('rec_each_info.pill_idx_array:')
            console.dir(rec_each_info.pill_idx_array);

                if(rec_each_info.pill_idx_array != null) {
                    const pill_idx_array = JSON.parse(rec_each_info.pill_idx_array);

                    const pillInfoById = await surveyModel.getPillInfoById(pill_idx_array[0]);
                        
                    pill_info_eachs.push(pillInfoById)
                }

            rec_each_info.pill_idx_array = pill_info_eachs;
            recEachInfoArray.push(rec_each_info);
        }
        
        resultDetail.rec_eachs = recEachInfoArray;

        /* 영양소 정보 찾아오기 */
        const recNutInfoArray = [];
        for (const rec_idx of found_nuts) {
            const rec_nut_info = await surveyModel.getRecommandInfoById(rec_idx, 'NUT');
            recNutInfoArray.push(rec_nut_info);
        }

        for(let i = 0; i < recNutInfoArray.length; i++){
            recNutInfoArray[i].nut_hash_array = JSON.parse(recNutInfoArray[i].nut_hash_array)
        }

        console.log('recNutInfoArray::')
        console.dir(recNutInfoArray)

        resultDetail.rec_nuts = recNutInfoArray;

        // 설문조사 상세보기 반환
        return res.status(200).json(resultDetail);
    } catch (error) {
        console.error("Error finding survey detail:", error);
        return res.status(500).json({ error: "Failed to find survey detail" });
    }
}

//설문조사 결과 등록
surveyController.addSurveyResult = async(req, res) => {
    try {
        const surveyResultData = req.body.quest_result;
        const surveyMemberData = req.body.member_info;
        const surveyHabitData = req.body.member_habit;
        const surveyInterestData = req.body.member_interest;

        if(surveyResultData == null || surveyResultData == undefined) {
            return res.status(500).json({ error: "저장할 설문내역이 없습니다." });
        }


        /* 3. 저장할 멤버 데이터 정리 */

        //멤버 BMI 지수 계산

        const memberBmi = await surveyController.calcTotalBmi(surveyMemberData.mem_height, surveyMemberData.mem_weight);
        console.log(memberBmi);

        //멤버 생활습관 지수 계산
        const memberHabit = await surveyController.calcTotalHabit(surveyHabitData)

        if(memberHabit == null) {
            return res.status(500).json({ error: "생활 습관 데이터가 없습니다." });  
        }

        if(memberHabit.habit_index == null) {
            return res.status(500).json({ error: "생활 습관 데이터에 문제가 있습니다." });  
        }

        //관심사에 따른 해시태그 추가
        const memberConcerns = await surveyController.calcFindInterest(surveyInterestData)

        if(memberConcerns == null) {
            return res.status(500).json({ error: "설문 관심사가 확인되지 않습니다." });  
        }



        /* 1. surveyResultData에 따른 추천 상품 idx 모두 가져오기 */

        let add_rec_multi = [];
        let add_rec_each = [];
        // let add_rec_nut = [];

        for(let i = 0; i < surveyResultData.length; i++) {
            const quest_idx = Number(surveyResultData[i].quest_idx);
            let mem_answer_array = surveyResultData[i].answer_array;
            mem_answer_array = mem_answer_array?.map(item => {
                return Number(item)
            })
            //만약 surveyResultData[i].array_answer의 값이 null이면 다음 반복문으로
            if(mem_answer_array == null) continue;


            //설문조사 답지 불러오기(특정 질문에 대한 정답 배열)
            const surveyAnswer = await surveyModel.getSurveyAnswerList(quest_idx);

            // console.log('surveyAnswer::')
            // console.dir(surveyAnswer)

            const sheet_answer_array = JSON.parse(surveyAnswer.answer_array);

            // console.log('sheet_answer_array::')
            // console.dir(sheet_answer_array)

            
            //* and 조건문 시작 (1)

            /*
            #2. 다이어트/운동/피부
                #2-1. 만약 quest_idx가 28일 때,
                #2-2. mem_answer_array이라는 배열의 길이가 0 이상이라면(값을 하나라도 갖고 있다면)
                #2-4. mem_answer_array이라는 배열에 54, 55, 56, 57, 58 중 같은 값이 포함되어있는지 확인
                    ##2-4-1. 만약 포함되어있는 경우,
                        - memberBmi.bmi_index의 값이 int 23 미만이라면 다음 반복문으로 continue
                        - 23이상이라면
                            - add_rec_multi 배열에 9라는 숫자값 추가
                            - add_rec_each 배열 에 21이라는 숫자값 추가

                    ##2-4-2. 만약 포함되어있지 않은 경우
                        - mem_answer_array이라는 배열이 값에 59를 갖고 있는지 확인
                        - 59를 갖고 있다면
                            - add_rec_multi 배열에 10라는 숫자값 추가
                            - add_rec_each 배열 에 21이라는 숫자값 추가

                #2-5. 다음 반복문으로 continue


            #3. 만약 quest_idx가 36일 때 mem_answer_array의 길이가 0보다 크다면
                    - add_rec_each 배열 에 20이라는 숫자값 추가

                #3-1. 만약 mem_answer_array 배열이 94라는 값을 포함하고 있다면, rec_idx 4도 추천
                    - add_rec_multi 배열에 4라는 숫자값 추가

                #3-2. 94를 포함하고 있지 않다면 다음 반복문으로 continue;

            */

            //* and 조건문 시작 - (1) 다이어트/운동 에서의 추가 조건 확인문
            if (quest_idx === 28) {
                if (mem_answer_array.length > 0) {
                    if (mem_answer_array.some(value => [54, 55, 56, 57, 58].includes(value))) {
                        if (memberBmi.bmi_index < 23) { //*BMI 수치 체크
                            continue; // memberBmi.bmi_index의 값이 23 미만이면 다음 반복문으로 이동
                        } else {
                            add_rec_multi.push(9);
                            add_rec_each.push(21);

                            continue;
                        }
                    } else {
                        if (mem_answer_array.includes(59)) { //* 고강도 운동만 선택 시 다른 멀티팩 추천
                            add_rec_multi.push(10);
                            add_rec_each.push(21);
                        }

                        continue;
                    }
                }
            }

            //* and 조건문 시작 - (2) 장/소화기능, 94번 선택지 클릭 시에만 4번 멀티팩 추천
            if (quest_idx === 36 && mem_answer_array.length > 0) {
                add_rec_each.push(20);
            
                if (!mem_answer_array.includes(94)) {
                    continue; // 94를 포함하고 있지 않으면 다음 반복문으로 이동
                }
            
                add_rec_multi.push(4);

                continue;
            }


                /*
                회원이 보낸 응답 중
                하나라도 정답 응답과 일치하는 것이 있다면 checkAnswerTrue는 true값을 반환한다.
                */
            const checkAnswerTrue = mem_answer_array.some(valueA => sheet_answer_array.includes(valueA));

                /*
                checkAnswerTrue의 값이 true 라면 rec_multi, rec_each 를 저장한다.
                checkAnswerTrue의 값이 false 라면 rec_no_multi, rec_no_each 를 저장한다.
                */
            if(checkAnswerTrue) {
                JSON.parse(surveyAnswer.rec_multi).forEach(item => {
                    // console.log('push rec multi item : '+ item);
                    add_rec_multi.push(item);
                  });

                JSON.parse(surveyAnswer.rec_each).forEach(item => {
                    add_rec_each.push(item);
                  });    
            } else {
                JSON.parse(surveyAnswer.rec_no_multi).forEach(item => {
                    add_rec_multi.push(item);
                  });

                JSON.parse(surveyAnswer.rec_no_each).forEach(item => {
                    add_rec_each.push(item);
                  });    
            }

            console.log(`${[i]}번 째 반복문 add_rec_each의 값`)
            console.log(add_rec_each)
        }

        //* and 조건문 시작 - (3) 임신/수유 시 단일 팩 추천 내역 제거 
        if (surveyResultData[2].quest_idx === 5) {
            if (surveyResultData[2].answer_array && surveyResultData[2].answer_array.includes(3)) {
                // mem_answer_array 배열이 3을 포함하고 있다면
                add_rec_each = add_rec_each.filter(item => item === 20 || item === 27);
                // rec_each 배열에서 20과 27을 가진 인덱스만 남기고 나머지는 제거
            }
        }

        //* and 조건문 시작 - (4) 다이어트/운동 관심사 선택 시 피부 추천(멀티+단일) 팩 제거
        if (surveyResultData[25].quest_idx === 28) {
            if (surveyResultData[25].answer_array) {
                add_rec_multi = add_rec_multi.filter(item => item !== 12);
                add_rec_each = add_rec_each.filter(item => item !== 18);
                // 12와 18을 가진 인덱스를 제외한 나머지를 남깁니다.
            }
        }

        // console.log('add_rec_each의 값')
        // console.log(add_rec_each)

        /* 2. 1에서 만든 추천 상품 idx를 담은 배열들. 중복되는 idx 없애기 */

        const selected_rec_multi = [...new Set(add_rec_multi)]; 
        const final_rec_multi = selected_rec_multi.slice(0, 2); //멀티팩 추천은 상위 2개 까지만
        const final_rec_each = [...new Set(add_rec_each)]; 
        const final_rec_nut = await surveyController.recommendNutArray(surveyResultData);


        const surveyResultRecord = {
            mem_idx : surveyMemberData.mem_idx,
            mem_nickName : surveyMemberData.mem_nickName,
            mem_sex : surveyMemberData.mem_sex, //FEMALE || MALE
            mem_birth : surveyMemberData.mem_birth, //19900120
            mem_age : surveyMemberData.mem_age, //ADULT || YOUTH
            habit_index : memberHabit.habit_index,
            // habit_imp_list : JSON.stringify(memberHabit.habit_imp),
            // habit_imp_list : JSON.stringify(["#test1", "#test2", "#test3", "#test4"]),
            bmi_index : memberBmi.bmi_index,
            bmi_stage : memberBmi.bmi_stage,
            bmi_comment : memberBmi.bmi_comment,
            interest_array : JSON.stringify(memberConcerns),
            rec_multis : JSON.stringify(final_rec_multi),
            rec_eachs : JSON.stringify(final_rec_each),
            rec_nuts : JSON.stringify(final_rec_nut),
            reg_datetime : new Date()
        };

        const newsurveyResultId = await surveyModel.addSurveyResult(surveyResultRecord);

        return res.status(200).json({result_idx:newsurveyResultId[0]});
    } catch (error) {
        console.error("Error adding survey:", error);
        return res.status(500).json({ error: "Failed to add survey" });
    }
};


/* BMI 계산, 생활지수 계산 -------------------------------------------- */

//BMI 계산
surveyController.calcTotalBmi = async(member_height, member_weight) => {
    try {
        // 키를 미터로 변환
        const heightInMeters = (member_height / 100).toFixed(1);

        // BMI 계산
        const bmi_index = (member_weight / (heightInMeters * heightInMeters)).toFixed(1);
        let bmi_stage;
        let bmi_comment;

        if(bmi_index <= 18.5) {
            bmi_stage = "저체중";
            bmi_comment = "건강을 위해 정상 체중을 만들어 보세요."
        } else if(bmi_index <= 22.9) {
            bmi_stage = "정상";
            bmi_comment = "당신은 정상 체중이에요~!"
        } else if(bmi_index <= 24.9) {
            bmi_stage = "과체중";
            bmi_comment = "건강을 위해 정상 체중을 만들어 보세요."
        } else {
            bmi_stage = "비만";
            bmi_comment = "건강을 위해 정상 체중을 만들어 보세요."
        }
        // BMI 값을 반환
        return { bmi_index: bmi_index, bmi_stage: bmi_stage, bmi_comment: bmi_comment };
    } catch (error) {
        console.error("Error calculating BMI:", error);
        return res.status(500).json({ error: "Failed to calculate BMI" });
    }
};

//생활지수 계산
surveyController.calcTotalHabit = async(surveyHabitData) => {

    if(surveyHabitData == null || surveyHabitData == undefined) {
        return null;
    }

    //생활 습관 지수 구하기
    let habit_score = 0;
    let habit_index;
    const habit_imp = [];
    
    //값 구하기 + 개선점 추가
    for(let i = 0; i < surveyHabitData.length; i++){
        if(surveyHabitData[i].answer_array == null) continue;

        const quest_idx = surveyHabitData[i].quest_idx;
        const answer = surveyHabitData[i].answer_array[0];

        switch (quest_idx) {
            case 14:
                if (answer === 11) {habit_score += 2;}
                // else {habit_imp.push('#영양소불균형1')}
                break;
            case 15:
                if (answer === 14) {habit_score += 2;}
                // else {habit_imp.push('#영양소불균형2')}
                break;
            case 16:
                if (answer === 16) {habit_score += 2;}
                // else {habit_imp.push('#영양소불균형3')}
                break;
            case 17:
                if (answer === 18) {habit_score += 1;}
                // else {habit_imp.push('#영양소불균형4')}
                break;
            case 18:
                if (answer === 20) {habit_score += 1;}
                // else {habit_imp.push('#영양소불균형5')}
                break;
            case 19:
                if (answer === 22) {habit_score += 1;}
                // else {habit_imp.push('#영양소불균형6')}
                break;
            case 20:
                if (answer === 24) {habit_score += 1;}
                // else {habit_imp.push('#영양소불균형7')}
                break;
            case 21:
                // For quest_idx 21, no condition is specified, so no score change.
                break;
            default:
                // habit_imp = ['#default'];
                // Handle other quest_idx values if needed.
                break;
        }
    }

    console.log('habit_score : ' + habit_score);

    // 지수 계산
    if (habit_score <= 2) {
        habit_index = '위험';
    } else if (habit_score >= 3 && habit_score <= 5) {
        habit_index = '보통';
    } else if (habit_score >= 6 && habit_score <= 9) {
        habit_index = '양호';
    } else {
        habit_index = null;
    }

    // habit_index 및 다른 값 반환
    return {
        habit_index: habit_index,
        habit_imp: habit_imp,
    };
}

//관심사 해시태그
surveyController.calcFindInterest = async(memberInterestData) => {
    if(memberInterestData == null || memberInterestData == undefined) {
        return null;
    }
    
    const concerns_list = [];

    for(let i = 0; i < memberInterestData.length; i++) {
        const quest_idx = memberInterestData[i].quest_idx
        const answer_array = memberInterestData[i].answer_array

        if(answer_array == null) continue;

        // 1. quest_idx가 7~9 사이거나 23~38 사이일 경우
        if ((quest_idx >= 7 && quest_idx <= 9) || (quest_idx >= 23 && quest_idx <= 38)) {
            // 1-1. hash_text 가져오기
            const concerns_info = await surveyModel.getConcernHashText(quest_idx);

            // 1-2. concerns_list 배열에 hash_text를 push
            concerns_list.push(concerns_info.hash_text);
        }
    }

    return concerns_list.slice(0, 4);
} 

//영양소 추천
surveyController.recommendNutArray = async(surveyResultData) => {
//    console.log("함수 안 surveyResultData::");
//    console.log(surveyResultData);

   const nutScoring = [];

   for (let i = 29; i <= 72; i++) {
       nutScoring.push({ nut_idx: i, rec_score: 0 });
   }

   for(let i = 0; i < surveyResultData.length; i++){
        const thisQuest = surveyResultData[i]
        if(thisQuest.quest_idx == 3
            || thisQuest.quest_idx == 4
            || thisQuest.quest_idx == 6
            || thisQuest.quest_idx == 10
            || thisQuest.quest_idx == 11
            || thisQuest.quest_idx == 12
            || thisQuest.quest_idx == 13
            || thisQuest.quest_idx == 21
            || thisQuest.quest_idx == 22
        ) {continue;}

        // console.log(`quest_idx ${thisQuest.quest_idx} 번 째 문항 처리 중...`)

        if (thisQuest.quest_idx === 5 && thisQuest.answer_array && [33].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([33, 40, 47, 61, 72].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        if (thisQuest.quest_idx === 7 && thisQuest.answer_array && [5].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([34].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        if (thisQuest.quest_idx === 8 && thisQuest.answer_array && [7].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([37, 67].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        if (thisQuest.quest_idx === 9 && thisQuest.answer_array && [9].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([29, 62].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        if (thisQuest.quest_idx === 14 && thisQuest.answer_array && [12].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([47].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        if (thisQuest.quest_idx === 15 && thisQuest.answer_array && [13].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([47].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        
        if (thisQuest.quest_idx === 16 && thisQuest.answer_array && [16].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([29].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        
        if (thisQuest.quest_idx === 17 && thisQuest.answer_array && [17].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([39, 50].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        
        if (thisQuest.quest_idx === 20 && thisQuest.answer_array && [23].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([34, 37, 50].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        if (thisQuest.quest_idx === 23 && thisQuest.answer_array && [25, 26, 27, 28, 29].every(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([40, 42, 46].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        
        if (thisQuest.quest_idx === 25 && thisQuest.answer_array && [35, 36, 37, 38, 39, 40, 41].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([38].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        
        if (thisQuest.quest_idx === 26 && thisQuest.answer_array && [42, 43, 44, 45, 46, 47, 48, 49].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([40, 42, 46].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        
        if (thisQuest.quest_idx === 27 && thisQuest.answer_array && [50, 51, 52, 53].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([36, 41].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        
        if (thisQuest.quest_idx === 28 && thisQuest.answer_array && [54, 55, 56, 57, 58, 59].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([65].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        
        if (thisQuest.quest_idx === 30 && thisQuest.answer_array && [67, 68, 69].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([43, 49, 60, 62, 63, 69].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        
        if (thisQuest.quest_idx === 31 && thisQuest.answer_array && [70, 71, 72, 73, 74].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([32].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        
        if (thisQuest.quest_idx === 32 && thisQuest.answer_array && [75, 76, 77].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([30, 31, 59].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }

        if (thisQuest.quest_idx === 33 && thisQuest.answer_array && [78, 79, 80, 81, 82].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([35, 48, 51, 52, 53, 54, 55, 65].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        
        if (thisQuest.quest_idx === 35 && thisQuest.answer_array && [88, 89, 90, 91, 92, 93].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([40, 45, 50, 51, 52, 53, 54, 55, 56, 58, 64, 66].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        
        if (thisQuest.quest_idx === 36 && thisQuest.answer_array && [94, 95, 96, 97].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([33, 44].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        
        if (thisQuest.quest_idx === 37 && thisQuest.answer_array && [98, 99, 100, 101].some(item => thisQuest.answer_array.includes(item))) {
            for (const item of nutScoring) {
                if ([29, 41, 56, 57, 72].includes(item.nut_idx)) {
                    item.rec_score += 1;
                }
            }
        }
        
    }

    // console.log('nutScoring 계산 끝 ::')
    // console.log(nutScoring)
    
    const filteredNutScoring = nutScoring.filter(item => item.rec_score !== 0);
    filteredNutScoring.sort((a, b) => b.rec_score - a.rec_score).splice(3);

    // console.log('filteredNutScoring 계산 끝 ::')
    // console.log(filteredNutScoring)

    let resultArray = [];

    for (let i = 0; i < filteredNutScoring.length; i++) {
        resultArray[i] = filteredNutScoring[i].nut_idx;
    }

    // console.log('resultArray 계산 끝 ::')
    // console.log(resultArray)

    return resultArray
}

module.exports = surveyController
