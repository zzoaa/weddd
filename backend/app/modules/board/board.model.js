const boardModel = {};
const db = database();
//게시판 목록 가져오기
boardModel.getBoardList = async () => {
    let boards = null;
    await db
        .select('*')
        .from('wb_board')
        .then(rows => {
            boards = (rows.length > 0) ? rows : null;
        })
        .catch((e) => {
            console.log(e);
            boards = null;
        });

    return boards;
};

// 게시판 키를 기반으로 게시판 정보를 가져옵니다.
boardModel.getBoardByKey = async (key) => {
    let board = null;
    await db
        .select('*')
        .from('wb_board')
        .where('brd_key', key)
        .limit(1)
        .then(rows => {
            board = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            board = null;
        });

    return board;
}

// 게시판 키를 기반으로 해당 게시판의 모든 게시물을 가져옵니다.
boardModel.getPostsByBoardKey = async (boardKey) => {
    let posts = [];

    await db
        .select('*')
        .from('wb_board_post')
        .where('brd_key', boardKey)
        .then(rows => {
            posts = (rows.length > 0) ? rows : null;
        })
        .catch((e) => {
            console.log(e);
            posts = null;
        });

    return posts;
};

// 특정 게시물의 ID를 기반으로 게시물 정보를 가져옵니다.
boardModel.getPostById = async (postId) => {
    let post = null;

    await db
        .select('P.*')
        .from('wb_board_post AS P')
        .where('post_idx', postId)
        .limit(1)
        .then(rows => {
            post = (rows.length > 0) ? rows[0] : null;
        })
        .catch((e) => {
            console.log(e);
            post = null;
        });

    return post;
}
// 게시글 작성하기(쓰기)
boardModel.addPost = async (boardKey, title, content, author) => {
    const db = database();

    let post = null;
    await db('wb_board_post').insert({
        brd_key: boardKey,
        post_title: title,
        post_content: content,
        post_nickname: author
    })
    .then(() => {
        post = { brd_key: boardKey, post_title: title, post_content: content, post_nickname: author };
    })
    .catch((e) => {
        console.log(e);
        post = null;
    });

    return post;
};
//게시글 수정하기 (PUT?)
boardModel.updatePost = async (boardKey, postId, title, content, author) => {
    const db = database();    
    let result = null;
    await db('wb_board_post')
        .where('brd_key', boardKey)
        .andWhere('post_idx', postId)
        .update({
            post_title: title,
            post_content: content,
            post_nickname: author,
            upd_datetime: db.fn.now()
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
// 게시글 하나 가져오기
boardModel.getPostById = async (postId) => {
    const db = database();
    let post = null;
    await db
        .select('P.*')
        .from('wb_board_post AS P')
        .where('post_idx', postId)
        .limit(1)
        .then(rows => {
            post = (rows.length > 0) ? rows[0] : null;
        })
        .catch(e => {
            console.error(e);
            post = null;
        });
    return post;
};
//게시글 지우기
boardModel.deletePost = async (postId) => {
    try {
        console.log(postId);
        const deletePost = await db('wb_board_post')
            .where('post_idx', postId)
            .update({ post_status: 'N' });


        return deletePost;
    } catch (error) {
        console.error("Failed to delete post:", error);
        return false;
    }
};

module.exports = boardModel;
