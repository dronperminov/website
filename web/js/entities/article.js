class Article {
    constructor(data) {
        this.title = data.title
        this.authors = data.authors
        this.date = new Date(data.date)
        this.pdfLink = data.pdf_link
        this.link = data.link
    }

    Build() {
        let block = MakeElement(null, {class: "article"})
        this.BuildTitle(block)
        this.BuildAuthors(block)

        return block
    }

    BuildTitle(parent) {
        let title = MakeElement(parent, {class: "article-title"})

        if (this.pdfLink) {
            let link = MakeElement(title, {href: this.pdfLink, target: "_blank"}, "a")
            MakeElement(link, {class: "icon", src: "/images/icons/pdf.svg"}, "img")
            MakeElement(title, {innerText: " "}, "span")
        }

        if (this.link)
            MakeElement(title, {href: this.link, target: "_blank", innerText: this.title}, "a")
        else
            MakeElement(title, {innerText: this.title}, "span")

        MakeElement(title, {innerText: ` (${this.date.getFullYear()})`}, "span")
    }

    BuildAuthors(parent) {
        let authors = MakeElement(parent, {class: "article-authors"})
        MakeElement(authors, {class: "highlight", innerText: `Автор${this.authors.length > 1 ? "ы" : ""} `}, "b")
        MakeElement(authors, {innerText: ": "}, "span")

        for (let i = 0; i < this.authors.length; i++) {
            if (i > 0)
                MakeElement(authors, {innerText: ", "}, "span")

            MakeElement(authors, {innerText: this.authors[i]}, this.authors[i] == "Перминов А.И." ? "b" : "span")
        }
    }
}
