import React from "react"
import {useTheme} from "@mui/material/styles"

import AnimationDark from "assets/images/animation-dark.gif"
import AnimationLight from "assets/images/animation-light.gif"


const Loading = () => {
    const theme = useTheme()

    return (
        <div>
            <img
                width="200px"
                height="200px"
                src={theme.palette.mode === "light" ? AnimationLight : AnimationDark}
                alt="Loading animation"
            />
        </div>
    )
}

export default Loading

