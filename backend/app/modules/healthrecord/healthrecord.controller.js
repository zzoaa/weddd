/**
 * healthrecords Controller
 * --------------------------------------------------------------------------------
 * 사용자 컨트롤러
 *
 * getStatics   접속
 * postStatics  사용자 접속시 통계데이타를 입력처리
 *
 * @namespace healthrecords
 * @author 장선근
 * @version 1.0.0.
 */

const healthrecordController = {};
const healthrecordModel = loadModule('healthrecord', 'model')
const membersModel = loadModule('members', 'model')

/**
 * Global Middleware
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const db = database();

healthrecordController.getWebView = async(req, res) => {
    try{
        const type = req.params.type;
        const drugCode = req.query.drugCode;

        function DateToString(pDate) {
            var yyyy = pDate.getFullYear();
            var mm = pDate.getMonth() < 9 ? "0" + (pDate.getMonth() + 1) : (pDate.getMonth() + 1); // getMonth() is zero-based
            var dd  = pDate.getDate() < 10 ? "0" + pDate.getDate() : pDate.getDate();
            var hh = pDate.getHours() < 10 ? "0" + pDate.getHours() : pDate.getHours();
            var min = pDate.getMinutes() < 10 ? "0" + pDate.getMinutes() : pDate.getMinutes();
            var ss = pDate.getSeconds() < 10 ? "0" + pDate.getSeconds() : pDate.getMinutes();
            return "".concat(yyyy).concat(mm).concat(dd).concat(hh).concat(min).concat(ss);
        };
        // var enc_token = btoa(DateToString(new Date()).concat("-").concat("DIBTGN"));
        const enc_token = Buffer.from(DateToString(new Date()).concat("-").concat("DIBTGN")).toString('base64');
        const templet = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="Base-Code" content="${enc_token}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
        <title>kimsData</title>
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
        <script src="https://edisweb.kims.co.kr/Script/KIMSeDIS.min.js"></script>
    </head>
    <body>
    
          <iframe width="400px" height="500px" name="kims_iframe"></iframe>
    
    
          <script>
          $(window).load(function(){
              if ('${type}' === 'home') {
                  k_s?.setURL('kims_iframe');
              } else if ('${type}' === 'drug') {
                  k_s?.setURL('kims_iframe', 'DrugInfo', '${drugCode}');
              }
          });
      </script>
    </body>
    </html>
    `        
    res.send(templet);
    } catch (error) {
        console.error("Error get WebView:", error);
        return res.status(500).json({ error: "Failed to  get WebView" });
    }
}

/*  -------------------------------------- */

//건강검진 기록 등록
healthrecordController.addMediChkItem = async(req, res) => {
    try {
        const recordList = req.body;
        const newRecords = recordList.health_record;
        const record_type = recordList.record_type;
        // const mem_idx = req.body.mem_idx;
        const mem_idx = req.loginUser? req.loginUser.id : null;
        const newRecordIds = [];

        console.log('newRecords')
        console.dir(newRecords)

        if(!mem_idx){
            return res.status(403).json({ error: "로그인 회원만 사용 가능한 기능입니다." });
        }

        if (recordList == null) {
            return res.status(403).json({ error: '등록할 건강 검진 결과 데이터가 없습니다.' });
        }

        const medichkList = await healthrecordModel.getMediChkList(mem_idx, record_type);

        if(medichkList.length == 0) {
            for(let i = 0; i < newRecords.length; i++) {
                const newMediChkItem = await healthrecordModel.addMediChkItem(mem_idx, record_type, newRecords[i]);
                newRecordIds.push(newMediChkItem);
                console.log(newMediChkItem);
            }

            console.log('최초 데이터 삽입!')

            return res.status(200).json({newRecordIds: newRecordIds});
        }

            for (let i = 0; i < newRecords.length; i++) {
                const newRecordString = JSON.stringify(newRecords[i]);
                const newGUNYEAR = newRecords[i].GUNYEAR;
                let isDuplicate = false;
            
                for (let j = 0; j < medichkList.length; j++) {
                    const oldRecordString = medichkList[j].health_record;
                    const savedRecord = JSON.parse(oldRecordString);
                    
                    //*GUNYEAR 관련 부분은 연도까지 중복 체크하고 싶다면 살리기
                    // const oldGUNYEAR = savedRecord.GUNYEAR; 
                    // if (oldRecordString.length === newRecordString.length && oldGUNYEAR === newGUNYEAR) {
                    if (oldRecordString.length === newRecordString.length) {
                        isDuplicate = true;
                        break;
                    }
                }
            
                if (!isDuplicate) {
                    // 새로운 데이터 추가
                    const newRecordInserted = await healthrecordModel.addMediChkItem(mem_idx, record_type, newRecords[i]);
                    newRecordIds.push(newRecordInserted);
                    console.log(newRecordInserted);
                }
            }


        return res.status(200).json({newRecordIds: newRecordIds});
    } catch (error) {
        console.error("Error adding mediChk:", error);
        return res.status(500).json({ error: "Failed to add mediChk" });
    }
};

