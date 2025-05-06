class PrattParser {
    constructor(functions) {
        this.functions = functions
        this.operators = {
            "+": 1,
            "-": 1,
            "*": 2,
            "/": 2,
            "~": 3,
            "^": 4
        }
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

    getPrecedence(token) {
        if (token && token.type === "operator")
            return this.operators[token.value]

        return 0
    }

    /*
     * Expression
     *   = Prefix (Infix)*
     */
    parseExpression(precedence = 0) {
        this.parsePrefix()

        while (precedence < this.getPrecedence(this.token))
            this.parseInfix()
    }

    /*
     * Infix
     *   = ("+" | "-" | "*" | "/" | "^") (Expression)*
     */
    parseInfix() {
        const token = this.consume("operator")
        this.parseExpression(this.operators[token.value] - (token.value === "^" ? 1 : 0))
        this.rpn.push(token)
    }

    /*
     * Prefix
     *   = ParenthesizedExpression
     *   / UnaryExpression
     *   / FunctionExpression
     *   / CONSTANT
     *   / VARIABLE
     *   / NUMBER
     */
    parsePrefix() {
        if (this.token?.type === "left_parenthesis") {
            this.parseParenthesizedExpression()
            return
        }

        if (this.token?.type === "operator" && this.token.value === "-") {
            this.parseUnaryExpression()
            return
        }

        if (this.token?.type === "function") {
            this.parseFunctionExpression()
            return
        }

        if (this.token?.type === "constant" || this.token?.type === "variable") {
            this.rpn.push(this.consume(this.token.type))
            return
        }

        this.rpn.push(this.consume("number"))
    }

    /*
     * ParenthesizedExpression
     *   = "(" Expression ")"
     */
    parseParenthesizedExpression() {
        this.consume("left_parenthesis")
        this.parseExpression()
        this.consume("right_parenthesis")
    }

    /*
     * UnaryExpression
     *   = "-" Expression
     */
    parseUnaryExpression() {
        const token = this.consume("operator")
        token.value = "~" // заменяем на унарный минус
        this.parseExpression(this.operators[token.value])
        this.rpn.push(token)
    }

    /*
     * FunctionExpression
     *   = FUNCTION "(" Expression ("," Expression)* ")"
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
