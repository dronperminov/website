class Chart {
    constructor(config) {
        this.svg = config.svg
        this.radius = {
            outer: config.radius.outer,
            inner: config.radius.inner ?? 0
        }

        this.gap = {size: config.gap.size ?? 1, color: config.gap.color ?? "#ffffff"}
        this.startAngle = config.startAngle ?? 0
        this.label = config.label

        // размещать окружности будем по центру svg
        this.x = this.svg.clientWidth / 2
        this.y = this.svg.clientHeight / 2

        // обводка рисуется в обе стороны, так что нам нужен средний радиус
        this.radius.middle = (this.radius.inner + this.radius.outer) / 2
        this.strokeWidth = this.radius.outer - this.radius.inner
        this.length = 2 * Math.PI * this.radius.middle
    }

    plot(data) {
        let total = data.reduce((sum, item) => sum + item.value, 0) // считаем суммарное значение
        let offset = this.startAngle / 360
        let offsets = [offset]

        for (let item of data) {
            let value = item.value / total
            this.addCircle(item.color, value, offset)
            offset += value
            offsets.push(offset)
        }

        for (offset of offsets)
            this.addDivider(offset)

        this.addLabel(total)
    }

    addCircle(color, value, offset) {
        let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle")

        circle.setAttribute("cx", this.x)
        circle.setAttribute("cy", this.y)
        circle.setAttribute("r", this.radius.middle)

        circle.setAttribute("stroke", color)
        circle.setAttribute("stroke-width", this.strokeWidth)
        circle.setAttribute("stroke-dasharray", [value * this.length, (1 - value) * this.length])
        circle.setAttribute("stroke-dashoffset", -offset * this.length)
        circle.setAttribute("fill", "none")

        this.svg.appendChild(circle)
    }

    addDivider(offset) {
        let line = document.createElementNS("http://www.w3.org/2000/svg", "path")

        let angle = 2 * Math.PI * offset
        let x1 = this.x + this.radius.inner * Math.cos(angle)
        let y1 = this.y + this.radius.inner * Math.sin(angle)

        let x2 = this.x + this.radius.outer * Math.cos(angle)
        let y2 = this.y + this.radius.outer * Math.sin(angle)

        line.setAttribute("d", `M${x1} ${y1} L${x2} ${y2}`)
        line.setAttribute("stroke", this.gap.color)
        line.setAttribute("stroke-width", this.gap.size)

        this.svg.appendChild(line)
    }

    addLabel(total) {
        let label = document.createElementNS("http://www.w3.org/2000/svg", "text")

        label.textContent = total
        label.setAttribute("x", this.x)
        label.setAttribute("y", this.y)
        label.setAttribute("dominant-baseline", "central")
        label.setAttribute("text-anchor", "middle")
        label.setAttribute("fill", this.label.color)
        label.setAttribute("font-size", this.label.size)
        label.setAttribute("font-weight", "bold")

        this.svg.appendChild(label)
    }
}
