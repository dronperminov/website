const SUCCESS_STATUS = "success"
const ERROR_STATUS = "error"

async function SendRequest(url, data = null) {
    try {
        let params = {
            method: data == null ? "GET" : "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            referrerPolicy: "no-referrer"
        }

        let isForm = data !== null && data instanceof FormData

        if (data != null)
            params.body = isForm ? data : JSON.stringify(data)

        if (!isForm)
            params.headers = {"Content-Type": "application/json"}

        const response = await fetch(url, params)

        if (response.status == 404)
            return {"status": "error", "message": "запрашиваемая в запросе страница не найдена (404 ошибка)"}

        if (response.status >= 400)
            return {"status": "error", "message": `сетевая ошибка (статус: ${response.status})`}

        if (response?.ok)
            return await response.json()

        const error = await response.json()
        return {"status": "error", "message": error["message"]}
    }
    catch (error) {
        let message = error

        if (error.message == "Failed to fetch")
            message = "не удалось связаться с сервером"

        return {"status": "error", "message": message}
    }
}
