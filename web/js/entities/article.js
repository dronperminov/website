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
        let article = MakeElement(null, {class: "article"})

        MakeElement(article, {class: "article-datetime", innerText: this.FormatDatetime()})
        MakeElement(article, {class: "article-title", href: `/articles/${this.link}`, innerText: this.title}, "a")

        this.BuildTags(article)
        this.BuildPreview(article)

        MakeElement(article, {class: "article-intro", innerHTML: this.intro})
        return article
    }

    BuildTags(parent) {
        let tags = MakeElement(parent, {class: "article-tags"})

        for (let tag of this.tags) {
            if (tags.children.length > 0)
                MakeElement(tags, {innerText: ", "}, "span")

            MakeElement(tags, {class: "article-tag", innerText: tag}, "span") // TODO: make link
        }
    }

    BuildPreview(parent) {
        let preview = MakeElement(parent, {class: "article-preview"})
        let link = MakeElement(preview, {href: `/articles/${this.link}`}, "a")
        MakeElement(link, {src: this.preview.previewUrl}, "img")
    }

    FormatDatetime() {
        let delta = (new Date() - this.datetime) / 1000 / 60

        if (delta < 1)
            return "только что"

        if (delta < 60)
            return GetWordForm(Math.floor(delta), ["минуту назад", "минуты назад", "минут назад"])

        if (delta < 60 * 24)
            return GetWordForm(Math.floor(delta / 60), ["час назад", "часа назад", "часов назад"])

        let hours = `${this.datetime.getHours()}`.padStart(2, "0")
        let minutes = `${this.datetime.getMinutes()}`.padStart(2, "0")

        if (delta < 60 * 24 * 2)
            return `вчера в ${hours}:${minutes}`

        const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]

        let day = `${this.datetime.getDate()}`.padStart(2, "0")
        let month = months[this.datetime.getMonth()]
        let year = this.datetime.getFullYear()
        return `${day} ${month} ${year} в ${hours}:${minutes}`
    }
}
