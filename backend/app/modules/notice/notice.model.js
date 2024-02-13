const noticeModel = {};
const db = database();
const moment = require('moment-timezone');

const getKoreanTime = () => {
    // 'Asia/Seoul' 시간대를 사용하여 현재 한국 시간을 얻습니다.
    return moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
}

const currentDatetime = getKoreanTime() // 현재 날짜 및 시간 얻기

// 공지 작성하기(쓰기)v
noticeModel.addPost = async (mem_idx) => {
    const db = database();

    let postId = null;
    await db('wb_notice').insert({
        not_title: '',
        not_content: '',
        not_subtitle: '',
        not_status : 'T',
        not_datetime: currentDatetime,
        mem_idx: mem_idx
    })
    .then((row) => {
        postId = row
    })
    .catch((e) => {
        console.log(e);
        postId = null;
    });

    return postId[0];
};
//공지글 수정하기 (PUT)v
noticeModel.updatePost = async (mem_idx, updateData) => {
    const db = database();    
    let result = null;

    console.log('updateData')
    console.log(updateData)

    await db('wb_notice')
        .where('not_idx', updateData.not_idx)
        .andWhere('mem_idx', mem_idx)
        .whereNot('not_status', 'N')
        .update({
            not_title: updateData.not_title,
            not_content: updateData.not_content,
            not_subtitle: updateData.not_subtitle,
            thumb_filepath: updateData.thumb_filepath,
            not_status : "Y"
        })
        .then((rows) => {
            console.log('rows')
            console.log(rows)
            result = true;
        })
        .catch((e) => {
            console.log(e);
            result = false;
        });

    return await noticeModel.getPostById(updateData.not_idx);
};
// 공지글들 가져오기
noticeModel.getPosts = async (page=0) => {
    const db = database();
    let post = [];
    let query = db
        .select('N.*')
        .from('wb_notice AS N')
        .where('not_status', "Y")
        .orderBy('N.not_datetime', 'desc')

    if(page > 0) { // 페이지가 0보다 큰 경우 페이지네이션을 적용합니다.
        const itemsPerPage = 4; // 페이지 당 아이템 수
        const offset = (page - 1) * itemsPerPage;
        query = query.limit(itemsPerPage).offset(offset);
    }

    await query.then(rows => {
        post = (rows.length > 0) ? rows : [];
    })
        .catch(e => {
            console.error(e);
            post = null;
        });
    return post;
};
// 공지글 개별 조회
noticeModel.getPostById = async (not_idx) => {
    const db = database();
    let post = null;

    await db
        .select('N.*')
        .from('wb_notice AS N')
        .where('N.not_idx', not_idx)
        .whereNot('N.not_status', "N")
        .then(row => {
            // console.log('row:')
            // console.log(row)
            post = row? row[0] : null;
        })
        .catch(e => {
            console.error(e);
            post = null;
        });
    return post;
};
//게시글 지우기v
noticeModel.deletePost = async (not_idx) => {
    try {
        const deletePost = await db('wb_notice')
            .where('not_idx', not_idx)
            .update({ not_status: 'N' });

        return deletePost;
    } catch (error) {
        console.error("Failed to delete post:", error);
        return false;
    }
};

module.exports = noticeModel;
