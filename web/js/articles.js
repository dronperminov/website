function GetArticlesSearchParams() {
    return {}
}

function LoadArticles(response, block) {
    for (let article of response.articles) {
        article = new Article(article)
        block.appendChild(article.Build())
    }

    return response.articles.length
}
