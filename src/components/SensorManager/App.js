import "dayjs/locale/ru"
import "dayjs/locale/en"
import axios from "axios"
import dayjs from "dayjs"
import {useTranslation} from "react-i18next"
import {useRef, useEffect, useState} from "react"
import {styled} from "@mui/system"
import {LicenseInfo} from "@mui/x-license"
import {useTheme} from "@mui/material/styles"
import {enUS, ruRU} from "@mui/x-date-pickers/locales"
import {DemoContainer} from "@mui/x-date-pickers/internals/demo"
import {AdapterDayjs} from "@mui/x-date-pickers-pro/AdapterDayjs"
import {LocalizationProvider} from "@mui/x-date-pickers-pro/LocalizationProvider"
import {MobileDateRangePicker} from "@mui/x-date-pickers-pro/MobileDateRangePicker"
import {
    Box,
    Stack,
    Button,
    ButtonGroup,
    Divider,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Paper,
    Typography,
    MenuItem,
    Modal,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    Checkbox,
} from "@mui/material"
import {
    MenuOutlined,
    Logout,
    PersonOutline,
    FormatListBulleted,
} from "@mui/icons-material"

import Logo from "components/Logo"
import ThemeSwitcher from "components/ThemeSwitcher"
import LanguageSwitcher from "components/LanguageSwitcher"
import {useContext as useAppContext} from "components/Context"

import Users from "components/Auth/Users"
import {useContext as useAuthContext} from "components/Auth/Context"

import Map from "components/SensorManager/Map"
import Crash from "components/SensorManager/Crash"
import Search from "components/SensorManager/Search"
import Charts from "components/SensorManager/Charts"
import {useContext} from "components/SensorManager/Context"
import Parameters from "components/SensorManager/Parameters"
import TimeIntervalsCharts from "components/SensorManager/TimeIntervalsCharts"


const locales = {
    en: enUS.components.MuiLocalizationProvider.defaultProps.localeText,
    ru: ruRU.components.MuiLocalizationProvider.defaultProps.localeText,
}
LicenseInfo.setLicenseKey("e0d9bb8070ce0054c9d9ecb6e82cb58fTz0wLEU9MzI0NzIxNDQwMDAwMDAsUz1wcmVtaXVtLExNPXBlcnBldHVhbCxLVj0y")

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
})

const UncheckedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" width="1em" height="1em">
        <g fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="0.1em">
            <rect x="1.5" y="1.5" width="30" height="30" rx="7.8" ry="7.8"/>
        </g>
    </svg>
)

const CheckedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" width="1em" height="1em">
        <g fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="0.1em">
            <rect x="1.5" y="1.5" width="30" height="30" rx="7.8" ry="7.8"/>
            <circle cx="16.29" cy="16.73" r="4.5" fill="currentColor" strokeWidth="0"/>
        </g>
    </svg>
)