//건강검진 기록 목록 불러오기
healthrecordController.getMediChkList = async(req, res) => {
    try {
        const mem_idx = req.loginUser? req.loginUser.id : null;
        const record_type = req.params.record_type? req.params.record_type : null;
        console.log('mem_idx' + mem_idx)

        if(!mem_idx){
            return res.status(403).json({ error: "로그인 회원만 사용 가능한 기능입니다." });
        }

        const recordList = await healthrecordModel.getMediChkList(mem_idx, record_type);

        for(let i = 0; i < recordList.length; i++){
            recordList[i].health_record = JSON.parse(recordList[i].health_record)
        }

        console.log(recordList)

        // 건강검진 기록  목록 반환
        return res.status(200).json(recordList);
    } catch (error) {
        console.error("Error fetching mediChk list:", error);
        return res.status(500).json({ error: "Failed to fetch mediChk list" });
    }
};

//건강검진 기록 상세 불러오기
healthrecordController.getMediChkById = async(req, res) => {
    try {
        // 데이터베이스에서 건강검진 기록  상세보기 조회
        const chk_idx = req.body.chk_idx;
        const record_type = req.body.record_type;
        const mem_idx = req.loginUser? req.loginUser.id : null;

        if(!mem_idx){
            return res.status(403).json({ error: "로그인 회원만 사용 가능한 기능입니다." });
        }
        
        if(!chk_idx || !record_type){
            return res.status(403).json({ error: "PK값과 타입을 보내주세요." });
        }

        const recordDetail = await healthrecordModel.getMediChkById(chk_idx, mem_idx, record_type);

        recordDetail.health_record = JSON.parse(recordDetail.health_record)

        console.log(recordDetail)

        // 건강검진 기록  상세보기 반환
        return res.status(200).json(recordDetail);
    } catch (error) {
        console.error("Error fetchi medi chk detail:", error);
        return res.status(500).json({ error: "Failed to fetch medi chk detail" });
    }
}

//건강검진 기록 수정
healthrecordController.updateMediChkItem = async(req, res) => {
    try {
        const updatemediChkItem = req.body;
        const mem_idx = req.loginUser? req.loginUser.id : null;

        if(!mem_idx){
            return res.status(403).json({ error: "로그인 회원만 사용 가능한 기능입니다." });
        }
        console.log('mem_idx' + mem_idx)

        // console.log('updatemediChkItem: ')
        // console.log(updatemediChkItem)
        
        //mediChk_idx 실존하는지 || mediChk_status 상태가 Y인지 검증
        const checkedmediChkItem = await healthrecordModel.getMediChkById(updatemediChkItem.chk_idx, mem_idx, updatemediChkItem.record_type);

        if(checkedmediChkItem == null) {
            return res.status(500).json({ error: "수정할 팁 게시글을 찾을 수 없습니다." })
        }

        // console.log('checkedmediChkItem: ');
        // console.log(checkedmediChkItem);


        // 건강검진 기록  수정 --------------------------------------------------
        const updatedmediChkItem = await healthrecordModel.updateMediChkItem(updatemediChkItem, mem_idx);

        if (!updatedmediChkItem || updatedmediChkItem == null) {
            return res.status(404).json({ error: "info item not found" });
        }
        
        console.log(`${updatedmediChkItem.chk_idx}의 정보 수정 성공`)

        return res.status(200).json({message: `${updatedmediChkItem.chk_idx}의 정보 수정 성공`});
    } catch (error) {
        console.error("Error updating medi check:", error);
        return res.status(500).json({ error: "Failed to update medi check" });
    }
};


module.exports = healthrecordController
