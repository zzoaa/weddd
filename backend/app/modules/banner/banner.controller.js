/**
 * banners Controller
 * --------------------------------------------------------------------------------
 * 사용자 컨트롤러
 *
 * getStatics   접속
 * postStatics  사용자 접속시 통계데이타를 입력처리
 *
 * @namespace banner
 * @author 장선근
 * @version 1.0.0.
 */

const bannerController = {};
const bannerModel = loadModule('banner', 'model')
const path = require('path');
const uploadLibrary = require('../../libraries/upload.library.js');
const fs = require("fs");
/**
 * Global Middleware
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */

//배너 그룹 key 중복 체크
bannerController.checkDuplicateGroup = async(req, res) => {
    try{
        const checkKey = req.body.bng_key;

        if (!checkKey || typeof checkKey !== 'string') {
            return res.status(401).json({ error: "중복 확인용 데이터가 올바르게 전송되지 않았습니다." });
        }

        const checkedAnswer = await bannerModel.checkDuplicateGroup(checkKey)
        console.log(checkedAnswer);

        let resultAns;
        if(checkedAnswer.length == 0) {
            resultAns = true; //중복 없음
        } else {
            resultAns = false; //중복 있음
        }
        return res.status(200).json(resultAns)
    }catch(e){
        console.error(e)
        return res.status(500).json({ error: "Failed to check bng_key duplicate" });
    }
}

//배너 그룹 추가
bannerController.addBannerGroups = async(req, res) => {
    try {
        const newGroupData = req.body;

        if(newGroupData == null) {
            return res.status(401).json({ error: '등록할 배너 그룹 데이터가 없습니다.' });
        }

        const newGroupItem = await bannerModel.addBannerGroups(newGroupData);

        return res.status(200).json({msg: `새로운 배너 그룹의 ID ${newGroupItem}`});
    }catch (e){
        console.error(e)
        return res.status(500).json({ error: "Failed to add banner group" });
    }
}

//배너 그룹 목록 보기
bannerController.getBannerGroups = async (req, res) => {
    try{
        const bannerGroups = await bannerModel.getBannerGroups();
        console.log(bannerGroups);
        if (!bannerGroups) {
            return res.status(200).json({ message: "배너그룹이 없습니다" });
        }
        return res.json(bannerGroups);
    }catch (e){
        console.error (e)
        return res.status(500).json({ error: "Failed to get banner group list" });
    }
}

//배너 그룹 상세 보기
bannerController.getBannerGroupsDetail = async(req, res) => {
    try {
        const bng_idx = req.params?.bng_idx ?? '';
        const bngDetail = await bannerModel.getBannerGroupsDetail(bng_idx);

        if(bngDetail == null) {
            return res.status(500).json({ error: "배너 그룹을 찾을 수 없습니다." });
        }

        return res.status(200).json(bngDetail);
    }catch (e){
        console.error(e)
        return res.status(500).json({ error: "Failed to get banner group" });
    }
}

//배너 그룹 수정
bannerController.updateBannerGroups = async(req, res) => {
    try {
        const updateBngItem = req.body;

        console.log('updateBngItem: ')
        console.log(updateBngItem)
        //bng_idx 실존하는지 || bng_status 상태가 Y인지 검증
        const checkedBngItem = await bannerModel.getBannerGroupsDetail(updateBngItem.bng_idx);

        if(checkedBngItem == null) {
            return res.status(500).json({ error: "수정할 배너 그룹을 찾을 수 없습니다." })
        }

        const updatedBngItem = await bannerModel.updateBannerGroups(updateBngItem);

        if (!updatedBngItem || updatedBngItem == null) {
            return res.status(404).json({ error: "bng item not found" });
        }
    
        return res.status(200).json(updatedBngItem);
    }catch (e){
        console.error(e)
        return res.status(500).json({ error: "Failed to update banner group" });
    }
}

