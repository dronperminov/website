class ContentLoader {
    constructor (config) {
        let block = document.getElementById(config.blockId)

        this.loader = block.children[0]
        this.block = block.children[1]

        this.url = config.url
        this.getParams = config.getParams || null
        this.onLoad = config.onLoad
        this.clearBeforeLoad = config.clearBeforeLoad || false

        if (config.load)
            this.Load()
    }

    Load() {
        let params = this.getParams === null ? {} : this.getParams()
        if (params === null)
            return

        if (this.clearBeforeLoad)
            this.Clear()

        this.loader.classList.remove("hidden")

        SendRequest(this.url, params).then(response => {
            if (response.status != SUCCESS_STATUS) {
                ShowNotification({header: "Не удалось загрузить данные", text: `<b>Причина</b>: ${response.message}`, className: "error-notification", time: 3500})
                setTimeout(() => this.Load(), 3000)
                return
            }

            this.Reset()
            this.onLoad(response, this.block)
        })
    }

    Clear() {
        this.block.innerHTML = ""
    }

    Reset() {
        this.Clear()
        this.loader.classList.add("hidden")
    }
}
