function GetPostsSearchParams() {
    return {}
}

function LoadPosts(response, block) {
    for (let post of response.posts) {
        post = Post.FromData(post)
        block.appendChild(post.Build())
    }

    return response.posts.length
}
