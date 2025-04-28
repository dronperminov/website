const INfINITE_SCROLL_INITIAL_STATUS = "initial"
const INfINITE_SCROLL_LOADING_STATUS = "loading"
const INfINITE_SCROLL_LOADED_STATUS = "loaded"
const INfINITE_SCROLL_OUT_DATA_STATUS = "out-data"
const INfINITE_SCROLL_ERROR_STATUS = "error"

class InfiniteScroll {
    constructor(config) {
        this.parent = document.getElementById(config.blockId)
        this.block = this.parent.children[0]
        this.loader = this.BuildLoader(this.parent)

        this.page = config.page ?? 0
        this.pageSize = config.pageSize ?? 10
        this.offset = config.offset ?? 100
        this.maxHeight = config.maxHeight ?? 0
        this.status = INfINITE_SCROLL_INITIAL_STATUS

        this.url = config.url
        this.getParams = config.getParams ?? null
        this.onLoad = config.onLoad

        this.InitEvents()
    }

    Reset() {
        this.page = 0
        this.status = INfINITE_SCROLL_INITIAL_STATUS

        this.block.innerHTML = ""
        this.loader.classList.add("hidden")
    }

    LoadContent() {
        let params = this.GetParams()
        if (params === null)
            return

        this.status = INfINITE_SCROLL_LOADING_STATUS
        this.loader.classList.remove("hidden")

        SendRequest(this.url, params).then(response => this.HandleResponse(response))
    }

    InitEvents() {
        let block = this.maxHeight === 0 ? window : this.parent
        block.addEventListener("scroll", () => this.Scroll())

        if (config.resize === true)
            window.addEventListener("resize", e => this.Resize())
    }

    BuildLoader(parent) {
        let loader = MakeElement(parent, {class: "loader hidden"})
        MakeElement(loader, {src: "/images/loader.svg"}, "img")
        return loader
    }

    HandleResponse(response) {
        if (response.status != SUCCESS_STATUS) {
            ShowNotification(`Не удалось загрузить данные<br><b>Причина</b>: ${response.message}`, "error-notification", 3500)
            this.status = INfINITE_SCROLL_ERROR_STATUS
            setTimeout(() => this.LoadContent(), 3000)
            return
        }

        this.loader.classList.add("hidden")

        let count = this.onLoad(response, this.block)
        this.status = count == this.pageSize ? INfINITE_SCROLL_LOADED_STATUS : INfINITE_SCROLL_OUT_DATA_STATUS
        this.page += 1

        if (this.status != INfINITE_SCROLL_OUT_DATA_STATUS && this.ScrollDifference() < 0)
            this.LoadContent()
    }

    GetParams() {
        let params = this.getParams === null ? {} : this.getParams()

        if (params === null)
            return null

        params.page = this.page
        params.page_size = this.pageSize
        return params
    }

    ScrollDifference() {
        if (this.maxHeight === 0)
            return this.block.offsetTop + this.block.clientHeight - window.innerHeight - window.scrollY

        return this.block.clientHeight - Math.max(this.parent.clientHeight, this.maxHeight) - this.parent.scrollTop
    }

    Scroll() {
        if (this.status != INfINITE_SCROLL_LOADED_STATUS)
            return

        if (this.ScrollDifference() < this.offset)
            this.LoadContent()
    }

    Resize() {
        if (this.status != INfINITE_SCROLL_LOADED_STATUS || this.ScrollDifference() >= this.offset / 2)
            return

        this.LoadContent()
    }
}
