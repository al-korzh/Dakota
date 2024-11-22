import React from "react"
import {useTheme} from "@mui/material/styles"
import {
    Button
} from "@mui/material"

import Src from "assets/images/logo.webp"


const Logo = () => {
    const theme = useTheme()

    return (
        <Button
            href="/"
            sx={{
                color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                background: theme.palette.mode === "light" ? theme.palette.mode === "light" ? "#008f79" : "#013048" : "#013048",
                fontSize: "1rem",
                minWidth: "auto",
                boxShadow: "none",
                borderRadius: "222rem",
                padding: "0.35rem 1.25rem",
                "&:hover": {
                    boxShadow: "none",
                },
                "&:active": {
                    boxShadow: "none",
                },
            }}
        >
            <img src={Src} alt="Dakota" style={{
                width: "10rem"
            }}/>
        </Button>
    )
}

export default Logo
