class LinearChart {
    constructor(config) {
        this.svg = config.svg
        this.padding = {
            top: config.padding?.top ?? 15,
            bottom: config.padding?.bottom ?? 25
        }

        this.line = {
            color: config.line?.color ?? "#9cc2ff",
            background: config.line?.background ?? "#ecf4ff"
        }

        this.marker = {
            radius: config.marker?.radius ?? 5,
            color: config.marker?.color ?? "#9cc2ff",
            background: config.marker?.background ?? "#ffffff",
            width: config.marker?.width ?? 50,
            height: config.marker?.height ?? 300
        }

        this.value = {
            size: config.value.size ?? 10,
            color: config.value.color ?? "#888"
        }

        this.label = {
            size: config.label.size ?? 10,
            color: config.label.color ?? "#888"
        }
    }

    plot(data) {
        const width = data.length * this.marker.width
        const height = this.padding.top + this.marker.height + this.padding.bottom

        this.svg.style.width = `${width}px`
        this.svg.style.height = `${height}px`

        const values = data.map(item => item.value)
        const min = Math.min(...values, 0)
        const max = Math.max(...values, 0)

        const points = []
        const paths = this.addPaths(points, this.map(0, min, max, height - this.padding.bottom, this.padding.top))

        for (let i = 0; i < data.length; i++) {
            const x = this.map(i, 0, data.length - 1, this.marker.width / 2, width - this.marker.width / 2)
            const y = this.map(data[i].value, min, max, height - this.padding.bottom, this.padding.top)
            const offset = (this.marker.width / 2 - this.marker.radius * 1.5) * (i == 0 ? -1 : i == data.length - 1 ? 1 : 0)
            const anchor = i == 0 ? "start" : i == data.length - 1 ? "end" : "middle"

            this.addLabel(x + offset, y - this.marker.radius - 1, `${data[i].value}`, this.value, anchor, "text-after-edge")
            this.addLabel(x, height - this.padding.bottom, data[i].label, this.label, "middle", "text-before-edge")
            this.addMarker(x + offset, y)

            points.push({x: x + offset, y: y})
        }

        this.updatePaths(paths, points, min, max, height)
    }

    map(x, xmin, xmax, min, max) {
        return (x - xmin) * (max - min) / (xmax - xmin) + min
    }

    addLabel(x, y, text, format, anchor, baseline) {
        for (const line of text.split("\n")) {
            const label = document.createElementNS("http://www.w3.org/2000/svg", "text")

            label.textContent = line
            label.setAttribute("x", x)
            label.setAttribute("y", y)
            label.setAttribute("dominant-baseline", baseline)
            label.setAttribute("text-anchor", anchor)
            label.setAttribute("fill", format.color)
            label.setAttribute("font-size", format.size)

            this.svg.appendChild(label)

            y += label.getBBox().height
        }
    }

    addPaths() {
        const area = document.createElementNS("http://www.w3.org/2000/svg", "path")
        area.setAttribute("fill", this.line.background)

        const line = document.createElementNS("http://www.w3.org/2000/svg", "path")
        line.setAttribute("fill", "none")
        line.setAttribute("stroke", this.line.color)
        line.setAttribute("stroke-width", this.marker.radius / 2)

        this.svg.appendChild(area)
        this.svg.appendChild(line)
        return {area, line}
    }

    addMarker(x, y) {
        const marker = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        marker.setAttribute("cx", x)
        marker.setAttribute("cy", y)
        marker.setAttribute("r", this.marker.radius)
        marker.setAttribute("fill", this.marker.background)
        marker.setAttribute("stroke", this.marker.color)
        marker.setAttribute("stroke-width", this.marker.radius / 2)

        this.svg.appendChild(marker)
    }

    points2path(points) {
        return points.map((point, i) => `${i == 0 ? "M" : "L"}${point.x} ${point.y}`).join("")
    }

    interpolate(x, points) {
        let result = 0
        let sum = 0

        for (let i = 0; i < points.length; i++) {
            const distance = Math.abs(x - points[i].x)

            if (distance === 0)
                return {x: x, y: points[i].y}

            const weight = 1 / Math.pow(distance, 2)
            result += points[i].y * weight
            sum += weight
        }

        return {x: x, y: result / sum}
    }

    smoothPoints(points, smoothCount = 20) {
        const smoothedPoints = [points[0]]

        for (let i = 1; i < points.length; i++) {
            for (let j = 0; j < smoothCount; j++)
                smoothedPoints.push(this.interpolate(this.map(j, -1, smoothCount, points[i - 1].x, points[i].x), points))

            smoothedPoints.push(points[i])
        }

        return smoothedPoints
    }

    updatePaths(paths, points, min, max, height) {
        const y0 = this.map(0, min, max, height - this.padding.bottom, this.padding.top)
        const smoothedPoints = this.smoothPoints(points)

        paths.line.setAttribute("d", this.points2path(smoothedPoints))
        paths.area.setAttribute("d", this.points2path([{x: points[0].x, y: y0}, ...smoothedPoints, {x: points[points.length - 1].x, y: y0}]))
    }
}
