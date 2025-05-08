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

function GetPostData() {
    let text = postTextInput.GetValue()
    if (text === null)
        return null

    let data = new FormData()
    data.append("text", text.replace(/\r?\n/gi, "<br>"))

    for (let image of document.getElementById("new-post-file-input").files)
        data.append("pictures", image)

    return data
}

function AddPost() {
    let data = GetPostData()
    if (data === null)
        return

    let button = document.getElementById("new-post-button")
    button.setAttribute("disabled", "")

    SendRequest("/add-post", data).then(response => {
        button.removeAttribute("disabled")

        if (response.status != SUCCESS_STATUS) {
            ShowNotification({text: `Не удалось добавить пост.<br>Причина: ${response.message}`})
            return
        }

        ClearPost()
        infiniteScroll.Reset()
        infiniteScroll.LoadContent()
    })
}

function ChangeImages() {
    let input = document.getElementById("new-post-file-input")
    let images = document.getElementById("new-post-images")

    images.innerHTML = ""
    images.classList.remove("hidden")

    for (let file of input.files)
        MakeElement(images, {src:  URL.createObjectURL(file)}, "img")
}

function ClearPost() {
    postTextInput.Clear()

    let input = document.getElementById("new-post-file-input")
    let images = document.getElementById("new-post-images")

    input.value = null
    images.innerHTML = ""
}
