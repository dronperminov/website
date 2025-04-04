function ShowNotification(text, className = "error-notification", showTime = 2000) {
    let notifications = document.getElementById("notifications")

    if (notifications === null) {
        notifications = document.createElement("div")
        notifications.setAttribute("id", "notifications")
        let body = document.getElementsByTagName("body")[0]
        body.appendChild(notifications)
    }

    let notification = document.createElement("div")
    notification.classList.add("notification")
    notification.classList.add(className)
    notification.innerHTML = text
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
