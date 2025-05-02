class InvalidLiteralsError extends Error {
    constructor(tokens) {
        super(`обнаружены недопустимые символы: ${tokens.map(token => token.value).join(", ")}`)
        this.tokens = tokens
    }
}

class ExpressionTokenizer {
    constructor(functions, constants) {
        this.regexp = new RegExp([
            `(?<left_parenthesis>\\()`,
            `(?<right_parenthesis>\\))`,
            `(?<delimeter>,)`,
            `(?<operator>[-+*/^])`,
            `(?<function>${functions.join("|")})`,
            `(?<constant>\\b(${constants.join("|")})\\b)`,
            `(?<number>\\d+(\\.\\d+)?)`,
            `(?<variable>[a-z]\\w*)`,
            `(?<unknown>\\S)`
        ].join("|"), "gi")
    }

    tokenize(expression) {
        const matches = expression.matchAll(this.regexp)
        const tokens = [...matches.map(match => this.matchToToken(match))]
        this.validate(tokens)

        return tokens
    }

    matchToToken(match) {
        for (const [type, value] of Object.entries(match.groups))
            if (value)
                return {type: type, value: value, start: match.index, end: match.index + value.length}

        return null
    }

    validate(tokens) {
        const unknown = tokens.filter(token => token.type === "unknown")

        if (unknown.length > 0)
            throw new InvalidLiteralsError(unknown)
    }
}
