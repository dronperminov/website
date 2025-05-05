class ShuntingYardParser {
    constructor(functions) {
        this.functions = functions
        this.operators = {
            "+": {precedence: 1, associative: "left"},
            "-": {precedence: 1, associative: "left"},
            "*": {precedence: 2, associative: "left"},
            "/": {precedence: 2, associative: "left"},
            "^": {precedence: 3, associative: "right"},
            "~": {precedence: 3, associative: "right"}
        }
    }

    parse(tokens) {
        const stack = []
        const argsCount = []
        const rpn = []
        let prev = null
        let expect = "operand"

        for (const token of tokens) {
            if (token.type === "number" || token.type === "constant" || token.type === "variable") {
                expect = this.parseOperand(token, rpn, expect)
            }
            else if (token.type === "function") {
                expect = this.parseFunction(token, stack, argsCount, expect)
            }
            else if (token.type === "delimeter") {
                expect = this.parseDelimeter(token, stack, rpn, argsCount, expect)
            }
            else if (token.type === "operator" && token.value === "-" && this.isUnary(prev)) {
                expect = this.parseUnary(token, stack, expect)
            }
            else if (token.type === "operator") {
                expect = this.parseOperator(token, stack, rpn, expect)
            }
            else if (token.type === "left_parenthesis") {
                expect = this.parseLeftParenthesis(token, stack, expect)
            }
            else if (token.type === "right_parenthesis") {
                expect = this.parseRightParenthesis(token, stack, rpn, argsCount, expect)
            }
            else
                throw new Error(`got invalid token: "${token.value}" (${token.start}:${token.end})`)

            prev = token
        }

        this.parseLastOperators(stack, rpn, expect)
        return rpn
    }

    isUnary(prev) {
        return prev === null || prev.type === "operator" || prev.type === "delimeter" || prev.type === "left_parenthesis"
    }

    isMorePrecedence(top, operator) {
        if (top.type !== "operator")
            return false

        if (operator.associative === "right")
            return this.operators[top.value].precedence > operator.precedence

        return this.operators[top.value].precedence >= operator.precedence
    }

    parseOperand(token, rpn, expect) {
        if (expect !== "operand")
            throw new Error(`expected ${expect}, but got "${token.value}" (${token.start}:${token.end})`)

        rpn.push(token)
        return "operator"
    }

    parseFunction(token, stack, argsCount, expect) {
        if (expect !== "operand")
            throw new Error(`expected ${expect}, but got "${token.value}" (${token.start}:${token.end})`)

        stack.push(token)
        argsCount.push(1)
        return "("
    }

    parseDelimeter(token, stack, rpn, argsCount, expect) {
        if (expect !== "operator")
            throw new Error(`expected ${expect}, but got "${token.value}" (${token.start}:${token.end})`)

        while (stack.length && stack[stack.length - 1].type !== "left_parenthesis")
            rpn.push(stack.pop())

        if (stack.length === 0)
            throw new Error(`"${token.value}" outside a function or without "(" (${token.start}:${token.end})`)

        if (argsCount.length === 0)
            throw new Error(`"${token.value}" outside a function (${token.start}:${token.end})`)

        argsCount[argsCount.length - 1]++
        return "operand"
    }

    parseUnary(token, stack, expect) {
        if (expect !== "operand")
            throw new Error(`expected ${expect}, but got unary "${token.value}" (${token.start}:${token.end})`)

        token.value = "~"
        stack.push(token)
        return "operand"
    }

    parseOperator(token, stack, rpn, expect) {
        if (expect !== "operator")
            throw new Error(`expected ${expect}, but got "${token.value}" (${token.start}:${token.end})`)

        while (stack.length && this.isMorePrecedence(stack[stack.length - 1], this.operators[token.value]))
            rpn.push(stack.pop())

        stack.push(token)
        return "operand"
    }

    parseLeftParenthesis(token, stack, expect) {
        if (expect === "operator")
            throw new Error(`expected ${expect}, but got "${token.value}" (${token.start}:${token.end})`)

        stack.push(token)
        return "operand"
    }

    parseRightParenthesis(token, stack, rpn, argsCount, expect) {
        if (expect !== "operator")
            throw new Error(`expect ${expect}, but got ")" (${token.start}:${token.end})`)

        while (stack.length && stack[stack.length - 1].type !== "left_parenthesis")
            rpn.push(stack.pop())

        if (stack.length === 0)
            throw new Error(`"(" missing before "${token.value}" (${token.start}:${token.end})`)

        stack.pop()

        if (stack.length && stack[stack.length - 1].type === "function") {
            const func = this.functions[stack[stack.length - 1].value]
            const args = argsCount.pop()

            if (args != func.args)
                throw new Error(`invalid "${stack[stack.length - 1].value}" arguments count: expected ${func.args}, got ${args} "${token.value}" (${token.start}:${token.end})`)

            rpn.push(stack.pop())
        }

        return "operator"
    }

    parseLastOperators(stack, rpn, expect) {
        while (stack.length) {
            const token = stack.pop()

            if (expect != "operator")
                throw new Error(`expect ${expect}, but got "${token.value}" (${token.start}:${token.end})`)

            if (token.type === "left_parenthesis")
                throw new Error(`the brackets are disbalanced (${token.start}:${token.end})`)

            rpn.push(token)
        }
    }
}
