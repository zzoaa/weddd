const basicModel = {};
const db = database();
const currentDateTime = new Date();
currentDateTime.setHours(currentDateTime.getHours() + 9);

// 공지 작성하기(쓰기)v
basicModel.submitPost = async (writer, title, content) => {
    let postId = null;

    await db('wb_basic').insert({
        writer: writer,
        title: title,
        content: content,
        status: 'Y',
        reg_datetime: currentDateTime,
        upd_datetime: currentDateTime
    })
    .then((newId) => {
        postId = newId;
    })
    .catch((e) => {
        console.log(e);
        postId = null;
    });

    return postId;
};
//게시글 목록을 불러오기
basicModel.getPosts = async (page=0) => {
    let postlist = null;

    await db
        .select('*')
        .from('wb_basic')
        .where('status', "Y")
        .then(rows => {
            postlist = (rows.length > 0) ? rows : [];
        })
        .catch((e) => {
            console.log(e);
            postlist = null;
        });

    return postlist;
};

//게시글 상세 불러오기
basicModel.getPostById = async (idx) => {
    let postById = null;

    await db
        .select('*')
        .from('wb_basic')
        .where('idx', idx)
        .andWhere('status','Y')
        .limit(1)
        .then(rows => {
            postById = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            postById = null;
        });
    return postById;
};

//게시글 수정하기
basicModel.updatePost = async (postData) => {
    await db('wb_basic')
        .where('idx', postData.idx)
        .andWhere('status', 'Y')
        .update({
            writer: postData.writer,
            title: postData.title,
            content: postData.content,
            upd_datetime: currentDateTime
        })
        .catch((e) => {
            console.log(e);
            return null;
        });

    // 업데이트된 내용(id와 title)을 반환합니다.
    return await basicModel.getPostById(postData.idx); // 또는 필요에 따라 업데이트된 내용 반환
}

//게시글 삭제하기
basicModel.deletePost = async (idx) => {
    await db('wb_basic')
        .where('idx', idx)
        .andWhere('status', 'Y')
        .update({
            status: 'N',
            exp_datetime: currentDateTime
        })
        .catch((e) => {
            console.log(e);
            return false;
        });

    return true; // 또는 필요에 따라 업데이트된 내용 반환
}
module.exports = basicModel;
