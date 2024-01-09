const basicModel = loadModule('basic', 'model')
const basicController = {};
const path = require('path');

// 공지글 쓰기v
basicController.submitPost = async (req, res) => {
    try {
        const {writer, title, content} = req.body;

        if (!writer || !title || !content) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        const post = await basicModel.submitPost(writer, title, content);

        if (!post) {
            return res.status(500).json({ error: "post 등록 실패" });
        }

        return res.status(200).json(post);
    } catch (error) {
        console.error("Error adding post:", error);
        return res.status(500).json({ error: "post 추가 실패" });
    }
};
//게시글 목록을 불러오기
basicController.getPosts = async (req, res) => {
    try {
        const posts = await basicModel.getPosts();

        console.log('posts')
        console.log(posts)
        if (posts === null) {
            return res.status(503).json({ message: "게시글 불러오기 도중 오류 발생" });
        }

        return res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({ error: "Failed to fetch posts" });
    }
};

//게시글 상세 불러오기
basicController.getPostById = async (req, res) => {
    try {
        const postIdx = req.params.idx;

        if (!postIdx) {
            return res.status(403).send("조회할 게시글의 idx값이 없습니다.");
        }

        const post = await basicModel.getPostById(postIdx);
        
        if (!post) {
            return res.status(503).send("Post not found");
        } 
        return res.status(200).json(post);
                 
    } catch (error) {
        console.error("Error fetching post:", error);
        return res.status(500).json({ error: "Failed to fetch post" });
    }
};

// ... 다른 컨트롤러 함수들 ...

module.exports = basicController;
