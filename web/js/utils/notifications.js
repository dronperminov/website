function ShowNotification(text, className = "error-notification", showTime = 2000) {
    let notifications = document.getElementById("notifications")

    if (notifications === null)
        notifications = MakeElement(document.querySelector("body"), {id: "notifications"})

    let notification = MakeElement(null, {class: `notification ${className}`})

    let icon = MakeElement(notification, {class: "notification-icon"})
    let body = MakeElement(notification, {class: "notification-body"})

    if (className == "error-notification") {
        MakeElement(icon, {src: "/images/icons/error.svg"}, "img")
        MakeElement(body, {class: "notification-title", innerText: "Ошибка"})
    }
    else if (className == "success-notification") {
        MakeElement(icon, {src: "/images/icons/success.svg"}, "img")
        MakeElement(body, {class: "notification-title", innerText: "Успех"})
    }
    else {
        MakeElement(icon, {src: "/images/icons/info.svg"}, "img")
        MakeElement(body, {class: "notification-title", innerText: "Информация"})
    }

    MakeElement(body, {innerHTML: text})

    notifications.prepend(notification)

    setTimeout(() => {
        notification.classList.add("notification-open")

        setTimeout(() => {
            notification.classList.remove("notification-open")

            setTimeout(() => {
                notification.remove()
            }, 50)
        }, showTime)
    }, 50)
}
