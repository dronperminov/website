function ShowNotification(config = {}) {
    const className = config.className ?? "error-notification"

    let notifications = document.getElementById("notifications")

    if (notifications === null)
        notifications = MakeElement(document.querySelector("body"), {id: "notifications"})

    let notification = MakeElement(null, {class: `notification ${className}`})

    const icon = MakeElement(notification, {class: "notification-icon"})
    const body = MakeElement(notification, {class: "notification-body"})

    if (className == "error-notification") {
        MakeElement(icon, {src: "/images/icons/error.svg"}, "img")
        MakeElement(body, {class: "notification-title", innerText: config.header ?? "Ошибка"})
    }
    else if (className == "success-notification") {
        MakeElement(icon, {src: "/images/icons/success.svg"}, "img")
        MakeElement(body, {class: "notification-title", innerText: config.header ?? "Успех"})
    }
    else {
        MakeElement(icon, {src: "/images/icons/info.svg"}, "img")
        MakeElement(body, {class: "notification-title", innerText: config.header ?? "Информация"})
    }

    MakeElement(body, {innerHTML: config.text ?? ""})

    notifications.prepend(notification)

    setTimeout(() => {
        notification.classList.add("notification-open")

        setTimeout(() => {
            notification.classList.remove("notification-open")

            setTimeout(() => {
                notification.remove()
            }, 50)
        }, config.time ?? 2000)
    }, 50)
}
