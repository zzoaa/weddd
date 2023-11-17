const noticeModel = loadModule('notice', 'model')
loadModule('products', 'model')
const noticeController = {};
const path = require('path');


// 모든 공지글 조회
noticeController.getPosts = async (req, res) => {
    try {
        const page = req.query.page || 0; // 페이지 쿼리가 없다면 기본값은 0입니다.
        const posts = await noticeModel.getPosts(page);
    if (!posts) {
        return res.status(200).json({ message: "공지글이 없습니다" });
    }
        return res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({ error: "Failed to fetch posts" });
    }
};
// 공지글 쓰기v
noticeController.submitPost = async (req, res) => {
    try {
        const {title, content, subtitle, status } = req.body;

        if (!title || !content || !subtitle) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        const post = await noticeModel.addPost(title,subtitle, content,status);

        if (!post) {
            return res.status(500).json({ error: "post없음" });
        }

        return res.json(post);
    } catch (error) {
        console.error("Error adding post:", error);
        return res.status(500).json({ error: "공지 추가 실패" });
    }
};
//공지글 수정하기v
noticeController.editPost = async (req, res) => {
    try {
        const {not_id, title, content, subtitle, status } = req.body;
        const updated = await noticeModel.updatePost(not_id, title, content, subtitle, status);

        if (!updated) {
            return res.status(500).json({ error: "업데이트 데이터 없음" });
        }

        return res.json({"success": true, "message": "Post updated successfully!"}
        );
    } catch (error) {
        console.error("Error editing post:", error);
        return res.status(500).json({ error: "Failed to edit post" });
    }
};
// 특정 게시글 보기
noticeController.getPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await noticeModel.getPostById(postId);
        
        if (!post) {
            return res.status(404).send("Post not found");
        } 
        return res.json(post);
                 
    } catch (error) {
        console.error("Error fetching post:", error);
        return res.status(500).json({ error: "Failed to fetch post" });
    }
};
//공지글 삭제하기v
noticeController.deletePost = async (req, res) => {
    try {
        const not_id = req.body.not_id;
        const result = await noticeModel.deletePost(not_id);

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

module.exports = noticeController;
