import {useTranslation} from "react-i18next"
import {useRef, useState, useEffect} from "react"
import {useTheme} from "@mui/material/styles"
import {
    Box,
    List,
    Button,
    TextField,
    ListItemText,
    ListItemButton,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"

import {useContext} from "components/SensorManager/Context"


const Search = () => {
    const theme = useTheme()
    const {t} = useTranslation()
    const menuRef = useRef(null)
    const [query, setQuery] = useState("")
    const [inputError, setInputError] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [filteredResults, setFilteredResults] = useState([])
    const {
        parameters,
        mountPoints,
        setTypeChart,
        setTitleCharts,
        setUrlGETMeasurements,
    } = useContext()

    const handleSearch = (event) => {
        const input = event.target.value
        setQuery(input)

        if (input.length > 0) {
            setIsMenuOpen(true)

            const filterItems = (items, type) => {
                return items
                    .filter((item) =>
                        item.name.toLowerCase().startsWith(input.toLowerCase())
                    )
                    .map((item) => ({
                        ...item,
                        type: type
                    }))
            }

            const filteredParams = filterItems(parameters, "parameter")
            const filteredMountPoints = filterItems(mountPoints, "mount-point")

            setInputError(false)
            setFilteredResults([...filteredParams, ...filteredMountPoints])
        } else {
            setIsMenuOpen(false)
            setFilteredResults([])
        }
    }

    const handleItemClick = (value) => {
        setQuery("")
        setTypeChart(value.type)
        setTitleCharts(value.name)
        setIsMenuOpen(false)
        setFilteredResults([])
        setUrlGETMeasurements(`/${value.type}/${value.id}`)
    }

    const handleButtonClick = () => {
        if (filteredResults.length > 0) {
            handleItemClick(filteredResults[0])
        } else {
            setInputError(true)
            setTimeout(() => {
                setInputError(false)
            }, 1500)

            setIsMenuOpen(false)
            setFilteredResults([])
            setQuery("")
        }
    }

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            handleButtonClick()
        }
    }

    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuOpen(false)
        }
    }

    useEffect(() => {
        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside)
        } else {
            document.removeEventListener("mousedown", handleClickOutside)
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [isMenuOpen])


    return (
        <>
            <TextField
                fullWidth
                value={query}
                label={t("sensorManager.charts.query")}
                error={inputError}
                onChange={handleSearch}
                onKeyDown={handleKeyDown}
                sx={{
                    "& .MuiOutlinedInput-root": {
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.mode === "light" ? "#c4fcef" : "#013048",
                        },

                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderWidth: "0.2rem",
                            borderColor: theme.palette.mode === "light" ? "#008f79" : "#6a3f52",
                        },
                        "& fieldset": {
                            borderWidth: "0.2rem",
                            borderColor: theme.palette.mode === "light" ? "#008f79" : "#6a3f52",
                            "& legend": {
                                fontSize: "1rem",
                            }
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: theme.palette.mode === "light" ? "#008f79" : "#6a3f52",
                        },
                        "&.Mui-error fieldset": {
                            borderColor: "#d32f2f",
                        },
                    },

                    "& .MuiInputBase-root": {
                        borderRadius: "0.825rem",
                    },
                    "& .MuiInputBase-input": {
                        height: "auto",
                        color: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                        fontWeight: 400,
                        fontSize: "1rem",
                        padding: "0.6rem",
                    },
                    "& label.Mui-focused": {
                        color: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                    },
                    "& label": {
                        textTransform: "uppercase",
                        fontWeight: 400,
                        color: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                        fontSize: "1rem",
                        top: "50%",
                        transform: "translate(1rem, -50%) scale(1)",
                        "&.MuiInputLabel-shrink": {
                            top: "0",
                            transform: "translate(1rem, -33%) scale(0.75)",
                        },
                    },
                    "& label.Mui-error": {
                        color: "#d32f2f",
                    },
                }}
            />
            <Button
                onClick={handleButtonClick}
                sx={{
                    color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                    background: theme.palette.mode === "light" ? "#008f79" : "#6a3f52",
                    fontSize: "1rem",
                    minWidth: "auto",
                    boxShadow: "none",
                    borderRadius: "0.825rem",
                    padding: "0.25rem 0.55rem",
                    "&:hover": {
                        color: theme.palette.mode === "light" ? "#008f79" : "#6a3f52",
                        background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                        boxShadow: "none",
                    },
                    "&:active": {
                        boxShadow: "none",
                    },
                }}
            >
                <SearchIcon/>
            </Button>

            {filteredResults.length > 0 && isMenuOpen && (
                <Box ref={menuRef} sx={{
                    top: "100%",
                    left: "3rem",
                    right: "3rem",
                    padding: "0.5rem",
                    position: "absolute",
                    borderRadius: "0.825rem",
                    color: theme.palette.mode === "light" ? "#008f79" : "#6a3f52",
                    background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                }}>
                    <List sx={{
                        overflowY: "auto",
                        maxHeight: "10rem",
                        "::-webkit-scrollbar-track": {
                            borderColor: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                        },
                    }}>
                        {filteredResults.map((value, index) => (
                            <ListItemButton
                                key={index}
                                onClick={() => handleItemClick(value)}
                                sx={{
                                    borderRadius: "0.825rem",
                                    "&:hover": {
                                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        background: theme.palette.mode === "light" ? "#008f79" : "#6a3f52",
                                    },
                                }}
                            >
                                <ListItemText primary={value.name}/>
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            )}
        </>
    )
}

export default Search
