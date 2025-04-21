function GetPapersSearchParams() {
    return {}
}

function LoadPapers(response, block) {
    for (let paper of response.papers) {
        paper = new Paper(paper)
        block.appendChild(paper.Build())
    }

    return response.papers.length
}
