const SHARE_ICON = `<svg width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M13.803 5.33333C13.803 3.49238 15.3022 2 17.1515 2C19.0008 2 20.5 3.49238 20.5 5.33333C20.5 7.17428 19.0008 8.66667 17.1515 8.66667C16.2177 8.66667 15.3738 8.28596 14.7671 7.67347L10.1317 10.8295C10.1745 11.0425 10.197 11.2625 10.197 11.4872C10.197 11.9322 10.109 12.3576 9.94959 12.7464L15.0323 16.0858C15.6092 15.6161 16.3473 15.3333 17.1515 15.3333C19.0008 15.3333 20.5 16.8257 20.5 18.6667C20.5 20.5076 19.0008 22 17.1515 22C15.3022 22 13.803 20.5076 13.803 18.6667C13.803 18.1845 13.9062 17.7255 14.0917 17.3111L9.05007 13.9987C8.46196 14.5098 7.6916 14.8205 6.84848 14.8205C4.99917 14.8205 3.5 13.3281 3.5 11.4872C3.5 9.64623 4.99917 8.15385 6.84848 8.15385C7.9119 8.15385 8.85853 8.64725 9.47145 9.41518L13.9639 6.35642C13.8594 6.03359 13.803 5.6896 13.803 5.33333Z"/>
</svg>`

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

        throw new Error(`Unknown post type "${data.post_type}"`)
    }

    GetTitle(maxLength = 0) {
        let span = MakeElement(null, {innerHTML: this.text}, "span")
        let title = span.innerText

        if (maxLength == 0)
            return title

        return `${title.substr(0, maxLength)}${title.length > maxLength ? "..." : ""}`
    }

    Build() {
        return MakeElement(null, {class: "post"}, "section")
    }

    BuildPage() {
        return this.Build()
    }

    BuildBottom(post) {
        let bottom = MakeElement(post, {class: "post-bottom"})
        this.BuildTime(bottom)
        this.BuildShare(bottom)
    }

    BuildText(post) {
        MakeElement(post, {class: "post-text", innerHTML: this.text})
    }

    BuildShare(post) {
        let icon = MakeElement(post, {class: "post-icon", innerHTML: SHARE_ICON, title: "Поделиться"})

        icon.addEventListener("click", async () => {
            await navigator.share({
                title: "Пост из блога Андрея Перминова",
                text: this.GetTitle(),
                url: `https://dronperminov.ru/post/${this.postId}`
            })
        })
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

    BuildPage() {
        let post = super.Build()
        this.BuildTime(post)
        this.BuildText(post)
        this.BuildBottom(post)
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
        this.BuildBottom(post)
        return post
    }

    BuildPage() {
        let post = super.Build()
        this.BuildTime(post)
        this.BuildText(post)
        this.BuildPictures(post)
        return post
    }

    BuildPictures(post) {
        let gallery = new Gallery()
        let layout = PicturesLayout.GetLayout(this.pictures)
        let pictures = MakeElement(post, {class: `post-pictures ${layout}`})

        for (let i = 0; i < this.pictures.length; i++) {
            let picture = MakeElement(pictures, {class: "post-picture"})
            let aspectRatio = this.pictures[i].width / this.pictures[i].height
            let image = MakeElement(picture, {src: this.pictures[i].preview_url, style: `aspect-ratio: ${aspectRatio}`}, "img")
            image.addEventListener("click", e => gallery.ShowPhoto(i))
            gallery.AddPhoto({url: this.pictures[i].url})
        }
    }
}
