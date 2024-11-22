import {useEffect} from "react"
import {useTheme} from "@mui/material/styles"
import {
    Button
} from "@mui/material"
import {
    DarkModeOutlined,
    LightModeOutlined
} from "@mui/icons-material"

import {useContext as useAppContext} from "components/Context"


const ThemeSwitcher = () => {
    const theme = useTheme()
    const {theme: appTheme, setTheme} = useAppContext()

    const handleThemeSwitch = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
    }

    useEffect(() => {
        localStorage.setItem("theme", appTheme)
    }, [appTheme])

    return (
        <Button
            onClick={handleThemeSwitch}
            sx={{
                color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                fontSize: "1rem",
                minWidth: "auto",
                boxShadow: "none",
                borderRadius: "222rem",
                padding: "0.5rem 0.75rem",
                "&:hover": {
                    color: theme.palette.mode === "light" ? "#008f79" : "#013048",
                    background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                    boxShadow: "none",
                },
                "&:active": {
                    boxShadow: "none",
                },
            }}
        >
            {appTheme === "light" ? <DarkModeOutlined/> : <LightModeOutlined/>}
        </Button>
    )
}

export default ThemeSwitcher
