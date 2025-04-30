class Game2048 {
    constructor(config) {
        this.n = config.n ?? 4
        this.cellSize = config.cellSize ?? 100
        this.scoreHeight = config.scoreHeight ?? 75
        this.border = config.border ?? 5
        this.fieldSize = this.n * (this.cellSize + this.border) + this.border

        this.canvas = config.canvas
        this.canvas.width = this.fieldSize
        this.canvas.height = this.scoreHeight + this.fieldSize

        this.ctx = this.canvas.getContext("2d")

        this.colors = {
            score: "#bdaca0",
            field: "#bdaca0",
            gameOver: "#eee4caba",
            cells: [
                "#cdc2b3", "#efe5da", "#ece0c8", "#f0b17d", "#f19867",
                "#f07e63", "#f46141", "#eacf78", "#edcd66", "#ecc75b",
                "#e8c256", "#e9be4c", "#fd3f3f", "#fe2222", "#000000"
            ]
        }

        this.field = new Array(this.n * this.n).fill(0)
        this.score = 0
        this.gameOver = false

        this.add(1)
        this.add(Math.random() < 0.75 ? 1 : 2)
        this.draw()

        document.addEventListener("keydown", e => this.keyDown(e))
    }

    getAvailableCells() {
        let available = []

        for (let index = 0; index < this.field.length; index++)
            if (this.field[index] == 0)
                available.push(index)

        return available
    }

    add(value) {
        const availableCells = this.getAvailableCells()
        if (availableCells.length == 0)
            return

        const index = availableCells[Math.floor(Math.random() * availableCells.length)]
        this.field[index] = value
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.drawScore()
        this.drawBoard()

        if (this.gameOver)
            this.drawGameOver()
    }

    drawScore() {
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.font = `${this.cellSize / 2}px Arial`
        this.ctx.fillStyle = this.colors.score
        this.ctx.fillText(`Score: ${this.score}`, this.fieldSize / 2, this.scoreHeight / 2)
    }

    drawBoard() {
        this.ctx.fillStyle = this.colors.field
        this.ctx.fillRect(0, this.scoreHeight, this.fieldSize, this.fieldSize)

        for (let i = 0; i < this.n; i++)
            for (let j = 0; j < this.n; j++)
                this.drawCell(i, j)
    }

    drawCell(i, j) {
        const value = this.field[i * this.n + j]
        const x = this.border + j * (this.cellSize + this.border)
        const y = this.scoreHeight + this.border + i * (this.cellSize + this.border)

        this.ctx.fillStyle = this.colors.cells[Math.min(value, this.colors.cells.length - 1)]
        this.ctx.fillRect(x, y, this.cellSize, this.cellSize)

        if (value === 0)
            return

        this.ctx.font = `${this.cellSize / 2.75}px Arial`
        this.ctx.fillStyle = value < 3 ? this.colors.field : "#ffffff"
        this.ctx.fillText(1 << value, x + this.cellSize / 2, y + this.cellSize / 2)
    }

    drawGameOver() {
        this.ctx.fillStyle = this.colors.gameOver
        this.ctx.fillRect(0, this.scoreHeight, this.fieldSize, this.fieldSize)
        this.ctx.fillStyle = "#ffffff"
        this.ctx.font = `${this.cellSize / 1.5}px Arial`
        this.ctx.fillText("Game over!", this.fieldSize / 2, this.scoreHeight + this.fieldSize / 2)
    }

    canShift() {
        if (this.getAvailableCells().length > 0)
            return true

        for (let i = 0; i < this.n; i++)
            for (let j = 1; j < this.n; j++)
                if (this.field[i * this.n + j] == this.field[i * this.n + (j - 1)] || this.field[j * this.n + i] == this.field[(j - 1) * this.n + i])
                    return true

        return false
    }

    shift(indices) {
        let i = 0
        let double = false
        let shifted = false

        for (const index of indices) {
            if (this.field[index] == 0)
                continue

            double = !double && i > 0 && this.field[indices[i - 1]] == this.field[index]
            shifted |= double || indices[i] != index

            if (double) {
                this.field[indices[i - 1]]++
                this.score += 1 << (this.field[index] + 1)
            }
            else
                this.field[indices[i++]] = this.field[index]
        }

        while (i < indices.length)
            this.field[indices[i++]] = 0

        return shifted
    }

    shiftCells(di, dj, d) {
        let shifted = false

        for (let i = 0; i < this.n; i++) {
            const indices = Array.from(Array(this.n), (_, j) => i * di + j * dj + d)
            shifted |= this.shift(indices)
        }

        return shifted
    }

    keyDown(e) {
        if (this.gameOver)
            return

        let shifted = false

        if (e.key == "ArrowLeft")
            shifted = this.shiftCells(this.n, 1, 0)
        else if (e.key == "ArrowRight")
            shifted = this.shiftCells(this.n, -1, this.n - 1)
        else if (e.key == "ArrowUp")
            shifted = this.shiftCells(1, this.n, 0)
        else if (e.key == "ArrowDown")
            shifted = this.shiftCells(1, -this.n, (this.n - 1) * this.n)

        if (!shifted)
            return

        this.add(Math.random() < 0.75 ? 1 : 2)
        this.gameOver = !this.canShift()
        this.draw()
    }
}