const App = () => {
    const theme = useTheme()
    const {t} = useTranslation()

    const {
        visibleRange,
        parameters,
        mountPoints,
        measurements,
        titleCharts,
        setMapOverlay,
        getReports,
        typeChart, urlGETMeasurements
    } = useContext()
    const {currentUser, logout} = useAuthContext()
    const {language} = useAppContext()

    const leftPaperRef = useRef(null)
    const [leftPaperSize, setLeftPaperSize] = useState(30)
    const [rightPaperSize, setRightPaperSize] = useState(70)
    const [usersOpen, usersSetOpen] = useState(false)
    const [openUploadMap, setOpenUploadMap] = useState(false)
    const [reportsOpen, reportsSetOpen] = useState(false)
    const [reportsSelected, reportsSetSelected] = useState("")
    const [reportsOptions, reportsSetOptions] = useState([])
    const [reportsSelectedRange, reportsSetSelectedRange] = useState([null, null])
    const [reportsSelectedOptions, reportsSetSelectedOptions] = useState([])
    const anchor = "right"
    const [state, setState] = useState({
        top: false,
        left: false,
        bottom: false,
        right: false,
    })

    const toggleDrawer = (anchor, open) => (event) => {
        if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
            return
        }

        setState({...state, [anchor]: open})
    }

    const paperChangeSize = (e, axis = "x") => {
        const isTouchEvent = e.type === "touchstart"
        const startCoordinate = axis === "x"
            ? (isTouchEvent ? e.touches[0].clientX : e.clientX)
            : (isTouchEvent ? e.touches[0].clientY : e.clientY)

        const totalSize = axis === "x" ? window.innerWidth : window.innerHeight

        const handleMove = (moveEvent) => {
            const currentCoordinate = axis === "x"
                ? (moveEvent.touches ? moveEvent.touches[0].clientX : moveEvent.clientX)
                : (moveEvent.touches ? moveEvent.touches[0].clientY : moveEvent.clientY)

            const moveDistance = currentCoordinate - startCoordinate

            let newLeftSize = leftPaperSize + (moveDistance * 100) / totalSize
            let newRightSize = rightPaperSize - (moveDistance * 100) / totalSize

            newLeftSize = Math.min(Math.max(newLeftSize, 30), 70)
            newRightSize = Math.min(Math.max(newRightSize, 30), 70)

            setLeftPaperSize(newLeftSize)
            setRightPaperSize(newRightSize)
        }

        const handleEnd = () => {
            document.removeEventListener("mousemove", handleMove)
            document.removeEventListener("mouseup", handleEnd)
            document.removeEventListener("touchmove", handleMove)
            document.removeEventListener("touchend", handleEnd)
        }

        if (isTouchEvent) {
            document.addEventListener("touchmove", handleMove, {passive: false})
            document.addEventListener("touchend", handleEnd)
        } else {
            document.addEventListener("mousemove", handleMove)
            document.addEventListener("mouseup", handleEnd)
        }
    }

    const reportsHandleChangeSelect = (event) => {
        const value = event.target.value
        reportsSetSelected(value)
        reportsSetSelectedOptions([])

        if (value === "mountPoints") {
            reportsSetOptions(mountPoints)
        } else if (value === "parameters") {
            reportsSetOptions(parameters)
        } else if (value === "crashs") {
            reportsSetOptions([{
                name: t("sensorManager.reports.crashs.all"),
            }])
        } else {
            reportsSetOptions([])
        }
    }

    const reportsHandleSelectOptions = (event) => {
        const value = event.target.value

        if (Array.isArray(value)) {
            reportsSetSelectedOptions(value)
        } else {
            if (reportsSelectedOptions.some(option => option.name === value.name)) {
                reportsSetSelectedOptions(reportsSelectedOptions.filter(option => option.name !== value.name))
            } else {
                reportsSetSelectedOptions([...reportsSelectedOptions, value])
            }
        }
    }

    const reportsHandleClose = () => {
        reportsSetOptions([])
        reportsSetOpen(false)
        reportsSetSelected("")
        reportsSetSelectedOptions([])
        reportsSetSelectedRange([null, null])
    }

    const reportsHandle = async (event) => {
        const urls = {
            "mountPoints": "mount-points",
            "parameters": "parameters",
            "crashs": "crashs",
        }
        const ids = reportsSelectedOptions.map(option => option.id).join(",")
        const timestamps = reportsSelectedRange.map(date => date ? Math.floor(new Date(date).getTime() / 1000) : null)

        const [filename, data] = await getReports(urls[reportsSelected], ids, timestamps[0], timestamps[1], event.target.innerText.toLowerCase())

        const url = window.URL.createObjectURL(new Blob([data]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", filename)
        link.style.display = "none"
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
    }

    const reportsQuickHandle = async (event) => {
        const urls = {
            "mount-point": "mount-points",
            "parameter": "parameters",
        }

        const [filename, data] = await getReports(
            urls[typeChart],
            urlGETMeasurements.split("/").pop(),
            visibleRange["start"],
            visibleRange["end"],
            event.target.innerText.toLowerCase()
        )

        const url = window.URL.createObjectURL(new Blob([data]))
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", filename)
        link.style.display = "none"
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
    }

    const handleUploadMap = async (event) => {
        const file = event.target.files[0]
        if (file) {
            const formData = new FormData()
            formData.append("file", file)

            try {
                const response = await axios({
                    method: "post",
                    url: `http://${process.env.REACT_APP_API_URL}/map`,
                    data: formData,
                })
                setMapOverlay(response.data)
            } catch (error) {
                if (process.env.NODE_ENV === "development") {
                    console.error("Error Upload Map", error)
                }
            } finally {
                setState({...state, [anchor]: false})
                setOpenUploadMap(false)
            }
        }
    }

    useEffect(() => {
        dayjs.locale(language)
    }, [language])


    return (
        <>
            <Box width="100vw" height="100vh" display="flex" flexDirection="column" gap={1} p={1}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box display={{xs: "none", md: "block"}}><Logo/></Box>
                    <Stack direction="row" justifyContent="center" alignItems="center" gap={0.67}>
                        <Crash/>
                        <ThemeSwitcher/>
                        <LanguageSwitcher/>
                    </Stack>
                    <Button
                        onClick={toggleDrawer(anchor, true)}
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
                        <MenuOutlined/>
                    </Button>
                    <Drawer
                        anchor={anchor}
                        open={state[anchor]}
                        onClose={toggleDrawer(anchor, false)}
                    >
                        <Stack onClick={toggleDrawer(false)} justifyContent="space-between" sx={{
                            height: "100%"
                        }}>
                            <List sx={{
                                padding: "2.25rem 0.75rem",
                                textTransform: "uppercase",
                                "& .MuiListItemIcon-root": {
                                    color: theme.palette.secondary.main,
                                },
                                "& .MuiListItemButton-root:hover": {
                                    background: "inherit",
                                }
                            }}>
                                <ListItem
                                    onClick={() => reportsSetOpen(true)}
                                    disablePadding
                                    sx={{
                                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        "& .MuiListItemIcon-root": {
                                            color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        },
                                    }}
                                >
                                    <ListItemButton>
                                        <ListItemIcon>
                                            <FormatListBulleted/>
                                        </ListItemIcon>
                                        <ListItemText primary={t("sensorManager.reports.handle")}/>
                                    </ListItemButton>
                                </ListItem>
                                {currentUser && currentUser["permission"] === 255 ? (
                                    <>
                                        <ListItem
                                            onClick={() => setOpenUploadMap(true)}
                                            disablePadding
                                            sx={{
                                                color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                                "& .MuiListItemIcon-root": {
                                                    color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                                },
                                            }}
                                        >
                                            <ListItemButton>
                                                <ListItemIcon>
                                                    <FormatListBulleted/>
                                                </ListItemIcon>
                                                <ListItemText primary={t("sensorManager.admin.map.handle")}/>
                                            </ListItemButton>
                                        </ListItem>
                                        <ListItem
                                            onClick={() => usersSetOpen(true)}
                                            disablePadding
                                            sx={{
                                                color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                                "& .MuiListItemIcon-root": {
                                                    color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                                },
                                            }}
                                        >
                                            <ListItemButton>
                                                <ListItemIcon>
                                                    <FormatListBulleted/>
                                                </ListItemIcon>
                                                <ListItemText primary={t("auth.admin.users.handle")}/>
                                            </ListItemButton>
                                        </ListItem>
                                    </>
                                ) : null}
                            </List>
                            <Stack>
                                <Typography sx={{
                                    color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.8rem",
                                    marginBottom: "1.5rem",
                                    textTransform: "uppercase",
                                }}>
                                    <PersonOutline/>
                                    {currentUser["email"]}
                                </Typography>
                                <Button onClick={logout} sx={{
                                    color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                    fontSize: "0.8rem",
                                    marginBottom: "1.25rem",
                                    justifyContent: "flex-end",
                                    "&:hover": {
                                        background: "none",
                                    },
                                }}>
                                    {t("sensorManager.logout")}
                                    <Logout sx={{
                                        marginLeft: "1rem",
                                    }}/>
                                </Button>
                            </Stack>
                        </Stack>
                    </Drawer>
                </Stack>
                <Stack overflow="auto" direction={{xs: "column", md: "row"}} flex={1} gap={1} p={1}>
                    <Paper ref={leftPaperRef} sx={{
                        overflow: "hidden",
                        background: theme.palette.mode === "light" ? "#ffffff" : "#313538",
                        width: {
                            xs: "100%",
                            md: `${leftPaperSize}%`,
                        },
                        height: {
                            xs: `${leftPaperSize}%`,
                            md: "100%",
                        },
                    }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            zIndex: 2,
                            width: "100%",
                            gap: "1rem",
                            padding: "1rem",
                        }}>
                            <Parameters parentRef={leftPaperRef}/>
                            <Search/>
                        </Stack>
                        <Map/>
                    </Paper>
                    <Divider
                        onMouseDown={(e) => paperChangeSize(e, "x")}
                        onTouchStart={(e) => paperChangeSize(e, "x")}
                        orientation="vertical"
                        sx={{
                            width: "0.15rem",
                            cursor: "ew-resize",
                            touchAction: "none",
                            display: {
                                xs: "none",
                                md: "block"
                            },
                            background: theme.palette.mode === "light" ? "#ffffff" : "#013048",
                            "&:hover, &:active": {
                                background: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                            },
                        }}
                    />
                    <Divider
                        onMouseDown={(e) => paperChangeSize(e, "y")}
                        onTouchStart={(e) => paperChangeSize(e, "y")}
                        sx={{
                            height: "0.15rem",
                            cursor: "ew-resize",
                            touchAction: "none",
                            display: {
                                xs: "block",
                                md: "none"
                            },
                            "@media (hover: none)": {
                                "&:hover": {
                                    pointerEvents: "none",
                                },
                            },
                            background: theme.palette.mode === "light" ? "#ffffff" : "#013048",
                            "&:hover, &:active": {
                                background: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                            },
                        }}
                    />
                    <Paper sx={{
                        background: theme.palette.mode === "light" ? "#ffffff" : "#313538",
                        width: {
                            xs: "100%",
                            md: `${rightPaperSize}%`,
                        },
                        height: {
                            xs: `${rightPaperSize}%`,
                            md: "100%",
                        },
                    }}>
                        <Stack height="100%" alignItems="center" gap={1} p={1}>
                            <Stack width="100%" direction="row" alignItems="center" gap={1}>
                                <TimeIntervalsCharts/>
                                <Box sx={{
                                    overflow: "hidden",
                                    background: theme.palette.mode === "light" ? "#008f79" : "#6a3f52",
                                    height: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    margin: "auto",
                                    color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                    fontSize: "1.2rem",
                                    borderRadius: "1rem",
                                    textTransform: "uppercase",
                                    fontWeight: 600,
                                }}>
                                    <Typography sx={{
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        background: theme.palette.mode === "light" ? "#008f79" : "#6a3f52",
                                        margin: "auto",
                                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        fontSize: "1.2rem",
                                        borderRadius: "1rem",
                                        padding: "0 0.9rem",
                                        textTransform: "uppercase",
                                        fontWeight: 600,
                                    }}>
                                        {titleCharts ? titleCharts : t("sensorManager.charts.title")}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Box width="100%" display="flex" justifyContent="center" alignItems="center" overflow="auto"
                                 flex={1}>
                                <Charts/>
                            </Box>
                            <ButtonGroup sx={{
                                boxShadow: "none",
                                "& .MuiButtonGroup-grouped": {
                                    "&:not(:last-of-type)::before": {
                                        content: "''",
                                        position: "absolute",
                                        zIndex: 1,
                                        right: "-0.05rem",
                                        width: "0.15rem",
                                        height: "50%",
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        borderRadius: "1rem"
                                    },
                                    "&.Mui-disabled::before": {
                                        background: "rgba(0, 0, 0, 0.25)",
                                    },
                                    "&:first-of-type": {
                                        borderRadius: "1rem 0 0 1rem",
                                    },
                                    "&:last-of-type": {
                                        borderRadius: "0 1rem 1rem 0",
                                    },
                                }
                            }}>
                                {["PDF", "XLSX", "CSV"].map((key) => (
                                    <Button
                                        key={key}
                                        onClick={reportsQuickHandle}
                                        disabled={!measurements}
                                        sx={{
                                            fontWeight: 600,
                                            color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                            background: theme.palette.mode === "light" ? "#008f79" : "#6a3f52",
                                            fontSize: "1rem",
                                            minWidth: "auto",
                                            boxShadow: "none",
                                            borderRadius: "222rem",
                                            border: "none",
                                            position: "relative",
                                            padding: "0.75rem 1.25rem",
                                            "&:hover": {
                                                color: theme.palette.mode === "light" ? "#008f79" : "#6a3f52",
                                                background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                                boxShadow: "none",
                                            },
                                            "&:active": {
                                                boxShadow: "none",
                                            },
                                            "&.Mui-disabled": {
                                                background: "rgba(0, 0, 0, 0.25)",
                                            },
                                        }}
                                    >
                                        {key}
                                    </Button>
                                ))}
                            </ButtonGroup>
                        </Stack>
                    </Paper>
                </Stack>
            </Box>

            <Modal
                open={reportsOpen}
                onClose={reportsHandleClose}
            >
                <Box sx={{
                    width: {
                        xs: "100%",
                        sm: "40rem",
                    },
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                    padding: "1.75rem 2.5rem",
                    borderRadius: "1.75rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}>
                    <FormControl
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                },
                                "& fieldset": {
                                    borderWidth: "0.2rem",
                                    borderColor: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                    "& legend": {
                                        fontSize: "1rem",
                                    }
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                },
                                "&.Mui-error fieldset": {
                                    borderColor: "#d32f2f",
                                },
                            },

                            "& .MuiInputBase-root": {
                                borderRadius: "0.825rem",
                                "&.Mui-focused fieldset": {
                                    borderWidth: "0.2rem",
                                },
                            },
                            "& .MuiInputBase-input": {
                                height: "auto",
                                color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                fontWeight: 600,
                                fontSize: "1rem",
                                padding: "0.6rem",
                            },
                            "& label.Mui-focused": {
                                color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                            },
                            "& label": {
                                textTransform: "uppercase",
                                fontWeight: 400,
                                color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
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
                    >
                        <InputLabel id="reports-select-label">{t("sensorManager.reports.select")}</InputLabel>
                        <Select
                            labelId="reports-select-label"
                            id="reports-select"
                            value={reportsSelected}
                            label={t("sensorManager.reports.select")}
                            onChange={reportsHandleChangeSelect}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        background: theme.palette.mode === "light" ? "#ffffff" : "#313538",
                                        padding: "0.75rem",
                                    }
                                },
                                sx: {
                                    "& .MuiList-root": {
                                        maxHeight: 175,
                                        overflow: "auto",
                                    },
                                },
                            }}
                            sx={{
                                "&:not(.Mui-disabled) .MuiSelect-icon": {
                                    color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                },
                            }}
                        >
                            <MenuItem
                                value={"crashs"}
                                sx={{
                                    height: "auto",
                                    width: "100%",
                                    fontWeight: 600,
                                    fontSize: "0.85rem",
                                    color: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                    background: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "0.5rem",
                                    textTransform: "uppercase",
                                    marginBottom: "0.6rem",
                                    "&:hover": {
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                    },
                                    "&.Mui-selected": {
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                        "&:hover": {
                                            color: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                            background: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                        },
                                    },
                                }}
                            >{t("sensorManager.reports.crashs.select")}</MenuItem>
                            <MenuItem
                                value={"parameters"}
                                sx={{
                                    width: "100%",
                                    fontWeight: 600,
                                    fontSize: "0.85rem",
                                    color: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                    background: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                    height: "auto",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "0.5rem",
                                    textTransform: "uppercase",
                                    marginBottom: "0.6rem",
                                    "&:hover": {
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                    },
                                    "&.Mui-selected": {
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                        "&:hover": {
                                            color: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                            background: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                        },
                                    },
                                }}
                            >{t("sensorManager.reports.parameters.select")}</MenuItem>
                            <MenuItem
                                value={"mountPoints"}
                                sx={{
                                    width: "100%",
                                    fontWeight: 600,
                                    fontSize: "0.85rem",
                                    color: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                    background: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                    height: "auto",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "0.5rem",
                                    textTransform: "uppercase",
                                    "&:hover": {
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                    },
                                    "&.Mui-selected": {
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                        "&:hover": {
                                            color: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                            background: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                        },
                                    },
                                }}
                            >{t("sensorManager.reports.mountPoints.select")}</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl
                        disabled={!reportsSelected}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                },
                                "& fieldset": {
                                    borderWidth: "0.2rem",
                                    borderColor: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                    "& legend": {
                                        fontSize: "1rem",
                                    }
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                },
                                "&.Mui-error fieldset": {
                                    borderColor: "#d32f2f",
                                },
                            },
                            "& .MuiInputBase-root": {
                                borderRadius: "0.825rem",
                                "&.Mui-focused fieldset": {
                                    borderWidth: "0.2rem",
                                },
                            },
                            "& .MuiInputBase-input": {
                                height: "auto",
                                color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                fontWeight: 600,
                                fontSize: "1rem",
                                padding: "0.6rem",
                            },
                            "& label.Mui-focused": {
                                color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                            },
                            "& label": {
                                textTransform: "uppercase",
                                fontWeight: 400,
                                color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
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
                    >
                        <InputLabel
                            id="reports-options-label"
                        >
                            {t(`sensorManager.reports.${reportsSelected || "un"}.select`)}
                        </InputLabel>
                        <Select
                            labelId="reports-options-label"
                            id="reports-options-checkbox"
                            multiple
                            value={reportsSelectedOptions}
                            onChange={reportsHandleSelectOptions}
                            input={<OutlinedInput
                                label={t(`sensorManager.reports.${reportsSelected || "un"}.select`)}/>}
                            renderValue={(selected) => selected.map(option => option.name).join(", ")}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        background: theme.palette.mode === "light" ? "#ffffff" : "#313538",
                                        padding: "0.75rem",
                                    }
                                },
                                sx: {
                                    "*::-webkit-scrollbar-track": {
                                        borderColor: theme.palette.mode === "light" ? "#ffffff" : "#313538",
                                        background: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                                    },
                                    "*::-webkit-scrollbar-thumb": {
                                        background: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                                    },
                                    "& .MuiList-root": {
                                        maxHeight: 350,
                                        overflow: "auto",
                                    },
                                },
                            }}
                            sx={{
                                "&:not(.Mui-disabled) .MuiSelect-icon": {
                                    color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                },
                            }}
                        >
                            {reportsOptions.map((option, index) => (
                                <MenuItem key={index} value={option} sx={{
                                    gap: 0.5,
                                    height: "auto",
                                    "&:hover": {
                                        background: "transparent",
                                    },
                                    "&.Mui-selected": {
                                        background: "transparent",
                                        "&:hover": {
                                            background: "transparent",
                                        },
                                    },
                                }}>
                                    <Checkbox
                                        icon={<UncheckedIcon/>}
                                        checkedIcon={<CheckedIcon/>}
                                        checked={reportsSelectedOptions.some(o => o.name === option.name)}
                                        sx={{
                                            padding: 0,
                                            fontSize: "1.65rem",
                                            color: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                            "&:hover": {
                                                background: "transparent",
                                            },
                                            "&.Mui-checked": {
                                                color: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                            },
                                        }}
                                    />
                                    <ListItemText primary={option.name} sx={{
                                        "& .MuiTypography-root": {
                                            fontWeight: 600,
                                            fontSize: "0.85rem",
                                        },
                                        width: "100%",
                                        color: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                        background: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                        padding: "0.5rem 1rem",
                                        borderRadius: "0.5rem",
                                        textTransform: "uppercase",
                                        "&:hover": {
                                            background: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                            color: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                        },
                                        "&.Mui-selected": {
                                            background: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                            color: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                            "&:hover": {
                                                color: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                                background: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                            },
                                        },
                                    }}/>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <LocalizationProvider
                        dateAdapter={AdapterDayjs}
                        adapterLocale={language}
                        localeText={locales[language]}
                    >
                        <DemoContainer components={["DateRangePicker"]}>
                            <MobileDateRangePicker
                                value={reportsSelectedRange}
                                disabled={reportsSelectedOptions.length === 0}
                                onChange={(value) => {
                                    reportsSetSelectedRange(value)
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                        },
                                        "& fieldset": {
                                            borderWidth: "0.2rem",
                                            borderColor: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                            "& legend": {
                                                fontSize: "1rem",
                                            }
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        },
                                        "&.Mui-error fieldset": {
                                            borderColor: "#d32f2f",
                                        },
                                    },
                                    "& .MuiInputBase-root": {
                                        borderRadius: "0.825rem",
                                        "&.Mui-focused fieldset": {
                                            borderWidth: "0.2rem",
                                        },
                                    },
                                    "& .MuiInputBase-input": {
                                        height: "auto",
                                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        fontWeight: 400,
                                        fontSize: "1rem",
                                        padding: "0.6rem",
                                    },
                                    "& label.Mui-focused": {
                                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                    },
                                    "& label": {
                                        textTransform: "uppercase",
                                        fontWeight: 400,
                                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
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
                                    "& .MuiMultiInputDateRangeField-separator": {
                                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                    },
                                }}
                            />
                        </DemoContainer>
                    </LocalizationProvider>
                    <ButtonGroup sx={{
                        boxShadow: "none",
                        margin: "auto",
                        "& .MuiButtonGroup-grouped": {
                            "&:not(:last-of-type)::before": {
                                content: "''",
                                position: "absolute",
                                zIndex: 1,
                                right: "-0.05rem",
                                width: "0.15rem",
                                height: "50%",
                                background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                                borderRadius: "1rem"
                            },
                            "&:first-of-type": {
                                borderRadius: "1rem 0 0 1rem",
                            },
                            "&:last-of-type": {
                                borderRadius: "0 1rem 1rem 0",
                            },
                        }
                    }}>
                        {["PDF", "XLSX", "CSV"].map((key) => (
                            <Button
                                key={key}
                                onClick={reportsHandle}
                                disabled={!reportsSelectedRange[0] && !reportsSelectedRange[1]}
                                sx={{
                                    fontWeight: 600,
                                    color: theme.palette.mode === "light" ? "#008f79" : "#013048",
                                    background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                    fontSize: "1rem",
                                    minWidth: "auto",
                                    boxShadow: "none",
                                    borderRadius: "222rem",
                                    border: "none",
                                    position: "relative",
                                    padding: "0.75rem 1.25rem",
                                    "&:hover": {
                                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                                        boxShadow: "none",
                                    },
                                    "&:active": {
                                        boxShadow: "none",
                                    },
                                    "&.Mui-disabled": {
                                        background: "rgba(0, 0, 0, 0.26)",
                                    },
                                }}
                            >
                                {key}
                            </Button>
                        ))}
                    </ButtonGroup>
                </Box>
            </Modal>

            {currentUser && currentUser["permission"] === 255 ? (
                <>
                    <Modal
                        open={openUploadMap}
                        onClose={() => setOpenUploadMap(false)}
                    >
                        <Box sx={{
                            width: {
                                xs: "100%",
                                sm: "33.5rem",
                            },
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                            padding: "1.75rem 2.5rem",
                            borderRadius: "1.75rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "1rem",
                        }}>
                            <Typography sx={{
                                color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                fontSize: "0.8rem",
                                textTransform: "uppercase",
                                fontWeight: 600,
                            }}>
                                {t("sensorManager.admin.map.title")}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" gap={6}>
                                <Button onClick={() => setOpenUploadMap(false)} sx={{
                                    width: "100%",
                                    padding: "0.45rem",
                                    borderRadius: "0.65rem",
                                    color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                    background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                }}>
                                    {t("sensorManager.admin.map.chanel")}
                                </Button>
                                <Button
                                    component="label"
                                    sx={{
                                        width: "100%",
                                        padding: "0.45rem",
                                        borderRadius: "0.65rem",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                    }}>
                                    {t("sensorManager.admin.map.access")}
                                    <VisuallyHiddenInput
                                        type="file"
                                        accept="image/svg+xml"
                                        onChange={handleUploadMap}
                                    />
                                </Button>
                            </Box>
                        </Box>
                    </Modal>

                    <Modal
                        open={usersOpen}
                        onClose={() => usersSetOpen(false)}
                    >
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            flexDirection="column"
                            gap={1.75}
                            sx={{
                                width: {
                                    xs: "100%",
                                    md: "75%",
                                },
                                height: "50%",
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                                padding: "1.15rem 1.75rem 1.75rem 0.5rem",
                                borderRadius: "1.75rem",
                            }}
                        >
                            <Users/>
                        </Box>
                    </Modal>
                </>
            ) : null}
        </>
    )
}

export default App
