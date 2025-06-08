class JsonParseError extends Error {
    constructor(message, start, end) {
        super(message)
        this.start = start
        this.end = end
    }
}

class JsonParser {
    constructor() {
        this.regexp = new RegExp([
            `(?<delimeter>[{}\\[\\]:,])`,
            `(?<string>"(?:[^"\\\\\\n]|\\\\.)*["\\n])`,
            `(?<number>-?(0|[1-9]\\d*)(\\.\\d+)?(e[+-]\\d+)?)`,
            `(?<bool>\\b(true|false)\\b)`,
            `(?<null>\\bnull\\b)`,
            `(?<other>\\S)`
        ].join("|"), "gi")
    }

    Parse(text) {
        this.length = text.length
        this.tokens = [...text.matchAll(this.regexp).map(match => this.MatchToToken(match))]
        this.token = this.tokens.length ? this.tokens[0] : null
        this.index = 0
        this.ParseElement()

        if (this.token)
            throw new JsonParseError(`Лишние токены за концом содержимого ("${this.tokens[this.index].value}")`, this.tokens[this.index].start, this.length)
    }

    ParseElement() {
        if (this.token?.type === "[") {
            this.ParseList()
        }
        else if (this.token?.type === "{") {
            this.ParseObject()
        }
        else if (this.token?.type === "string") {
            this.ParseString()
        }
        else {
            this.Consume(["number", "bool", "null", "line"], "ожидалось число, true, false или null")
        }
    }

    ParseString() {
        const token = this.Consume(["string"], "ожидалась строка")

        if (!token.value.endsWith('"'))
            throw new JsonParseError("Ожидалась закрывающая кавычка", token.start, token.end)

        const escapes = /\\./gi
        for (const match of token.value.matchAll(escapes))
            if (!/^\\(["\\\/bfnrt]|u[\da-f]{4})$/gi.test(match[0]))
                throw new JsonParseError(`Обнаружена некорректная последовательность экранирования: "${match[0]}"`, token.start, token.end)
    }

    ParseKeyVaLue() {
        this.ParseString()
        this.Consume([":"], "ожидалось двоеточие")
        this.ParseElement()
    }

    ParseList() {
        this.Consume(["["], "ожидалась открывающая квадратная скобка")

        if (this.token?.type !== "]") {
            this.ParseElement()

            while (this.token?.type === ",") {
                this.Consume([","], "ожидалась запятая")
                this.ParseElement()
            }
        }

        this.Consume(["]"], "ожидалась закрывающая квадратная скобка")
    }

    ParseObject() {
        this.Consume(["{"], "ожидалась открывающая фигурная скобка")

        if (this.token?.type !== "}") {
            this.ParseKeyVaLue()

            while (this.token?.type === ",") {
                this.Consume([","], "ожидалась запятая")
                this.ParseKeyVaLue()
            }
        }

        this.Consume(["}"], "ожидалась закрывающая фигурная скобка")
    }

    Consume(types, expectedMessage) {
        const token = this.token

        if (token === null)
            throw new JsonParseError(`Содержимое неожиданно закончилось, ${expectedMessage}`, this.length, this.length)

        if (types.indexOf(token.type) === -1)
            throw new JsonParseError(`Некорректный токен "${token.value}", ${expectedMessage}`, token.start, token.end)

        this.token = ++this.index < this.tokens.length ? this.tokens[this.index] : null
        return token
    }

    MatchToToken(match) {
        for (let [type, value] of Object.entries(match.groups))
            if (value)
                return {type: type === "delimeter" ? value : type, value: value, start: match.index, end: match.index + value.length}

        return null
    }
}
