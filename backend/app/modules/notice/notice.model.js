const noticeModel = {};
const db = database();


// 공지 작성하기(쓰기)v
noticeModel.addPost = async (title, content, subtitle, status) => {
    const db = database();

    let post = null;
    await db('wb_notice').insert({
        not_title: title,
        not_content: content,
        not_subtitle: subtitle,
        not_status : status,
        not_datetime: db.fn.now()
    })
    .then(() => {
        post = {not_title: title, not_content: content, not_subtitle: subtitle, not_status : status };
    })
    .catch((e) => {
        console.log(e);
        post = null;
    });

    return post;
};
//공지글 수정하기 (PUT)v
noticeModel.updatePost = async (not_id, title, content, subtitle, status) => {
    const db = database();    
    let result = null;
    await db('wb_notice')
        .where('not_id', not_id)
        .update({
            not_title: title,
            not_content: content,
            not_subtitle: subtitle,
            not_status : status
        })
        .then(() => {
            result = true;
        })
        .catch((e) => {
            console.log(e);
            result = false;
        });

    return result;
};
// 공지글들 가져오기
noticeModel.getPosts = async (page=0) => {
    const db = database();
    let post = [];
    let query = db
        .select('N.*')
        .from('wb_notice AS N')
        .where('not_status', "Y")

    if(page > 0) { // 페이지가 0보다 큰 경우 페이지네이션을 적용합니다.
        const itemsPerPage = 4; // 페이지 당 아이템 수
        const offset = (page - 1) * itemsPerPage;
        query = query.limit(itemsPerPage).offset(offset);
    }

    await query.then(rows => {
            post = (rows.length > 0) ? rows : null;
        })
        .catch(e => {
            console.error(e);
            post = null;
        });
    return post;
};
//게시글 지우기v
noticeModel.deletePost = async (not_id) => {
    try {
        const deletePost = await db('wb_notice')
            .where('not_id', not_id)
            .update({ not_status: 'N' });


        return deletePost;
    } catch (error) {
        console.error("Failed to delete post:", error);
        return false;
    }
};

module.exports = noticeModel;
