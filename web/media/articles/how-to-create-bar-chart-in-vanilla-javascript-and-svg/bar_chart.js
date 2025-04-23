class BarChart {
    constructor(config) {
        this.svg = config.svg
        this.padding = config.padding ?? {left: 5, right: 5, top: 15, bottom: 25}

        this.bar = {
            radius: config.bar.radius ?? 0,
            color: config.bar.color ?? "#00bcd4",
            width: config.bar.width ?? 40,
            height: config.bar.height ?? 300,
            gap: config.bar.gap ?? 5
        }
        this.value = {
            size: config.value.size ?? 12,
            color: config.value.color ?? "#333"
        }
        this.label = {
            size: config.label.size ?? 12,
            color: config.label.color ?? "#333"
        }
    }

    plot(data) {
        let height = this.padding.top + this.bar.height + this.padding.bottom
        let width = this.padding.left + data.length * (this.bar.width + this.bar.gap) - this.bar.gap + this.padding.right
        let maxValue = Math.max(...data.map(item => item.value))

        this.svg.style.width = `${width}px`
        this.svg.style.height = `${height}px`

        for (let i = 0; i < data.length; i++) {
            if (data[i].value == 0)
                continue

            let barHeight = data[i].value / maxValue * this.bar.height
            let x = this.padding.left + i * (this.bar.width + this.bar.gap)
            let y = height - this.padding.bottom - barHeight
            let xc = x + this.bar.width / 2

            this.addBar(x, y, barHeight)
            this.addLabel(xc, y, `${data[i].value}`, this.value, "text-after-edge")
            this.addLabel(xc, height - this.padding.bottom, data[i].label, this.label, "text-before-edge")
        }
    }

    addBar(x, y, height) {
        let bar = document.createElementNS("http://www.w3.org/2000/svg", "rect")
        bar.setAttribute("x", x)
        bar.setAttribute("y", y)
        bar.setAttribute("width", this.bar.width)
        bar.setAttribute("height", height)
        bar.setAttribute("rx", this.bar.radius)
        bar.setAttribute("fill", this.bar.color)

        this.svg.appendChild(bar)
    }

    addLabel(x, y, text, format, baseline) {
        for (let line of text.split("\n")) {
            let label = document.createElementNS('http://www.w3.org/2000/svg', "text")

            label.textContent = line
            label.setAttribute("x", x)
            label.setAttribute("y", y)
            label.setAttribute("dominant-baseline", baseline)
            label.setAttribute("text-anchor", "middle")
            label.setAttribute("fill", format.color)
            label.setAttribute("font-size", format.size)

            this.svg.appendChild(label)

            y += label.getBBox().height
        }
    }
}
