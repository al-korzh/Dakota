import {useState, useEffect} from "react"
import {useTheme} from "@mui/material/styles"
import {
    Button,
    Menu,
    MenuItem
} from "@mui/material"
import {
    ArrowBackIosNewOutlined
} from "@mui/icons-material"

import {useContext} from "components/SensorManager/Context"


const Parameters = ({parentRef}) => {
    const theme = useTheme()
    const [anchorEl, setAnchorEl] = useState(null)
    const [parentWidth, setParentWidth] = useState(0)
    const {
        parameters,
        setTypeChart,
        setTitleCharts,
        setUrlGETMeasurements,
    } = useContext()

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleMenuItemClick = async (value) => {
        handleClose()
        setTypeChart("parameter")
        setTitleCharts(value.name)
        setUrlGETMeasurements(`/parameter/${value.id}`)
    }

    useEffect(() => {
        if (parentRef && parentRef.current) {
            const currentParent = parentRef.current;
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    setParentWidth(entry.contentRect.width)
                }
            })

            resizeObserver.observe(currentParent)

            return () => {
                resizeObserver.unobserve(currentParent)
                resizeObserver.disconnect()
            }
        }
    }, [parentRef])


    return (
        <>
            <Button
                onClick={(e) => setAnchorEl(e.currentTarget)}
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
                <ArrowBackIosNewOutlined sx={{transform: "rotate(-90deg)"}}/>
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                    "& .MuiPaper-root": {
                        marginTop: "1rem",
                        borderRadius: "0.825rem",
                        width: `calc(${parentWidth}px - 2rem)`,
                        background: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                    },
                    "& .MuiList-root": {
                        gap: "1.25rem",
                        display: "flex",
                        flexWrap: "wrap",
                        maxWidth: "100%",
                        padding: "1.5rem 1.25rem",
                        justifyContent: "space-evenly",
                    },
                }}
            >
                {parameters.map((value, index) => (
                    <MenuItem
                        key={index}
                        onClick={() => handleMenuItemClick(value)}
                        sx={{
                            padding: "0",
                            display: "flex",
                            width: "2.25rem",
                            height: "2.25rem",
                            fontSize: "0.85rem",
                            borderRadius: "50%",
                            justifyContent: "center",
                            color: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                            border: `0.1rem solid ${theme.palette.mode === "light" ? "#008f79" : "#ff8c69"}`,
                        }}
                    >
                        {value.symbol}
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
}

export default Parameters
