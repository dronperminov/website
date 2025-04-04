class Post {
    constructor(data) {
        this.postId = data.post_id
        this.postType = data.post_type
        this.timestamp = new Date(data.timestamp)
        this.text = data.text
    }

    static FromData(data) {
        if (data.post_type == "text")
            return new TextPost(data)

        if (data.post_type == "picture")
            return new PicturePost(data)
    }

    Build() {
        return MakeElement(null, {class: "post"}, "section")
    }

    BuildText(post) {
        MakeElement(post, {class: "post-text", innerText: this.text})
    }

    BuildTime(post) {
        MakeElement(post, {class: "post-time", innerText: this.GetTime()})
    }

    GetTime() {
        let day = `${this.timestamp.getDate()}`.padStart(2, "0")
        let month = `${this.timestamp.getMonth() + 1}`.padStart(2, "0")
        let year = `${this.timestamp.getFullYear()}`

        let hour = `${this.timestamp.getHours()}`.padStart(2, "0")
        let minute = `${this.timestamp.getMinutes()}`.padStart(2, "0")

        return `${day}.${month}.${year} в ${hour}:${minute}`
    }
}

class TextPost extends Post {
    constructor(data) {
        super(data)
    }

    Build() {
        let post = super.Build()
        this.BuildText(post)
        this.BuildTime(post)
        return post
    }
}

class PicturePost extends Post {
    constructor(data) {
        super(data)
        this.pictures = data.pictures
    }

    Build() {
        let post = super.Build()
        this.BuildPictures(post)
        this.BuildText(post)
        this.BuildTime(post)
        return post
    }

    BuildPictures(post) {
        let gallery = new Gallery()
        let pictures = MakeElement(post, {class: "post-pictures"})

        for (let i = 0; i < this.pictures.length; i++) {
            let image = MakeElement(pictures, {src: this.pictures[i].preview_url}, "img")
            image.addEventListener("click", e => gallery.ShowPhoto(i))
            gallery.AddPhoto({url: this.pictures[i].url})
        }

        if (this.pictures.length == 2) {
            pictures.style.gridTemplateColumns = `1fr ${this.pictures[1].height / this.pictures[0].height}fr`
        }
        else if (this.pictures.length == 4) {
            pictures.style.gridTemplateColumns = "1fr 1fr"
        }
    }
}
