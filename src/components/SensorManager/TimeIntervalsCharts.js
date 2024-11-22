import {useState} from "react"
import {useTheme} from "@mui/material/styles"
import {
    Menu,
    Button,
    MenuItem,
    Typography
} from "@mui/material"

import {useContext} from "components/SensorManager/Context"


const TimeIntervalsCharts = () => {
    const theme = useTheme()
    const [anchorEl, setAnchorEl] = useState(null)
    const {
        valuesTimeInterval,
        timeIntervalCharts,
        setTimeIntervalCharts,
    } = useContext()

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleMenuItemClick = async (value) => {
        handleClose()
        setTimeIntervalCharts(value)
    }


    return (
        <>
            <Button
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                    width: "3.75rem",
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
                <Typography display="flex" justifyContent="center" alignItems="center" sx={{
                    minWidth: "2rem",
                    minHeight: "2rem",
                    fontSize: "1.2rem",
                    fontWeight: 600,
                }}>
                    {timeIntervalCharts}
                </Typography>
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
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
                {Object.keys(valuesTimeInterval()).map((value, index) => (
                    value !== timeIntervalCharts ? (
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
                    ) : null
                ))}
            </Menu>
        </>
    )
}

export default TimeIntervalsCharts
