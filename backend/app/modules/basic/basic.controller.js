const basicModel = loadModule('basic', 'model')
const basicController = {};
const path = require('path');

// 게시글 쓰기
basicController.submitPost = async (req, res) => {
    try {
        const {writer, title, content} = req.body;

        if (!writer || !title || !content) {
            return res.status(400).json({ error: "글 작성에 필요한 값을 보내주세요." });
        }

        const post = await basicModel.submitPost(writer, title, content);

        if (!post) {
            return res.status(503).json({ error: "post 등록 실패" });
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
            return res.status(400).send("조회할 게시글의 idx값이 없습니다.");
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

//게시글 수정하기
basicController.updatePost = async(req, res) => {
    try {
        const postData = req.body;

        //idx가 실존하는지 || 게시글의 status 상태가 Y인지 검증 -------------------
        const postExist = await basicModel.getPostById(postData.idx);

        if(!postExist) {
            return res.status(503).json({ error: "수정할 게시글을 찾을 수 없습니다." })
        }

        // 카테고리 수정 -------------------------------------------------------
        const updatedPost = await basicModel.updatePost(postData);

        if (!updatedPost) {
            return res.status(503).json({ error: "게시글 수정하기 실패" });
        }

        console.log(`${updatedPost.idx}의 정보 수정 성공`)

        return res.status(200).json(updatedPost);
    } catch (error) {
        console.error("Error updating post:", error);
        return res.status(500).json({ error: "Failed to update post" });
    }
};


// ... 다른 컨트롤러 함수들 ...

module.exports = basicController;
