const surveyModel = {};
const db = database();
// const currentDatetime = new Date(); // 현재 날짜 및 시간 얻기

// 설문조사 추가
surveyModel.addQuestItem = async (surveyData) => {
    let newSurvey = null;
    const surveyRecord = {
        cat_idx : surveyData.cat_idx,
        check_sex : surveyData.check_sex,
        check_age : surveyData.check_age,
        ban_under_10 : surveyData.ban_under_10,
        quest_text: surveyData.quest_text,
        choice_1: surveyData.choice_1,
        choice_2: surveyData.choice_2,
        choice_3: surveyData.choice_3,
        choice_4: surveyData.choice_4,
        choice_5: surveyData.choice_5,
        choice_6: surveyData.choice_6,
        choice_7: surveyData.choice_7,
        choice_8: surveyData.choice_8,
        sub_comment: surveyData.sub_comment,
    };

    await db
        .insert(surveyRecord)
        .into('wb_survey_quest')
        .then((insertedId) => {
            newSurvey = insertedId;
        })
        .catch((e) => {
            console.log(e);
        });

    return newSurvey;
};

/*설문조사 목록 불러오기*/
surveyModel.getSurveyList = async () => {
    const db = database();
    let surveyList = null;

    await db
    .select('*')
    .from('wb_survey_quest')
    // .where('cont_status', '=', 'Y')
    .then(rows => {
        surveyList = (rows.length > 0) ? rows : [];
    })
    .catch((e) => {
        console.log(e);
        surveyList = null;
    });

    return surveyList;
};

// //설문조사 상세 불러오기
// surveyModel.getContactById = async (cont_idx) => {
//     const db = database();
//     let contactById = null;

//     await db
//         .select('C.*')
//         .from('wb_survey_contact AS C')
//         .where('cont_idx', '=', cont_idx)
//         .andWhere('cont_status', '=' ,'Y')
//         .limit(1)
//         .then(rows => {
//             contactById = (rows.length > 0) ? rows[0] : [];
//         })
//         .catch((e) => {
//             console.log(e);
//             contactById = null;
//         });
        
//     return contactById;
// }

// //설문조사 수정
// surveyModel.updateContactItem = async(updateContactItem) => {
//     const db = database();

//     await db('wb_survey_contact')
//             .where('cont_idx', updateContactItem.cont_idx)
//             .andWhere('cont_status', '=' ,'Y')
//             .update({
//                 consult_status: updateContactItem.consult_status,
//                 super_memo: updateContactItem.super_memo,
//                 upd_date: currentDatetime // 현재 날짜 및 시간 삽입
//             })
//             .catch((e) => {
//                 console.log(e);
//                 return null;
//             });

//     // 업데이트된 내용(id와 title)을 반환합니다.
//     return { "cont_idx": updateContactItem.cont_idx }; // 또는 필요에 따라 업데이트된 내용 반환
// };

/* 설문조사 선택지 ------------------------------ */

// 설문조사 선택지 상세 불러오기
surveyModel.getSurveyChoiceById = async (quest_idx, choice_idx) => {
    const db = database();
    let choiceById = null;

    await db
        .select('C.*')
        .from('wb_survey_choices AS C')
        .where('choice_idx', '=', choice_idx)
        .andWhere('quest_idx', '=' , quest_idx)
        .limit(1)
        .then(rows => {
            choiceById = (rows.length > 0) ? rows[0] : [];
        })
        .catch((e) => {
            console.log(e);
            choiceById = null;
        });
    
    return {choice_idx: choiceById.choice_idx, choice_text: choiceById.choice_text};
}

/* 설문조사 답지 ------------------------------ */
//설문조사 답지 불러오기(특정 질문에 대한 정답 배열)
surveyModel.getSurveyAnswerList = async(quest_idx) => {
    const db = database();
    let answerByQuestId = null;

    await db
        .select('A.*')
        .from('wb_survey_answer AS A')
        .where('quest_idx', '=', quest_idx)
        .limit(1)
        .then(rows => {
            answerByQuestId = (rows.length > 0) ? rows[0] : [];
        })
        .catch((e) => {
            console.log(e);
            answerByQuestId = null;
        });
    
    return answerByQuestId;
}

/* 설문조사 추천 상품 ------------------------------ */

surveyModel.getRecommandInfoById = async(rec_idx, rec_type) => {
    const db = database();
    let RecommandInfoById = null;

    await db
        .select('R.*')
        .from('wb_survey_recommend AS R')
        .where('rec_idx', '=', rec_idx)
        .andWhere('rec_type', '=' , rec_type)
        .limit(1)
        .then(rows => {
            RecommandInfoById = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            RecommandInfoById = null;
        });

    return RecommandInfoById;
}

//멀티팩 알약 정보 찾기
surveyModel.getPillInfoById = async(pill_idx) => {
    const db = database();
    let pillInfoById = null;

    await db
        .select('P.*')
        .from('wb_survey_pill AS P')
        .where('pill_idx', '=', pill_idx)
        .limit(1)
        .then(rows => {
            pillInfoById = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            pillInfoById = null;
        });
    
    return pillInfoById;
}

/* 설문조사 결과 ------------------------------ */

//설문조사 결과 등록하기
surveyModel.addSurveyResult = async(surveyResultRecord) => {
    let newSurveyResultId = null;

    await db
        .insert(surveyResultRecord)
        .into('wb_survey_result')
        .then((insertedId) => {
            newSurveyResultId = insertedId;
        })
        .catch((e) => {
            console.log(e);
        });

    return newSurveyResultId;    
}

//설문조사 결과 목록 불러오기
surveyModel.getResultListById = async(mem_idx) => {
    const db = database();
    let surveyResultList = null;

    await db
    .select('*')
    .from('wb_survey_result')
    .where('mem_idx', '=', mem_idx)
    .then(rows => {
        surveyResultList = (rows.length > 0) ? rows : [];
    })
    .catch((e) => {
        console.log(e);
        surveyResultList = null;
    });

    return surveyResultList;
}

//설문조사 결과 상세 불러오기
surveyModel.getResultDetailById = async (result_idx) => {
    const db = database();
    let ResultById = null;

    await db
        .select('R.*')
        .from('wb_survey_result AS R')
        .where('result_idx', '=', result_idx)
        .limit(1)
        .then(rows => {
            ResultById = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            ResultById = null;
        });
    
    return ResultById;
}

//설문조사 결과 관심사 해시태그 불러오기
surveyModel.getConcernHashText = async (quest_idx) => {
    const db = database();
    let ResultById = null;

    await db
        .select('C.*')
        .from('wb_survey_concerns AS C')
        .where('quest_idx', '=', quest_idx)
        .limit(1)
        .then(rows => {
            ResultById = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            ResultById = null;
        });
    
    return ResultById;
}

module.exports = surveyModel