//배너 그룹 추가
bannerController.deleteBannerGroups = async(req, res) => {
    const db = database();
    try {
        const deleteIdsList = req.body.bngIds;

        if (deleteIdsList.length === 0) {
            return res.status(400).json({error: '삭제할 배너 그룹이 없습니다.'});
        }

        for (const item of deleteIdsList) {
            const deleteFileColumn = await bannerModel.getBannerGroupsDetail(item);

            if (!deleteFileColumn) {
                return res.status(500).json({ error: `선택한 배너 그룹은 존재하지 않습니다.` })
            } else {
                console.log(`카테고리 확인!`)
            }
        }
        
        for (const item of deleteIdsList) {
            await db('wb_banner_group')
                .where('bng_idx', item)
                .update({
                    bng_status: 'N'
                })
                .catch((e) => {
                    console.log(e);
                    return null;
                });
        }
        return res.status(200).json({msg: `배너 그룹 삭제가 완료되었습니다.`});
    }catch (e){
    console.error(e)
    }
}

/* ---------------------------------*/

//bng_idx로 배너 목록 보기
bannerController.getBanners = async (req,res) =>{
    const bng_idx = req.params.bng_id;
    try {
        const banners = await bannerModel.getBanners(bng_idx);
        return res.status(200).json(banners);
    }catch (e){
    console.error(e)
    }
}
//배너 등록하기
bannerController.addBanner = async (req,res) =>{
    const newBanner = {
        bng_key : req.body?.bng_key ?? '' ,
        ban_name : req.body?.ban_name ?? '',
        ban_link_url : req.body?.ban_link_url ?? '',
        ban_timer_start : req.body?.ban_timer_start ??'',
        ban_timer_end : req.body?.ban_timer_end ??'',
        ban_ext1 : req.body?.ban_ext1??'',
        ban_ext2 : req.body?.ban_ext2??'',
        ban_ext3 : req.body?.ban_ext3??'',
        ban_ext4 : req.body?.ban_ext4??'',
        ban_ext5 : req.body?.ban_ext5??''
    };
    try {
        // 파일 업로드 경로 생성
        const banFilePath = req.file ? `/files/images/banner/${req.file.filename}` : '';
        console.log(banFilePath,333)
        newBanner.ban_filepath = banFilePath;
        const banners = await bannerModel.addBanners(newBanner);
        return res.status(200).json({message: `배너${banners} 등록 성공`});
    }catch (e){
        console.error(e)
    }
}
//배너 수정하기
bannerController.editBanner = async (req,res) =>{
    const bannerData = {
        ban_idx : req.body.ban_idx,
        bng_key : req.body?.bng_key ?? '' ,
        ban_name : req.body?.ban_name ?? '',
        ban_link_url : req.body?.ban_link_url ?? '',
        ban_timer_start : req.body?.ban_timer_start ??'',
        ban_timer_end : req.body?.ban_timer_end ??'',
        ban_ext1 : req.body?.ban_ext1??'',
        ban_ext2 : req.body?.ban_ext2??'',
        ban_ext3 : req.body?.ban_ext3??'',
        ban_ext4 : req.body?.ban_ext4??'',
        ban_ext5 : req.body?.ban_ext5??''
    };
    try {
        // 파일 업로드 경로 생성
        const banFilePath = req.file ? `/files/images/banner/${req.file.filename}` : '';
        bannerData.ban_filepath = banFilePath;
        const banners = await bannerModel.editBanners(bannerData);
        return res.status(200).json({message: `배너${bannerData.ban_idx} 수정 성공`});
    }catch (e){
        console.error(e)
    }
}
//배너 삭제
bannerController.delBanner = async (req,res) => {
    const ban_idx = req.body.ban_idx;
    try {
        const delBanner = await bannerModel.delBanner(ban_idx);
        return res.status(200).json({message: `배너${ban_idx} 수정 성공`});
    }catch (e){
        console.error(e)
    }
}
/** 모듈 내보내기*/
module.exports = bannerController
