class RecursiveDescentParser {
    constructor(functions) {
        this.functions = functions
    }

    parse(tokens) {
        this.tokens = tokens
        this.index = 0
        this.token = this.tokens[0]
        this.rpn = []

        this.parseExpression()

        if (this.index < this.tokens.length)
            throw new Error(`extra tokens after end of expression (${this.token.start})`)

        return this.rpn
    }

    consume(type) {
        const token = this.token

        if (token === null)
            throw new Error(`unexpected end of input, expected ${type}`)

        if (token.type !== type)
            throw new Error(`unexpected token: "${token.value}", expected ${type} (${token.start}:${token.end})`)

        this.token = ++this.index < this.tokens.length ? this.tokens[this.index] : null
        return token
    }

    parseBinaryExpresson(parseLeft, parseRight, values) {
        parseLeft()

        while (this.token && this.token.type == "operator" && values.has(this.token.value)) {
            const operator = this.consume("operator")
            parseRight()
            this.rpn.push(operator)
        }
    }

    /*
     * Expression
     *   = Term (("+" | "-") Term)*
     */
    parseExpression() {
        this.parseBinaryExpresson(() => this.parseTerm(), () => this.parseTerm(), new Set(["+", "-"]))
    }

    /*
     * Term
     *   = Factor (("*" | "/") Factor)*
     */
    parseTerm() {
        this.parseBinaryExpresson(() => this.parseFactor(), () => this.parseFactor(), new Set(["*", "/"]))
    }

    /*
     * Factor
     *   = Primary ("^" Factor)
     */
    parseFactor() {
        this.parseBinaryExpresson(() => this.parsePrimary(), () => this.parseFactor(), new Set(["^"]))
    }

    /*
     * Primary
     *    = ParenthesizedExpression
     *    / UnaryExpression
     *    / FunctionExpression
     *    / CONSTANT
     *    / VARIABLE
     *    / NUMBER
     */
    parsePrimary() {
        if (this.token.type === "left_parenthesis") {
            this.parseParenthesizedExpression()
            return
        }

        if (this.token.type === "operator" && this.token.value === "-") {
            this.parseUnaryExpression()
            return
        }

        if (this.token.type === "function") {
            this.parseFunctionExpression()
            return
        }

        if (this.token.type === "constant" || this.token.type === "variable") {
            this.rpn.push(this.consume(this.token.type))
            return
        }

        this.rpn.push(this.consume("number"))
    }

    /*
     * ParenthesizedExpression
     *   = "(" expression ")"
     */
    parseParenthesizedExpression() {
        this.consume("left_parenthesis")
        this.parseExpression()
        this.consume("right_parenthesis")
    }

    /*
     * UnaryExpression
     *   = "-" Factor
     */
    parseUnaryExpression() {
        const token = this.consume("operator")
        token.value = "~" // заменяем на унарный минус
        this.parseFactor()
        this.rpn.push(token)
    }

    /*
     * FunctionExpression
     *   = FUNCTION "(" expression ("," expression)* ")"
     */
    parseFunctionExpression() {
        const token = this.consume("function")
        this.consume("left_parenthesis")
        this.parseExpression()

        for (let i = 1; i < this.functions[token.value].args; i++) {
            this.consume("delimeter")
            this.parseExpression()
        }

        this.consume("right_parenthesis")
        this.rpn.push(token)
    }
}
