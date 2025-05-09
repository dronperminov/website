class ExpressionInfixBuilder {
    constructor(functions) {
        this.functions = functions
        this.operators = {
            "+": {args: 2, precedence: 1, associate: "left", value: " + "},
            "-": {args: 2, precedence: 1, associate: "left", value: " - "},
            "*": {args: 2, precedence: 2, associate: "left", value: " * "},
            "/": {args: 2, precedence: 2, associate: "left", value: " / "},
            "^": {args: 2, precedence: 3, associate: "right", value: "^"},
            "~": {args: 1, precedence: 3, associate: "right", value: "-"}
        }

        this.constants = {
            "pi": "π"
        }
    }

    build(rpn) {
        const stack = []

        for (const token of rpn) {
            if (token.type === "number" || token.type === "variable") {
                stack.push({value: token.value, precedence: Infinity})
            }
            else if (token.type === "constant") {
                stack.push({value: this.constants[token.value] ?? token.value, precedence: Infinity})
            }
            else if (token.type === "operator") {
                const operator = this.operators[token.value]
                const args = stack.splice(-operator.args)

                if (args.length === 1) {
                    const arg = this.addParenthesis(args[0], operator, "right")
                    stack.push({value: `${operator.value}${arg}`, precedence: operator.precedence})
                }
                else {
                    const arg1 = this.addParenthesis(args[0], operator, "left")
                    const arg2 = this.addParenthesis(args[1], operator, "right")
                    stack.push({value: `${arg1}${operator.value}${arg2}`, precedence: operator.precedence})
                }
            }
            else if (token.type === "function") {
                const args = stack.splice(-this.functions[token.value].args)
                stack.push({value: `${token.value}(${args.map(arg => arg.value).join(", ")})`, precedence: Infinity})
            }
        }

        return stack.pop().value
    }

    addParenthesis(operand, operator, side) {
        if (operand.precedence < operator.precedence || operand.precedence === operator.precedence && operator.associate !== side)
            return `(${operand.value})`

        return operand.value
    }
}
