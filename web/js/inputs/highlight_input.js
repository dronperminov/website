class HighlightInput {
    constructor(config) {
        this.block = config.block
        this.lineHeight = config.lineHeight ?? window.innerWidth < 768 ? 17 : 20
        this.buffer = config.buffer ?? 4
        this.regexp = config.regexp
        this.validate = config.validate

        this.gutter = this.block.querySelector(".gutter")
        this.editor = this.block.querySelector(".editor")
        this.highlight = this.editor.querySelector(".editor-highlight")
        this.textarea = this.editor.querySelector(".editor-input")

        this.statusBar = this.block.querySelector(".status-bar")
        this.cursor = this.statusBar.querySelector(".cursor")
        this.status = this.statusBar.querySelector(".status")

        this.textarea.addEventListener("input", () => this.Input())
        this.textarea.addEventListener("change", () => this.Change())
        this.textarea.addEventListener("scroll", (e) => this.Scroll(e))
        this.textarea.addEventListener("keydown", (e) => this.KeyDown(e))
        this.textarea.addEventListener("selectionchange", () => this.UpdateCursor())
        new ResizeObserver(() => this.Highlight()).observe(this.editor)

        this.Init()
    }

    GetValue() {
        return this.textarea.value
    }

    SetValue(value) {
        this.textarea.value = value.replace(/\t/g, "    ")
        this.Input()
        this.Change()

        this.textarea.setSelectionRange(0, 0)
        this.textarea.focus()
    }

    Init() {
        const text = localStorage.getItem("content")
        if (text !== null)
            this.textarea.value = text

        this.Input()
        this.UpdateCursor()

        this.scrollTop = this.textarea.scrollTop
        this.scrollLeft = this.textarea.scrollLeft
    }

    Input() {
        this.lines = this.textarea.value.split(/\n/)
        this.lengths = [0]

        for (let i = 0; i < this.lines.length; i++)
            this.lengths.push(this.lengths[i] + this.lines[i].length + 1)

        this.Highlight()
        this.UpdateLinesClass()
        this.UpdateStatus()
    }

    Change() {
        localStorage.setItem("content", this.textarea.value)
    }

    Scroll(e) {
        if (this.textarea.scrollTop != this.scrollTop) {
            this.scrollTop = this.textarea.scrollTop
            this.Highlight()
        }

        if (this.textarea.scrollLeft != this.scrollLeft) {
            this.scrollLeft = this.textarea.scrollLeft
            this.highlight.style.left = `${-Math.round(this.scrollLeft)}px`;
        }
    }

    KeyDown(e) {
        if (e.key === "Tab") {
            e.preventDefault()
            this.PasteText("  ")
            return
        }
    }

    Copy() {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(this.textarea.value)
            return
        }

        this.textarea.select()
        document.execCommand("copy")
    }

    Clear() {
        this.SetValue("")
    }

    PasteText(newText) {
        const start = this.textarea.selectionStart
        const end = this.textarea.selectionEnd
        const text = this.textarea.value

        this.textarea.value = `${text.substring(0, start)}${newText}${text.substring(end, text.length)}`
        this.Input()
        this.Change()
        this.textarea.setSelectionRange(start + newText.length, start + newText.length)
        this.textarea.focus()
    }

    Highlight() {
        const start = Math.max(0, Math.floor(this.scrollTop / this.lineHeight))
        const end = Math.min(this.lines.length, start + Math.ceil(this.editor.clientHeight / this.lineHeight) + this.buffer)
        const top = start * this.lineHeight - this.scrollTop

        this.gutter.innerHTML = Array.from({length: end - start}, (_, i) => this.Span("line", i + 1 + start)).join("\n")
        this.gutter.style.top = `${top}px`;

        this.highlight.style.top = `${top}px`;
        this.highlight.style.height = `${Math.round((end - start) * this.lineheight)}px`
        this.highlight.innerHTML = this.GetSpanLines(start, end)
    }

    UpdateCursor() {
        const cursor = this.GetCursor()
        let selected = cursor.selected ? `, selected ${cursor.selected} chars` : ""
        this.cursor.innerHTML = `Line ${cursor.line + 1}, column ${cursor.column + 1}${selected}`
    }

    UpdateLinesClass() {
        let digits = 2

        for (let dec = 100; dec <= this.lines.length; dec *= 10)
            digits++

        for (let i = 2; i < 10; i++)
            this.block.classList.remove(`highlight-input-${i}-digits`)

        this.block.classList.add(`highlight-input-${digits}-digits`)
    }

    UpdateStatus() {
        this.status.classList.remove("error-status")
        this.status.classList.remove("success-status")

        const text = this.textarea.value.trim()

        if (text.length === 0)
            return

        if (this.validate(text)) {
            this.status.classList.add("success-status")
        }
        else {
            this.status.classList.add("error-status")
        }
    }

    GetSpanLines(start, end, maxLineLength = 100000) {
        const lines = []

        for (let i = start; i < end; i++) {
            let content

            if (this.lines[i].length > maxLineLength)
                content = this.Span("content", this.RemoveHTML(this.lines[i]))
            else
                content = [...this.lines[i].matchAll(this.regexp).map(match => this.MatchToSpan(match))].join("")

            lines.push(this.Span("line", `${content}${i < end - 1 ? "\n" : ""}`))
        }

        return lines.join("")
    }

    Span(type, value) {
        return `<span class="highlight-input-${type}">${value}</span>`
    }

    MatchToSpan(match) {
        for (let [type, value] of Object.entries(match.groups))
            if (value)
                return this.Span(type.replace(/_/g, "-"), this.RemoveHTML(value))

        return ""
    }

    RemoveHTML(value) {
        return value.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    }

    SetCursor(start, end) {
        this.textarea.setSelectionRange(start, start)
        this.textarea.focus()
        this.textarea.setSelectionRange(start, end)
    }

    GetCursor() {
        const start = Math.min(this.textarea.selectionStart, this.textarea.selectionEnd)
        const end = Math.max(this.textarea.selectionStart, this.textarea.selectionEnd)

        let left = 0
        let right = this.lines.length - 1

        while (left <= right) {
            const mid = left + Math.floor((right - left) / 2)

            if (this.lengths[mid] <= start)
                left = mid + 1
            else
                right = mid - 1
        }

        return {
            line: right,
            column: start - this.lengths[right],
            selected: end - start
        }
    }
}
