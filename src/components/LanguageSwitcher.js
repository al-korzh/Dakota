import i18n, {languages} from "i18n"
import {useState, useEffect} from "react"
import {useTheme} from "@mui/material/styles"
import {
    Menu,
    Button,
    MenuItem
} from "@mui/material"
import {
    LanguageOutlined
} from "@mui/icons-material"

import {useContext as useAppContext} from "components/Context"


const LanguageSwitcher = () => {
    const theme = useTheme()
    const {language, setLanguage} = useAppContext()
    const [anchorEl, setAnchorEl] = useState(null)

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleMenuItemClick = async (value) => {
        i18n.changeLanguage(value)
            .then(() => {
                setLanguage(value)
                handleClose()
            })
            .catch((error) => {
                if (process.env.NODE_ENV === "development") {
                    console.error("Error changing language:", error)
                }
            })
    }

    useEffect(() => {
        localStorage.setItem("language", language)
    }, [language])

    return (
        <>
            <Button
                onClick={handleOpen}
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
                <LanguageOutlined/>
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
                sx={{
                    marginTop: "1rem",
                    "& .MuiMenu-paper": {
                        background: "none",
                    },
                    "& .MuiList-root": {
                        padding: 0,
                        display: "flex",
                    },
                }}
            >
                {languages.map((value, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => handleMenuItemClick(value)}
                        sx={{
                            position: "relative",
                            padding: "0.5rem 1.8rem",
                            color: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                            background: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                            "&:hover": {
                                color: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                background: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                            },
                            "&:not(:last-of-type)": {
                                "&::before": {
                                    top: 0,
                                    right: "-0.05rem",
                                    zIndex: 1,
                                    height: "50%",
                                    content: "''",
                                    width: "0.1rem",
                                    position: "absolute",
                                    transform: "translateY(50%)",
                                    background: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                                },
                            },
                            "&:first-of-type": {
                                borderRadius: "1rem 0 0 1rem",
                            },
                            "&:last-of-type": {
                                borderRadius: "0 1rem 1rem 0",
                            },
                        }}
                    >
                        {value}
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
}

export default LanguageSwitcher
