const boardModel = loadModule('board', 'model')
loadModule('products', 'model')
const boardController = {};
const path = require('path');

//게시판 목록 가져오기
boardController.getBoardList = async (req, res) => {
    try {
        const boards = await boardModel.getBoardList();

        if (!boards || boards.length === 0) {
            return res.status(404).json({ error: "No boards found" });
        }

        return res.json(boards);
    } catch (error) {
        console.error("Error fetching boards:", error);
        return res.status(500).json({ error: "Failed to fetch boards" });
    }
};


// 특정 게시판 정보 조회
boardController.getBoard = async (req, res) => {
    try {
        const boardKey = req.params.key;
        console.log(boardKey);
        const board = await boardModel.getBoardByKey(boardKey);

        if (!board) {
            return res.status(404).json({ error: "Board not found" });
        }

        return res.json(board);
    } catch (error) {
        console.error("Error fetching board:", error);
        return res.status(500).json({ error: "Failed to fetch board" });
    }
};

// 특정 게시판의 모든 게시글 조회
boardController.getPosts = async (req, res) => {
    try {
        const boardKey = req.params.key;
        const posts = await boardModel.getPostsByBoardKey(boardKey);
        if (!posts) {
            return res.status(200).json({ message: "게시글이 없습니다" });
        }
        // res.sendFile(path.join(__dirname, 'board_posts.html')); html과 연결하면 json리턴이 안되어서 ㅋㅋ...
        return res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({ error: "Failed to fetch posts" });
    }
};
// 게시글 쓰기
boardController.submitPost = async (req, res) => {
    try {
        const {boardKey, title, content, author } = req.body;

        if (!title || !content || !author) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        const post = await boardModel.addPost(boardKey, title, content, author);

        if (!post) {
            return res.status(500).json({ error: "Failed to add post" });
        }

        return res.json(post);
    } catch (error) {
        console.error("Error adding post:", error);
        return res.status(500).json({ error: "Failed to add post" });
    }
};
//게시글 수정하기
boardController.editPost = async (req, res) => {
    try {
        const {boardKey, postId, title, content, author } = req.body;
        const updated = await boardModel.updatePost(boardKey, postId, title, content, author);

        if (!updated) {
            return res.status(500).json({ error: "Failed to edit post" });
        }

        return res.json({"success": true, "message": "Post updated successfully!"}
        );
    } catch (error) {
        console.error("Error editing post:", error);
        return res.status(500).json({ error: "Failed to edit post" });
    }
};
// 특정 게시글 보기
boardController.getPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await boardModel.getPostById(postId);

        if (!post) {
            return res.status(404).send("Post not found");
        }
        return res.json(post);

    } catch (error) {
        console.error("Error fetching post:", error);
        return res.status(500).json({ error: "Failed to fetch post" });
    }
};
//게시글 삭제하기
boardController.deletePost = async (req, res) => {
    try {
        const postId = req.body.postId;
        const result = await boardModel.deletePost(postId);

        if (result) {
            return res.json({"success": true, "message": "게시글 삭제 완료"}
            );
        } else {
            throw new Error("Failed to delete post in database");
        }
    } catch (error) {
        console.error("Error deleting post:", error);
        return res.status(500).json({ success: false, message: '삭제 도중 에러 발생' });
    }
};

// ... 다른 컨트롤러 함수들 ...

module.exports = boardController;
