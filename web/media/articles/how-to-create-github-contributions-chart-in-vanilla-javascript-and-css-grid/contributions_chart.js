class ContributionsChart {
    constructor(config) {
        this.block = config.block
        this.colors = config.colors ?? ["#eff2f5", "#aceebb", "#4ac26b", "#2da44e", "#116329"]

        this.weekDayNames = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"]
        this.monthNames = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]
        
        const year = config.startYear ?? new Date().getFullYear()
        const month = config.startMonth ?? 1
        this.startDate = new Date(year, month - 1, 1)
        this.endDate = new Date(year + 1, month - 1, 0)
    }

    plot(contributions) {
        const date2count = Object.fromEntries(contributions.map(contribution => [contribution.date, contribution.count]))
        const max = Math.max(...contributions.map(contribution => contribution.count))

        this.addWeekDays()

        const skip = (this.startDate.getDay() + 6) % 7
        let month = this.startDate.getMonth()
        let monthCell = this.addCell("contribution-cell-month", this.monthNames[month])
        let monthColumn = 0
        let index = skip

        for (let i = 0; i < skip; i++)
            this.addCell("contribution-cell-skip", "")

        for (let date = this.startDate; date < this.endDate; date.setDate(date.getDate() + 1)) {
            if (index % 7 == 0 && date.getMonth() != month) {
                monthCell.style.gridColumnEnd = `span ${Math.floor(index / 7) - monthColumn}`
                monthColumn = Math.floor(index / 7)
                month = date.getMonth()
                monthCell = this.addCell("contribution-cell-month", this.monthNames[month])
            }

            const count = date2count[date] ?? 0
            const cell = this.addCell("contribution-cell-day", "")
            cell.style.background = this.getColor(count, max)
            cell.title = this.getTitle(date, count)

            index++
        }

        monthCell.style.gridColumnEnd = `span ${Math.floor((index + 6) / 7) - monthColumn}`
    }

    addWeekDays() {
        this.addCell("contribution-cell-weekday", "")

        for (const day of this.weekDayNames)
            this.addCell("contribution-cell-weekday", day)
    }

    addCell(className, content) {
        const cell = document.createElement("div")
        cell.classList.add("contribution-cell")
        cell.classList.add(className)
        cell.innerText = content

        this.block.appendChild(cell)
        return cell
    }

    getColor(count, max) {
        if (count == 0)
            return this.colors[0]

        return this.colors[1 + Math.floor(count / max * (this.colors.length - 2))]
    }

    getTitle(date, count) {
        const day = `${date.getDate()}`.padStart(2, "0")
        const month = `${date.getMonth() + 1}`.padStart(2, "0")
        const year = `${date.getFullYear()}`
        return `${day}.${month}.${year}: ${count}`
    }
}
