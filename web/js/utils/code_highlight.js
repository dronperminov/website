class CodeHighlight {
    Highlight(block) {
        let lang = block.getAttribute("data-lang")
        let text = block.innerText.trim()
        let spans = []

        if (lang == "js")
            spans = this.ParseJS(text)
        else if (lang == "html")
            spans = this.ParseHTML(text)
        else if (lang == "css")
            spans = this.ParseCSS(text)
        else if (lang == "math")
            spans = this.ParseMath(text)
        else
            spans = this.ParseText(text)

        block.innerHTML = this.AddNewLines(spans).join("").trim()

        if (!block.classList.contains("code-no-lines"))
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
            `(?<whitespace> +)`,
            `(?<comment>//.*|/\\*.+\\*/)`,
            `(?<keyword>\\b(if|else|for|while|class|const|let|var|function|return|new|this|extends|constructor|continue|break|throw|try|catch|in|of)\\b)`,
            `(?<js_namespace>\\b(Math|console|navigator|document|window|Array|Set|Map|RegExp|Error|BigInt|Object)\\b)`,
            `(?<number>(-?\\d+(\\.\\d*)?([eE][-+]?\\d+)?|0b[01]+|0o[0-7]+|0x[0-9a-fA-F]+|\\btrue\\b|\\bfalse\\b|\\bnull\\b))`,
            `(?<string>'[^']*'|"[^"]*"|\`[^\`]*\`)`,
            `(?<js_function>\\b[a-zA-Z_]\\w*\\b)(?=\\()`,
            `(?<js_identifier>\\b[a-zA-Z_]\\w*\\b)`,
            `(?<js_operator>(=>|\\|\\||&&|===|[=+\\-*/%<>^&\\|]=?|!=|=|\\?\\?|\\.\\.\\.|!|~))`,
            `(?<punctuation>[;:.,?(){}\\[\\]])`,
            `(?<other>.+)`
        ].join("|"), "g")

        let subparse = {
            "string": (value) => this.ParseFormatStringJS(value)
        }

        return this.Parse(text, regexp, subparse)
    }

    ParseFormatStringJS(text) {
        if (!text.startsWith("`") || !text.endsWith("`"))
            return `<span class="code-string">${text}</span>`

        let spans = []
        let last = 0

        for (let match of text.matchAll(/(?<=\${)([\s\S]*?)(?=})/gi)) {
            let [fullMatch, innerScript] = match
            spans.push(`<span class="code-string">${text.slice(last, match.index)}</span>`)
            spans.push(...this.ParseJS(innerScript))
            last = match.index + fullMatch.length
        }

        spans.push(`<span class="code-string">${text.slice(last)}</span>`)
        return spans
    }

    ParseHTML(text) {
        let regexp = new RegExp([
            `(?<line>\\n)`,
            `(?<html_doctype>(?<=<)!DOCTYPE[^>]*(?=>))`,
            `(?<comment><!--.*-->)`,
            `(?<punctuation><|>|/|=)`,
            `(?<html_attribute_value>"[^"]*"|'[^']*')`,
            `(?<html_attribute>\\b[a-zA-Z_:][a-zA-Z0-9_:\\-]*\\b)(?=\\s*=)`,
            `(?<html_tag>\\b[a-zA-Z][a-zA-Z0-9-]*\\b)(?=[\\s>/])`,
            `(?<whitespace> +)`,
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

    ParseCSS(text) {
        let regexp = new RegExp([
            `(?<line>\\n)`,
            `(?<comment>/\\*[\\s\\S]*?\\*/)`,
            `(?<string>"[^"]*"|'[^']*')`,
            `(?<keyword>(!important|@[a-zA-Z][\\w-]+|var)\\b)`,
            `(?<css_pseudo>::?[a-zA-Z0-9_-]+)(?=[^\\n]*{)`,
            `(?<css_class>[.#][a-zA-Z0-9_-]+)(?=[^\\n]*{)`,
            `(?<css_tag>\\b[a-zA-Z][a-zA-Z0-9_-]*\\b|\\*)(?=[^;]*{)`,
            `(?<number>\\b\\d+(\\.\\d+)?|#[a-fA-F\\d]{6}|#[a-fA-F\\d]{3})`,
            `(?<punctuation>[{}:;,.%>+~()\\[\\]=])`,
            `(?<css_property>[a-zA-Z][a-zA-Z0-9_-]*)(?=\\s*:)`,
            `(?<css_identifier>[a-zA-Z_-][a-zA-Z0-9_-]*)`,
            `(?<whitespace>\\s+)`,
            `(?<other>.+)`
        ].join("|"), "g")

        return this.Parse(text, regexp)
    }

    ParseMath(text) {
        let functions = [
            "sin", "cos", "tg", "tan", "ctg", "cot", "sec", "cosec",
            "arcsin", "asin", "arccos", "acos", "arctg", "atan",
            "sh", "sinh", "ch", "cosh", "th", "tanh", "cth", "coth", "sech", "sch", "csch",
            "arsh", "asinh", "arch", "acosh", "arth", "atanh",
            "ln", "lg", "exp", "sqrt", "cbrt", "abs", "sign",
            "max", "min", "pow", "log", "root"
        ]

        let regexp = new RegExp([
            `(?<whitespace>\\s+)`,
            `(?<punctuation>[(),])`,
            `(?<math_operator>[-+*/^])`,
            `(?<math_function>${functions.join("|")})`,
            `(?<number>\\d+(\\.\\d+)?|\\b(pi|π|e)\\b)`,
            `(?<math_variable>[a-z]\\w*)`,
            `(?<unknown>.+?)`
        ].join("|"), "gi")

        return this.Parse(text, regexp)
    }

    ParseText(text) {
        return this.Parse(text, new RegExp(`(?<line>\\n)|(?<other>.+)`, "g"))
    }

    Parse(text, regexp, subparse = null) {
        let spans = []

        for (let match of text.matchAll(regexp)) {
            let token = this.MatchToToken(match)

            if (subparse && token.type in subparse)
                spans.push(...subparse[token.type](token.value))
            else
                spans.push(token.type == "line" ? "\n" : `<span class="code-${token.type}">${token.value}</span>`)
        }

        return spans
    }

    MatchToToken(match) {
        for (let [type, value] of Object.entries(match.groups))
            if (value)
                return {type: type.replace(/_/g, "-"), value: value.replace("<", "&lt;").replace(">", "&gt;")}

        return null
    }

    AddNewLines(spans) {
        return ["\n", ...spans].map(span => span == "\n" ? '\n<span class="code-line"></span>' : span)
    }
}
