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
