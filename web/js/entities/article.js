class Article {
    constructor(data) {
        this.articleId = data.article_id
        this.title = data.title
        this.datetime = new Date(data.datetime)
        this.link = data.link
        this.preview = new Picture(data.preview)
        this.intro = data.intro
        this.tags = data.tags
    }

    Build() {
        let article = MakeElement(null, {itemscope: "", itemtype: "http://schema.org/Article"}, "article")

        MakeElement(article, {itemprop: "url", content: `/articles/${this.link}`}, "meta")
        MakeElement(article, {itemprop: "inLanguage", content: "ru-RU"}, "meta")

        this.BuildAuthor(article)
        MakeElement(article, {class: "datetime", innerText: this.FormatDatetime(), itemprop: "datePublished", content: this.datetime.toISOString()}, "time")
        MakeElement(article, {class: "title", href: `/articles/${this.link}`, innerText: this.title, itemprop: "headline name"}, "a")

        this.BuildTags(article)
        this.BuildPreview(article)

        MakeElement(article, {class: "intro", innerHTML: this.intro})
        return article
    }

    BuildAuthor(parent) {
        let author = MakeElement(parent, {class: "author", itemprop: "author", itemscope: "", itemtype: "http://schema.org/Person"})

        let avatarLink = MakeElement(author, {href: "/"}, "a")
        MakeElement(avatarLink, {src: "/images/profiles/dronperminov.jpg", alt: "dronperminov avatar"}, "img")

        let usernameLink = MakeElement(author, {class: "link", href: "/", itemprop: "url"}, "a")
        MakeElement(usernameLink, {itemprop: "name", innerText: "dronperminov"}, "span")
    }

    BuildTags(parent) {
        let tags = MakeElement(parent, {class: "tags"})

        for (let tag of this.tags) {
            if (tags.children.length > 0)
                MakeElement(tags, {innerText: ", "}, "span")

            MakeElement(tags, {class: "tag", innerText: tag}, "span") // TODO: make link
        }
    }

    BuildPreview(parent) {
        let preview = MakeElement(parent, {class: "preview", itemprop: "image", itemscope: "", itemtype: "http://schema.org/ImageObject"})
        let link = MakeElement(preview, {href: `/articles/${this.link}`}, "a")
        MakeElement(link, {src: this.preview.previewUrl, itemprop: "url contentUrl", alt: this.title}, "img")
    }

    FormatDatetime() {
        let delta = (new Date() - this.datetime) / 1000 / 60

        if (delta < 1)
            return "только что"

        if (delta < 60)
            return GetWordForm(Math.floor(delta), ["минуту назад", "минуты назад", "минут назад"])

        if (delta < 60 * 24)
            return GetWordForm(Math.floor(delta / 60), ["час назад", "часа назад", "часов назад"])

        const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]

        let day = `${this.datetime.getDate()}`.padStart(2, "0")
        let month = months[this.datetime.getMonth()]
        let year = this.datetime.getFullYear()

        let hours = `${this.datetime.getHours()}`.padStart(2, "0")
        let minutes = `${this.datetime.getMinutes()}`.padStart(2, "0")
        return `${day} ${month} ${year} в ${hours}:${minutes}`
    }
}
