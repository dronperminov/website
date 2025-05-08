class JsonFormatter {
    constructor(config) {
        const regexp = new RegExp([
            `(?<delimeter>[{}\\[\\]:,])`,
            `(?<string>"(?:[^"\\\\\\n]|\\\\.)*("|\\n|$))`,
            `(?<number>-?(0|[1-9]\\d*)(\\.\\d+)?(e[+-]\\d+)?)`,
            `(?<json_bool>\\b(true|false)\\b)`,
            `(?<json_null>\\bnull\\b)`,
            `(?<whitespace>\\s+)`,
            `(?<error>.+)`
        ].join("|"), "gi")

        this.block = config.block
        this.block.addEventListener("dragover", (e) => this.DragOver(e))
        this.block.addEventListener("dragleave", (e) => this.DragLeave(e))
        this.block.addEventListener("drop", (e) => this.Drop(e))

        this.maximizeIcon = this.block.querySelector("#maximize-icon")
        this.maximizeIcon.addEventListener("click", () => this.ToggleView())

        this.minimizeIcon = this.block.querySelector("#minimize-icon")
        this.minimizeIcon.addEventListener("click", () => this.ToggleView())

        this.parser = new JsonParser()
        this.input = new HighlightInput({block: config.input, regexp: regexp, validate: (text) => this.ValidateFast(text)})
        this.maxDepth = config.maxDepth
        this.indent = config.indent

        this.maxDepth.addEventListener("change", () => this.GetInputValue(this.maxDepth))
        this.indent.addEventListener("change", () => this.GetInputValue(this.indent))

        this.downloadLink = MakeElement(null, {download: "prettified.json"}, "a")
        this.uploadInput = MakeElement(null, {type: "file", accept: "application/JSON"}, "input")
        this.uploadInput.addEventListener("change", (e) => this.UploadFile(this.uploadInput.files[0]))

        this.uploadReader = new FileReader()
        this.uploadReader.addEventListener("load", (e) => this.SetContent(e.target.result))
    }

    Format() {
        if (!this.ValidateFull())
            return

        const depth = this.GetInputValue(this.maxDepth)
        const indent = this.GetInputValue(this.indent)

        const json = JSON.parse(this.input.GetValue())
        const pretty = this.Stringify(json, 0, depth, indent)
        this.input.SetValue(pretty)
        ShowNotification({header: "Отформатировано", text: "Введённый JSON отформатирован", className: "success-notification"})
    }

    Minimize() {
        if (!this.ValidateFull())
            return

        const json = JSON.parse(this.input.GetValue())
        this.input.SetValue(JSON.stringify(json))
        ShowNotification({header: "Минифицировано", text: "Введённый JSON минифицирован", className: "success-notification"})
    }

    Validate() {
        if (!this.ValidateFull())
            return

        ShowNotification({header: "Всё хорошо", text: "Введённый JSON корректен", className: "success-notification"})
    }

    Download() {
        const file = new Blob([this.input.GetValue()], {type: "json"})
        this.downloadLink.href = URL.createObjectURL(file)
        this.downloadLink.click()
    }

    Upload() {
        this.uploadInput.click()
    }

    ToggleView() {
        this.maximizeIcon.classList.toggle("hidden")
        this.minimizeIcon.classList.toggle("hidden")
        this.block.classList.toggle("json-formatter-full-screen")
        this.block.querySelector(".editor-panel").style.height = ""
    }

    Copy() {
        this.input.Copy()
        ShowNotification({header: "Скопировано", text: "Содержимое JSON скопировано в буфер обмена", className: "success-notification"})
    }

    Clear() {
        if (!confirm("Вы уверены, что хотите очистить введённые данные?"))
            return

        this.input.Clear()
    }

    UploadFile(file) {
        this.uploadReader.readAsText(file)
        this.uploadReader.value = null
    }

    DragOver(e) {
        this.block.classList.add("drag-drop")
        e.stopPropagation()
        e.preventDefault()
    }

    DragLeave(e) {
        this.block.classList.remove("drag-drop")
        e.stopPropagation()
        e.preventDefault()
    }

    Drop(e) {
        this.block.classList.remove("drag-drop")
        e.stopPropagation()
        e.preventDefault()

        this.UploadFile(e.dataTransfer.files[0])
    }

    SetContent(content) {
        this.input.SetValue(content)
    }

    GetInputValue(input) {
        const value = /^-?\d+$/.test(input.value) ? +input.value : +input.getAttribute("data-value")

        const min = input.hasAttribute("min") ? +input.getAttribute("min") : -Infinity
        const max = input.hasAttribute("max") ? +input.getAttribute("max") : Infinity

        input.value = Math.max(min, Math.min(max, value))
        return +input.value
    }

    ValidateFull() {
        const text = this.input.GetValue()
        if (this.ValidateFast(text))
            return true

        try {
            this.parser.Parse(text)
        }
        catch (error) {
            this.input.SetCursor(error.start, error.end)
            ShowNotification({text: error.message, className: "error-notification", time: 3000})
        }

        return false
    }

    ValidateFast(text) {
         try {
            JSON.parse(text)
            return true
        }
        catch (e) {
            return false
        }
    }

    Indent(indent, level) {
        return " ".repeat(indent * level)
    }

    Stringify(value, depth, maxDepth, indent) {
        if (typeof value === "string")
            return JSON.stringify(value)

        if (typeof value === "number" || typeof value === "boolean" || value === null)
            return String(value)

        if (typeof value === "object") {
            if (maxDepth > 0 && depth >= maxDepth)
                return JSON.stringify(value, null, 1).replace(/\{\s+/g, "{").replace(/\s+\}/g, "}").replace(/\[\s+/g, "[").replace(/\s+\]/g, "]").replace(/\s+/g, " ")

            if (Array.isArray(value)) {
                if (value.length === 0)
                    return "[]"

                const values = value.map(item => `${this.Indent(indent, depth + 1)}${this.Stringify(item, depth + 1, maxDepth, indent)}`)
                return `[\n${values.join(",\n")}\n${this.Indent(indent, depth)}]`
            }
            else {
                const keys = Object.keys(value)
                if (keys.length === 0)
                    return "{}"

                const props = keys.map(key => `${this.Indent(indent, depth + 1)}${JSON.stringify(key)}: ${this.Stringify(value[key], depth + 1, maxDepth, indent)}`)
                return `{\n${props.join(",\n")}\n${this.Indent(indent, depth)}}`
            }
        }

        return "null"
    }
}
