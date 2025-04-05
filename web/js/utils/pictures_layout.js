class PicturesLayout {
    static GetOrientation(picture) {
        let ratio = picture.width / picture.height

        if (ratio > 1.2)
            return "h"

        if (ratio < 0.8)
            return "v"

        return "s"
    }

    static GetLayout(pictures) {
        let orientations = pictures.map(picture => this.GetOrientation(picture)).join("")

        if (pictures.length == 1)
            return "layout-1"

        if (pictures.length == 2)
            return orientations == "hh" ? "layout-2-row" : "layout-2-column"

        if (pictures.length == 3) {
            if (["vvh", "vhh", "hvv", "hvh", "hhv", "hhh"].indexOf(orientations) > -1)
                return `layout-3-${orientations}`

            return "layout-3-grid"
        }

        if (pictures.length == 4) {
            if (["vhhh", "hvhh", "hvvv", "vvvh", "hhvh", "vhhv", "hvvh", "vhvh", "hvhv", "vhvv", "vvvv", "hhhv"].indexOf(orientations) > -1)
                return `layout-4-${orientations}`

            return "layout-2x2"
        }

        if (pictures.length <= 6)
            return "layout-grid-3"

        return "layout-grid-4"
    }
}
