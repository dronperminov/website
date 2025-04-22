class CodeHighlight {
    Highlight(block) {
        let lang = block.getAttribute("data-lang")
        let text = block.innerText.trim()
        let spans = []

        if (lang == "js")
            spans = this.ParseJS(text)
        else if (lang == "html")
            spans = this.ParseHTML(text)

        block.innerHTML = this.AddNewLines(spans).join("").trim()

        this.SetLinesClass(block, text)
    }

    SetLinesClass(block, text) {
        for (let name of ["code-two-digits", "code-three-digits"])
            block.classList.remove(name)

        let lines = text.split("\n").length

        if (lines > 9) {
            block.classList.add("code-two-digits")
        }
        else if (lines > 99) {
            block.classList.add("code-three-digits")
        }
    }

    ParseJS(text) {
        let regexp = new RegExp([
            `(?<line>\\n)`,
            `(?<whitespace>\\s+)`,
            `(?<comment>//.*|/\\*.+\\*/)`,
            `(?<keyword>\\b(if|for|while|class|const|let|var|function|return|new|this|constructor)\\b)`,
            `(?<namespace>\\b(Math|console|navigator)\\b)`,
            `(?<number>(-?\\d+(\\.\\d*)?([eE][-+]?\\d+)?|0b[01]+|0o[0-7]+|0x[0-9a-fA-F]+))`,
            `(?<string>'[^']+'|"[^"]+"|\`[^\`]+\`)`,
            `(?<identifier>\\b[a-zA-Z_]\\w*\\b)`,
            `(?<operator>([=+\\-*/%<>]|==|===|<=|>=|!=|\\?\\?|\\.\\.\\.))`,
            `(?<punctuation>[;:.,(){}\\[\\]])`,
            `(?<other>.+)`
        ].join("|"), "g")

        return this.Parse(text, regexp)
    }

    ParseHTML(text) {
        let regexp = new RegExp([
            `(?<line>\\n)`,
            `(?<doctype>(?<=<)!DOCTYPE[^>]*(?=>))`,
            `(?<comment><!--|-->)`,
            `(?<bracket><|>)`,
            `(?<slash>/)`,
            `(?<equals>=)`,
            `(?<attribute_value>"[^"]*"|'[^']*')`,
            `(?<attribute>\\b[a-zA-Z_:][a-zA-Z0-9_:\\-]*\\b)(?=\\s*=)`,
            `(?<tag>\\b[a-zA-Z][a-zA-Z0-9-]*\\b)(?=[\\s>/])`,
            `(?<whitespace>\\s+)`,
            `(?<other>[^<>"'=\\s][^<>]*)`
        ].join("|"), "g")

        let last = 0
        let spans = []

        for (let match of text.matchAll(/(?<=<script\b[^>]*>)([\s\S]*?)(?=<\/script>)/gi)) {
            let [fullMatch, innerScript] = match
            spans.push(...this.Parse(text.slice(last, match.index), regexp))
            spans.push(...this.ParseJS(innerScript))
            last = match.index + fullMatch.length
        }

        spans.push(...this.Parse(text.slice(last), regexp))
        return spans
    }

    Parse(text, regexp) {
        let spans = []

        for (let match of text.matchAll(regexp)) {
            let token = this.MatchToToken(match)
            spans.push(token.type == "line" ? "\n" : `<span class="code-${token.type}">${token.value}</span>`)
        }

        return spans
    }

    MatchToToken(match) {
        for (let [type, value] of Object.entries(match.groups))
            if (value)
                return {type: type.replace("_", "-"), value: value.replace("<", "&lt;").replace(">", "&gt;")}

        return null
    }

    AddNewLines(spans) {
        return ["\n", ...spans].map(span => span == "\n" ? '\n<span class="code-line"></span>' : span)
    }
}
