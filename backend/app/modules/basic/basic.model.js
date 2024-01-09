const basicModel = {};
const db = database();
const currentDateTime = new Date();
currentDateTime.setHours(currentDateTime.getHours() + 9);

// 공지 작성하기(쓰기)v
basicModel.submitPost = async (writer, title, content) => {
    const db = database();
    let postId = null;

    await db('wb_basic').insert({
        writer: writer,
        title: title,
        content: content,
        status: 'Y',
        reg_datetime: currentDateTime
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
    const db = database();
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
    const db = database();
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

module.exports = basicModel;
