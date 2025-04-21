function SetAttributes(element, attributes) {
    if (attributes === null)
        return

    for (let [name, value] of Object.entries(attributes)) {
        if (name == "class")
            element.className = value
        else if (name == "innerText")
            element.innerText = value
        else if (name == "innerHTML")
            element.innerHTML = value
        else
            element.setAttribute(name, value)
    }
}

function MakeElement(parent = null, attributes = null, tagName = "div") {
    let element = document.createElement(tagName)
    SetAttributes(element, attributes)

    if (parent !== null)
        parent.appendChild(element)

    return element
}

function GetWordForm(count, forms, onlyForm = false) {
    let index = 0

    if ([0, 5, 6, 7, 8, 9].indexOf(Math.abs(count) % 10) > -1 || [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].indexOf(Math.abs(count) % 100) > -1)
        index = 2
    else if ([2, 3, 4].indexOf(Math.abs(count) % 10) > -1)
        index = 1

    return onlyForm ? forms[index] : `${count} ${forms[index]}`
}
