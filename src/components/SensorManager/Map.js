import axios from "axios"
import L from "leaflet"
import "leaflet.markercluster"
import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"
import {useTranslation} from "react-i18next"
import {useState, useEffect, useRef, useCallback} from "react"
import {MapContainer, useMap} from "react-leaflet"
import {useTheme} from "@mui/material/styles"
import {
    Box,
    Button, Checkbox,
    FormControl,
    InputLabel,
    Menu,
    MenuItem,
    Modal,
    Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField,
    Typography
} from "@mui/material"

import Loading from "components/Loading"
import {useContext} from "components/SensorManager/Context"
import {useContext as useAuthContext} from "components/Auth/Context"


const inputStyle = (notValid, theme) => ({
    "& .MuiOutlinedInput-root": {
        "& fieldset": {
            border: "none",
            color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
            "& legend": {
                fontSize: "0.7rem",
                fontWeight: 600,
                textTransform: "uppercase",
            }
        },
        "&.Mui-focused fieldset": {
            color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
        },
        "&.Mui-error fieldset": {
            borderColor: "#d32f2f",
        },
    },
    "& .MuiInputBase-root": {
        borderRadius: "0.75rem",
    },
    "& .MuiInputBase-input": {
        borderRadius: "0.75rem",
        height: "auto",
        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
        fontWeight: 600,
        fontSize: "0.7rem",
        padding: "0.7rem 1rem",
        border: "none",
        background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
        textTransform: "uppercase",
    },
    "& label.Mui-focused": {
        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
    },
    "& label": {
        fontWeight: 600,
        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
        fontSize: "0.7rem",
        textTransform: "uppercase",
        transform: "translate(1rem, calc(50% + 0.375rem)) scale(1)",
        "&.MuiInputLabel-shrink": {
            display: "none",
        },
    },
    "& label.Mui-error": {
        color: "#d32f2f",
    },
    "& .MuiFormHelperText-root": {
        visibility: notValid ? "visible" : "hidden",
        fontSize: "0.75rem",
        minHeight: "0.75rem",
    },
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


const CustomMarkers = ({setSensor, setAnchor}) => {
    const theme = useTheme()
    const map = useMap()
    const {
        sensors,
        setTypeChart,
        setTitleCharts,
        setUrlGETMeasurements,
    } = useContext()

    const styleIcon = {
        width: "100%",
        height: "100%",
        fontFamily: "'Montserrat'",
        borderRadius: "50%",
        backgroundColor: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
        color: theme.palette.mode === "light" ? "#c4fcef" : "#013048",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: "0.85rem",
    }

    const styleIconString = Object.entries(styleIcon)
        .map(([key, value]) => {
            const kebabKey = key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
            return `${kebabKey}: ${value};`
        })
        .join("")

    const customIcon = (text) => {
        return new L.DivIcon({
            html: `<div style="${styleIconString}">${text}</div>`,
            className: "",
            iconSize: L.point(40, 40, true),
        })
    }

    const createClusterCustomIcon = (cluster) => {
        return new L.DivIcon({
            html: `<div style="${styleIconString}">${cluster.getChildCount()}</div>`,
            className: "",
            iconSize: L.point(50, 50, true),
        })
    }

    useEffect(() => {
        if (!sensors || sensors.length === 0) return

        const markerCluster = L.markerClusterGroup({
            iconCreateFunction: createClusterCustomIcon,
            showCoverageOnHover: false,
        })

        sensors.forEach((sensor) => {
            if (!sensor.position || !sensor.position.lat || !sensor.position.lng) return

            const icon = customIcon(sensor.parameter.symbol)

            const leafletMarker = L.marker([sensor.position.lat, sensor.position.lng], {icon})

            leafletMarker.on("click", () => {
                setTypeChart("mount-point")
                setTitleCharts(sensor.mount_point.name)
                setUrlGETMeasurements(`/mount-point/${sensor.mount_point.id}`)
            })

            leafletMarker.on("contextmenu", (event) => {
                L.DomEvent.preventDefault(event.originalEvent)
                setSensor(sensor)
                setAnchor({top: event.originalEvent.clientY, left: event.originalEvent.clientX})
            })

            leafletMarker.addTo(markerCluster)
        })

        map.addLayer(markerCluster)

        return () => {
            map.removeLayer(markerCluster)
        }
    }, [map, sensors, theme])

    return null
}

const Overlay = ({overlay, bounds}) => {
    const overlayRef = useRef(null)
    const map = useMap()

    useEffect(() => {
        if (!overlay || !bounds) return

        if (overlayRef.current) {
            map.removeLayer(overlayRef.current)
        }

        const tempDiv = document.createElement("div")
        tempDiv.innerHTML = overlay
        const svgElement = tempDiv.querySelector("svg")

        svgElement.setAttribute("width", "100%")
        svgElement.setAttribute("height", "100%")

        const svgOverlay = L.svgOverlay(svgElement, bounds)
        svgOverlay.addTo(map)

        overlayRef.current = svgOverlay

        return () => {
            if (overlayRef.current) {
                map.removeLayer(overlayRef.current)
            }
        }
    }, [map, overlay, bounds])

    return null
}

const Map = () => {
    const theme = useTheme()
    const {t} = useTranslation()
    const {currentUser} = useAuthContext()

    const [mapInstance, setMapInstance] = useState(null)
    const [bounds, setBounds] = useState(null)
    const [center, setCenter] = useState([0, 0])
    const {
        setLoading,
        mapOverlay,
        sensors,
        mountPoints,
        setMountPoints,
        getMeasurements,
        setMeasurements,
        urlGETMeasurements,
        setTitleCharts,
        titleCharts,
    } = useContext()

    const [anchorMap, setAnchorMap] = useState(null)
    const [anchorSensor, setAnchorSensor] = useState(null)
    const [openAddTM, setOpenAddTM] = useState(false)
    const [openDeleteTM, setOpenDeleteTM] = useState(false)
    const [openUpdateTM, setOpenUpdateTM] = useState(false)
    const [openRenameTM, setOpenRenameTM] = useState(false)
    const [openDeleteSensor, setOpenDeleteSensor] = useState(false)
    const [openAddSensorSelectTM, setOpenAddSensorSelectTM] = useState(false)
    const [openAddSensorSelectSensors, setOpenAddSensorSelectSensors] = useState(false)

    const [sensor, setSensor] = useState()
    const [nameTM, setNameTM] = useState("")
    const [addSensorSelectTM, setAddSensorSelectTM] = useState("")
    const [selectSensors, setSelectSensors] = useState(null)
    const [addSensorPositionSensor, setAddSensorPositionSensor] = useState(null)

    const [nameTMNotValid, setNameTMNotValid] = useState(false)

    const handleContextMenu = useCallback((event) => {
        event.preventDefault()

        if (!event.target.closest(".leaflet-marker-icon")) {
            setAnchorMap({top: event.clientY, left: event.clientX})

            if (mapInstance) {
                const {clientX, clientY} = event
                const mapContainer = mapInstance.getContainer()
                const point = L.point(
                    clientX - mapContainer.getBoundingClientRect().left,
                    clientY - mapContainer.getBoundingClientRect().top
                )

                setAddSensorPositionSensor(mapInstance.containerPointToLatLng(point))
            }
        }
    }, [mapInstance]);

    const handleCloseAddSensorSelectTM = () => {
        setAddSensorSelectTM("")
        setOpenAddSensorSelectTM(false)
    }

    const handleCloseAddSensorSelectSensors = () => {
        handleCloseAddSensorSelectTM()
        setSelectSensors(null)
        setOpenAddSensorSelectSensors(false)
    }

    const handleAddSensor = async () => {
        try {
            selectSensors["mount_point"] = addSensorSelectTM
            selectSensors["position"] = addSensorPositionSensor

            await axios({
                method: "put",
                url: `http://${process.env.REACT_APP_API_URL}/sensors/${selectSensors["id"]}`,
                data: selectSensors,
            })

            if (urlGETMeasurements) {

                setLoading(true)

                getMeasurements(urlGETMeasurements)
                    .then((data) => {
                        setMeasurements(data)
                    })
                    .catch((error) => {
                        if (process.env.NODE_ENV === "development") {
                            console.error("Error GET Measurements for timeIntervalCharts:", error)
                        }
                    })
                    .finally(() => {
                        setLoading(false)
                    })
            }

            handleCloseAddSensorSelectSensors()
        } catch (error) {
            if (error.status === 404) {
                alert(error.response.data.detail)
            }

            if (process.env.NODE_ENV === "development") {
                console.error("Error Add Sensor", error.message)
            }
        }
    }

    const handleCloseDeleteSensor = () => {
        setSensor(null)
        setOpenDeleteSensor(false)
    }

    const handleDeleteSensor = async () => {
        try {
            await axios({
                method: "delete",
                url: `http://${process.env.REACT_APP_API_URL}/sensors/${sensor["id"]}`,
            })

            if (urlGETMeasurements) {

                setLoading(true)

                getMeasurements(urlGETMeasurements)
                    .then((data) => {
                        setMeasurements(data)
                    })
                    .catch((error) => {
                        if (process.env.NODE_ENV === "development") {
                            console.error("Error GET Measurements for timeIntervalCharts:", error)
                        }
                    })
                    .finally(() => {
                        setLoading(false)
                    })
            }

            handleCloseDeleteSensor()
        } catch (error) {
            if (error.status === 404) {
                alert(error.response.data.detail)
            }

            if (process.env.NODE_ENV === "development") {
                console.error("Error Delete Sensor", error.message)
            }
        }
    }

    const handleChangeNameTM = (event) => {
        const value = event.target.value
        setNameTM(value)

        if (value.length > 50) {
            setNameTMNotValid(true)
        } else {
            setNameTMNotValid(false)
        }
    }

    const handleCloseAddTM = () => {
        setNameTM("")
        setOpenAddTM(false)
        setNameTMNotValid(false)
    }

    const handleAddTM = async () => {
        try {
            const response = await axios({
                method: "post",
                url: `http://${process.env.REACT_APP_API_URL}/mount-points`,
                data: {
                    name: nameTM,
                }
            })

            handleCloseAddTM()
            setMountPoints([...mountPoints, response.data])
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error Add TM", error.message)
            }
        }
    }

    const handleCloseDeleteTM = () => {
        setSensor(null)
        setOpenDeleteTM(false)
    }

    const handleDeleteTM = async () => {
        try {
            const response = await axios({
                method: "delete",
                url: `http://${process.env.REACT_APP_API_URL}/mount-points/${sensor["mount_point"]["id"]}`,
            })

            setMountPoints((prevMountPoints) =>
                prevMountPoints.filter((mountPoint) => mountPoint.id !== response.data.id)
            )
            handleCloseDeleteTM()
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error Delete TM", error.message)
            }
        }
    }

    const handleCloseUpdateTM = () => {
        setSensor(null)
        setSelectSensors(null)
        setOpenUpdateTM(false)
    }

    const handleUpdateTM = async () => {
        try {
            await axios({
                method: "put",
                url: `http://${process.env.REACT_APP_API_URL}/sensors`,
                data: selectSensors.map(sensor => ({
                    ...sensor,
                    mount_point: null,
                    position: null,
                }))
            })

            if (urlGETMeasurements) {

                setLoading(true)

                getMeasurements(urlGETMeasurements)
                    .then((data) => {
                        setMeasurements(data)
                    })
                    .catch((error) => {
                        if (process.env.NODE_ENV === "development") {
                            console.error("Error GET Measurements for timeIntervalCharts:", error)
                        }
                    })
                    .finally(() => {
                        setLoading(false)
                    })
            }

            handleCloseUpdateTM()
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error Update TM", error.message)
            }
        }
    }

    const handleCloseRenameTM = () => {
        setNameTM("")
        setOpenRenameTM(false)
        setNameTMNotValid(false)
    }

    const handleRenameTM = async () => {
        try {
            const response = await axios({
                method: "put",
                url: `http://${process.env.REACT_APP_API_URL}/mount-points/${sensor["mount_point"]["id"]}`,
                data: {
                    id: sensor["mount_point"]["id"],
                    name: nameTM,
                },
            })

            if (sensor["mount_point"]["name"] === titleCharts) {
                setTitleCharts(response.data.name)
            }

            setMountPoints((prevMountPoints) =>
                prevMountPoints.map((mountPoint) =>
                    mountPoint.id === response.data.id ? response.data : mountPoint
                )
            )

            sensor["mount_point"] = response.data

            handleCloseRenameTM()
        } catch (error) {
            if (error.status === 404) {
                alert(error.response.data.detail)
            }

            if (process.env.NODE_ENV === "development") {
                console.error("Error Rename TM", error.message)
            }
        }
    }

    const columns = [
        {
            label: t("sensorManager.admin.sensors.controller"),
            dataKey: "id_controller",
            width: 150,
        },
        {
            label: t("sensorManager.admin.sensors.parameter"),
            dataKey: "parameter.name",
            width: 250,
        },
        {
            label: t("sensorManager.admin.sensors.address"),
            dataKey: "address",
            width: 150,
        },
    ]

    function getNestedValue(obj, path) {
        return path.split(".").reduce((acc, key) => acc && acc[key] !== null ? acc[key] : "null", obj)
    }

    function handleCheckboxClick(row, selectionMode = "single") {
        if (selectionMode === "single") {
            setSelectSensors(row)
        } else {
            setSelectSensors((prev) => {
                if (prev?.some((selected) => selected.id === row.id)) {
                    return prev.filter((selected) => selected.id !== row.id)
                } else {
                    return [...(prev || []), row]
                }
            })
        }
    }

    useEffect(() => {
        if (mapInstance) {
            mapInstance.getContainer().addEventListener("contextmenu", handleContextMenu);

            return () => {
                mapInstance.getContainer().removeEventListener("contextmenu", handleContextMenu);
            };
        }
    }, [mapInstance, handleContextMenu]);

    useEffect(() => {
        if (mapOverlay === 404) return

        const img = new Image()
        img.src = `http://${process.env.REACT_APP_API_URL}/map`
        img.onload = () => {
            setBounds([[0, 0], [img.height, img.width]])
            setCenter([img.height / 2, img.width / 2])
        }
    }, [mapOverlay])

    if (!bounds) {
        return (
            <Box width="100%" height="100%" display="flex" justifyContent="center" alignItems="center">
                {mapOverlay === 404 ? t("sensorManager.admin.map.404") : <Loading/>}
            </Box>
        )
    }

    return (
        <>
            <Box sx={{
                width: "100%",
                height: "100%",
                color: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
            }}>
                <MapContainer
                    center={center}
                    zoom={2}
                    scrollWheelZoom={true}
                    crs={L.CRS.Simple}
                    minZoom={1}
                    maxZoom={4}
                    zoomControl={false}
                    attributionControl={false}
                    whenReady={({target}) => setMapInstance(target)}
                    style={{
                        zIndex: 1,
                        height: "100%",
                        background: "rgba(0,0,0,0)"
                    }}
                >
                    <Overlay overlay={mapOverlay} bounds={bounds}/>
                    <CustomMarkers setSensor={setSensor} setAnchor={setAnchorSensor}/>
                </MapContainer>
            </Box>

            {currentUser && currentUser["permission"] === 255 ? (
                <>
                    <Menu
                        open={Boolean(anchorMap)}
                        onClose={() => setAnchorMap(null)}
                        anchorReference="anchorPosition"
                        anchorPosition={anchorMap}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "left",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                        }}
                        sx={{
                            "& .MuiPaper-root": {
                                background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                                textTransform: "uppercase",
                                borderRadius: "1rem",
                            },
                            "& .MuiList-root": {
                                padding: 0,
                            },
                            "& .MuiMenuItem-root": {
                                color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                fontWeight: 600,
                                fontSize: "0.65rem",
                                padding: "0.5rem",
                            },
                        }}
                    >
                        <MenuItem
                            onClick={() => {
                                setAnchorMap(null)
                                setOpenAddSensorSelectTM(true)
                            }}
                        >
                            {t("sensorManager.admin.sensors.add.handle")}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                setAnchorMap(null)
                                setOpenAddTM(true)
                            }}
                        >
                            {t("sensorManager.admin.mountPoints.add.handle")}
                        </MenuItem>
                    </Menu>

                    <Menu
                        open={Boolean(anchorSensor)}
                        onClose={() => setAnchorSensor(null)}
                        anchorReference="anchorPosition"
                        anchorPosition={anchorSensor}
                        anchorOrigin={{
                            vertical: "top",
                            horizontal: "left",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "left",
                        }}
                        sx={{
                            "& .MuiPaper-root": {
                                background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                                textTransform: "uppercase",
                                borderRadius: "1rem",
                            },
                            "& .MuiList-root": {
                                padding: 0,
                            },
                            "& .MuiMenuItem-root": {
                                color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                fontWeight: 600,
                                fontSize: "0.65rem",
                                padding: "0.5rem",
                            },
                        }}
                    >
                        <MenuItem
                            onClick={() => {
                                setAnchorSensor(null)
                                setOpenDeleteSensor(true)
                            }}
                        >
                            {t("sensorManager.admin.sensors.delete.handle")}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                setAnchorSensor(null)
                                setOpenUpdateTM(true)
                            }}
                        >
                            {t("sensorManager.admin.mountPoints.update.handle")}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                setAnchorSensor(null)
                                setOpenDeleteTM(true)
                            }}
                        >
                            {t("sensorManager.admin.mountPoints.delete.handle")}
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                setAnchorSensor(null)
                                setOpenRenameTM(true)
                            }}
                        >
                            {t("sensorManager.admin.mountPoints.rename.handle")}
                        </MenuItem>
                    </Menu>


                    <Modal
                        open={openAddSensorSelectTM}
                        onClose={handleCloseAddSensorSelectTM}
                    >
                        <Box sx={{
                            width: "25rem",
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
                            {(mountPoints && mountPoints.length !== 0) ? (
                                <>
                                    <Typography sx={{
                                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        fontSize: "0.8rem",
                                        textTransform: "uppercase",
                                        fontWeight: 600,
                                    }}>
                                        {t("sensorManager.admin.sensors.add.selectTM.confirm")}
                                    </Typography>
                                    <FormControl
                                        fullWidth
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
                                            id="addSensor-selectTM-label"
                                        >
                                            {t("sensorManager.admin.sensors.add.selectTM.label")}
                                        </InputLabel>
                                        <Select
                                            labelId="addSensor-selectTM-label"
                                            id="addSensor-selectTM-checkbox"
                                            value={addSensorSelectTM}
                                            onChange={(event) => setAddSensorSelectTM(event.target.value)}
                                            label={t("sensorManager.admin.sensors.add.selectTM.label")}
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
                                            {mountPoints.map((mountPoint, index) => (
                                                <MenuItem
                                                    key={index}
                                                    value={mountPoint}
                                                    sx={{
                                                        "& .MuiTypography-root": {
                                                            fontWeight: 600,
                                                            fontSize: "0.7rem",
                                                        },
                                                        width: "100%",
                                                        fontWeight: 600,
                                                        fontSize: "0.7rem",
                                                        color: theme.palette.mode === "light" ? "#c4fcef" : "#6a3f52",
                                                        background: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                                                        padding: "0.5rem 1rem",
                                                        borderRadius: "0.5rem",
                                                        textTransform: "uppercase",
                                                        marginBottom: "0.5rem",
                                                        "&:last-of-type": {
                                                            marginBottom: 0,
                                                        },
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
                                                >
                                                    {mountPoint.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </>
                            ) : (
                                <Typography sx={{
                                    color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                    fontSize: "0.8rem",
                                    textTransform: "uppercase",
                                    fontWeight: 600,
                                }}>
                                    {t("sensorManager.admin.sensors.add.selectTM.notTM")}
                                </Typography>
                            )}

                            <Box display="flex" justifyContent="space-between" gap={6}>
                                <Button
                                    onClick={handleCloseAddSensorSelectTM}
                                    sx={{
                                        width: "100%",
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        padding: "0.75rem 0",
                                        borderRadius: "0.65rem",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    {t("sensorManager.admin.mountPoints.add.chanel")}
                                </Button>
                                <Button
                                    onClick={() => setOpenAddSensorSelectSensors(true)}
                                    disabled={!addSensorSelectTM}
                                    sx={{
                                        width: "100%",
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        padding: "0.75rem 0",
                                        borderRadius: "0.65rem",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    {t("sensorManager.admin.mountPoints.add.access")}
                                </Button>
                            </Box>
                        </Box>
                    </Modal>


                    <Modal
                        open={openAddSensorSelectSensors}
                        onClose={handleCloseAddSensorSelectSensors}
                    >
                        <Box sx={{
                            width: "75%",
                            height: "50%",
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                            padding: "1.15rem 1.75rem 1.75rem 0.5rem",
                            borderRadius: "1.75rem",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            gap: "1rem",
                        }}>
                            {(sensors.filter(sensor => sensor.mount_point === null).length > 0) ? (
                                <>
                                    <TableContainer
                                        sx={{
                                            "::-webkit-scrollbar-track": {
                                                borderColor: theme.palette.mode === "light" ? "#008f79" : "#013048",
                                                background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                            },
                                            "::-webkit-scrollbar-thumb": {
                                                background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                            },
                                        }}
                                    >
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{
                                                        width: 50,
                                                        border: "none",
                                                        transform: "translateY(-1px)",
                                                        background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                                                    }}/>
                                                    {columns.map((column) => (
                                                        <TableCell
                                                            key={column.dataKey}
                                                            sx={{
                                                                padding: 0.6,
                                                                width: column.width,
                                                                border: "none",
                                                                textAlign: "center",
                                                                overflow: "hidden",
                                                                textOverflow: "ellipsis",
                                                                transform: "translateY(-1px)",
                                                                background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                                                            }}
                                                        >
                                                            <Typography
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    fontSize: "0.7rem",
                                                                    color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                                                    background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                                                    padding: "1rem 0",
                                                                    borderRadius: "0.75rem",
                                                                    letterSpacing: "0.5px",
                                                                    textTransform: "uppercase",
                                                                }}
                                                            >
                                                                {column.label}
                                                            </Typography>
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {sensors
                                                    .filter((sensor) => sensor.mount_point === null)
                                                    .map((row, index) => {
                                                        const isSelected = selectSensors?.id === row.id

                                                        return (
                                                            <TableRow
                                                                key={row.id}
                                                                selected={isSelected}
                                                                sx={{
                                                                    "&.Mui-selected": {
                                                                        background: "transparent",
                                                                        ":hover": {
                                                                            background: "transparent",
                                                                        },
                                                                    },
                                                                }}
                                                            >
                                                                <TableCell
                                                                    padding="checkbox"
                                                                    sx={{
                                                                        border: "none",
                                                                        textAlign: "center",
                                                                        overflow: "hidden",
                                                                        textOverflow: "ellipsis",
                                                                    }}
                                                                >
                                                                    <Checkbox
                                                                        checked={isSelected}
                                                                        onClick={() => handleCheckboxClick(row, "single")}
                                                                        icon={<UncheckedIcon/>}
                                                                        checkedIcon={<CheckedIcon/>}
                                                                        sx={{
                                                                            padding: 0,
                                                                            fontSize: "1.65rem",
                                                                            color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                                                            "&.Mui-checked": {
                                                                                color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                                                            },
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                {columns.map((column) => (
                                                                    <TableCell
                                                                        key={column.dataKey}
                                                                        sx={{
                                                                            border: "none",
                                                                            textAlign: "center",
                                                                            overflow: "hidden",
                                                                            textOverflow: "ellipsis",
                                                                            padding: 0.6,
                                                                        }}
                                                                    >
                                                                        <Typography
                                                                            sx={{
                                                                                fontWeight: 600,
                                                                                fontSize: "0.7rem",
                                                                                color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                                                                background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                                                                padding: "0.5rem 0",
                                                                                borderRadius: "0.5rem",
                                                                                letterSpacing: "0.5px",
                                                                                textTransform: "uppercase",
                                                                            }}
                                                                        >
                                                                            {getNestedValue(row, column.dataKey)}
                                                                        </Typography>
                                                                    </TableCell>
                                                                ))}
                                                            </TableRow>
                                                        )
                                                    })}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <Box sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: "6rem",
                                        paddingLeft: "1.25rem",
                                    }}>
                                        <Button
                                            onClick={handleCloseAddSensorSelectSensors}
                                            sx={{
                                                width: "100%",
                                                background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                                padding: "0.75rem 0",
                                                borderRadius: "0.65rem",
                                                color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                                fontSize: "0.7rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {t("sensorManager.admin.sensors.add.chanel")}
                                        </Button>
                                        <Button
                                            onClick={handleAddSensor}
                                            disabled={!selectSensors}
                                            sx={{
                                                width: "100%",
                                                background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                                padding: "0.75rem 0",
                                                borderRadius: "0.65rem",
                                                color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                                fontSize: "0.7rem",
                                                fontWeight: 600,
                                            }}
                                        >
                                            {t("sensorManager.admin.sensors.add.access")}
                                        </Button>
                                    </Box>
                                </>
                            ) : (
                                <Typography sx={{
                                    color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                    fontSize: "0.8rem",
                                    textTransform: "uppercase",
                                    fontWeight: 600,
                                }}>
                                    {t("sensorManager.admin.sensors.add.noSensors")}
                                </Typography>
                            )}
                        </Box>
                    </Modal>


                    <Modal
                        open={openDeleteSensor}
                        onClose={handleCloseDeleteSensor}
                    >
                        <Box sx={{
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
                                {t("sensorManager.admin.sensors.delete.confirm")}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" gap={6}>
                                <Button
                                    onClick={handleCloseDeleteSensor}
                                    sx={{
                                        width: "100%",
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        padding: "0.75rem 0",
                                        borderRadius: "0.65rem",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    {t("sensorManager.admin.sensors.delete.chanel")}
                                </Button>
                                <Button
                                    onClick={handleDeleteSensor}
                                    sx={{
                                        width: "100%",
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        padding: "0.75rem 0",
                                        borderRadius: "0.65rem",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    {t("sensorManager.admin.sensors.delete.access")}
                                </Button>
                            </Box>
                        </Box>
                    </Modal>


                    <Modal
                        open={openAddTM}
                        onClose={handleCloseAddTM}
                    >
                        <Box sx={{
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
                                {t("sensorManager.admin.mountPoints.add.confirm")}
                            </Typography>
                            <TextField
                                fullWidth
                                label={t("sensorManager.admin.mountPoints.add.input")}
                                value={nameTM}
                                onChange={handleChangeNameTM}
                                error={nameTMNotValid}
                                helperText={nameTMNotValid ? t("sensorManager.admin.mountPoints.add.notValid") : ""}
                                sx={inputStyle(nameTMNotValid, theme)}/>
                            <Box display="flex" justifyContent="space-between" gap={6}>
                                <Button
                                    onClick={handleCloseAddTM}
                                    sx={{
                                        width: "100%",
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        padding: "0.75rem 0",
                                        borderRadius: "0.65rem",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    {t("sensorManager.admin.mountPoints.add.chanel")}
                                </Button>
                                <Button
                                    onClick={handleAddTM}
                                    disabled={!nameTM || nameTMNotValid}
                                    sx={{
                                        width: "100%",
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        padding: "0.75rem 0",
                                        borderRadius: "0.65rem",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    {t("sensorManager.admin.mountPoints.add.access")}
                                </Button>
                            </Box>
                        </Box>
                    </Modal>


                    <Modal
                        open={openDeleteTM}
                        onClose={handleCloseDeleteTM}
                    >
                        <Box sx={{
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
                                {t("sensorManager.admin.mountPoints.delete.confirm")}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" gap={6}>
                                <Button
                                    onClick={handleCloseDeleteTM}
                                    sx={{
                                        width: "100%",
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        padding: "0.75rem 0",
                                        borderRadius: "0.65rem",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    {t("sensorManager.admin.mountPoints.delete.chanel")}
                                </Button>
                                <Button
                                    onClick={handleDeleteTM}
                                    sx={{
                                        width: "100%",
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        padding: "0.75rem 0",
                                        borderRadius: "0.65rem",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    {t("sensorManager.admin.mountPoints.delete.access")}
                                </Button>
                            </Box>
                        </Box>
                    </Modal>

                    {sensor ? (
                        <Modal
                            open={openUpdateTM}
                            onClose={handleCloseUpdateTM}
                        >
                            <Box sx={{
                                width: "75%",
                                height: "50%",
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                                padding: "1.15rem 1.75rem 1.75rem 0.5rem",
                                borderRadius: "1.75rem",
                                textAlign: "center",
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
                                    {sensor["mount_point"]["name"]}
                                </Typography>
                                <TableContainer
                                    sx={{
                                        flexGrow: 1,
                                        "::-webkit-scrollbar-track": {
                                            borderColor: theme.palette.mode === "light" ? "#008f79" : "#013048",
                                            background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        },
                                        "::-webkit-scrollbar-thumb": {
                                            background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        },
                                    }}
                                >
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell
                                                    sx={{
                                                        width: 50,
                                                        border: "none",
                                                        transform: "translateY(-1px)",
                                                        background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                                                    }}
                                                />
                                                {columns.map((column) => (
                                                    <TableCell
                                                        key={column.dataKey}
                                                        sx={{
                                                            padding: 0.6,
                                                            width: column.width,
                                                            border: "none",
                                                            textAlign: "center",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            transform: "translateY(-1px)",
                                                            background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 600,
                                                                fontSize: "0.7rem",
                                                                color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                                                background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                                                padding: "1rem 0",
                                                                borderRadius: "0.75rem",
                                                                letterSpacing: "0.5px",
                                                                textTransform: "uppercase",
                                                            }}
                                                        >
                                                            {column.label}
                                                        </Typography>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {sensors
                                                .filter((s) => s.mount_point?.id === sensor.mount_point.id)
                                                .map((row, index) => {
                                                    const isSelected = selectSensors?.some((selected) => selected.id === row.id)

                                                    const handleCheckboxClickMultiple = () => {
                                                        setSelectSensors((prev) => {
                                                            if (prev?.some((selected) => selected.id === row.id)) {
                                                                return prev.filter((selected) => selected.id !== row.id)
                                                            } else {
                                                                return [...(prev || []), row]
                                                            }
                                                        })
                                                    }

                                                    return (
                                                        <TableRow
                                                            key={row.id}
                                                            selected={isSelected}
                                                            sx={{
                                                                "&.Mui-selected": {
                                                                    background: "transparent",
                                                                    ":hover": {
                                                                        background: "transparent",
                                                                    },
                                                                },
                                                            }}
                                                        >
                                                            <TableCell
                                                                padding="checkbox"
                                                                sx={{
                                                                    border: "none",
                                                                    textAlign: "center",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                }}
                                                            >
                                                                <Checkbox
                                                                    checked={isSelected}
                                                                    onClick={handleCheckboxClickMultiple}
                                                                    icon={<UncheckedIcon/>}
                                                                    checkedIcon={<CheckedIcon/>}
                                                                    sx={{
                                                                        padding: 0,
                                                                        fontSize: "1.65rem",
                                                                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                                                        "&.Mui-checked": {
                                                                            color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                                                        },
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            {columns.map((column) => (
                                                                <TableCell
                                                                    key={column.dataKey}
                                                                    sx={{
                                                                        padding: 0.6,
                                                                        border: "none",
                                                                        textAlign: "center",
                                                                        overflow: "hidden",
                                                                        textOverflow: "ellipsis",
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        sx={{
                                                                            fontWeight: 600,
                                                                            fontSize: "0.7rem",
                                                                            color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                                                            background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                                                            padding: "0.5rem 0",
                                                                            borderRadius: "0.5rem",
                                                                            letterSpacing: "0.5px",
                                                                            textTransform: "uppercase",
                                                                        }}
                                                                    >
                                                                        {getNestedValue(row, column.dataKey)}
                                                                    </Typography>
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    )
                                                })}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                                <Box sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: "6rem",
                                    paddingLeft: "1.25rem",
                                }}>
                                    <Button
                                        onClick={handleCloseUpdateTM}
                                        sx={{
                                            width: "100%",
                                            background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                            padding: "0.75rem 0",
                                            borderRadius: "0.65rem",
                                            color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {t("sensorManager.admin.mountPoints.update.chanel")}
                                    </Button>
                                    <Button
                                        onClick={handleUpdateTM}
                                        sx={{
                                            width: "100%",
                                            background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                            padding: "0.75rem 0",
                                            borderRadius: "0.65rem",
                                            color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                            fontSize: "0.7rem",
                                            fontWeight: 600,
                                        }}
                                    >
                                        {t("sensorManager.admin.mountPoints.update.access")}
                                    </Button>
                                </Box>
                            </Box>
                        </Modal>
                    ) : null}


                    <Modal
                        open={openRenameTM}
                        onClose={handleCloseRenameTM}
                    >
                        <Box sx={{
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
                                {t("sensorManager.admin.mountPoints.rename.confirm")}
                            </Typography>
                            <TextField
                                fullWidth
                                label={t("sensorManager.admin.mountPoints.rename.input")}
                                value={nameTM}
                                onChange={handleChangeNameTM}
                                error={nameTMNotValid}
                                helperText={nameTMNotValid ? t("sensorManager.admin.mountPoints.rename.notValid") : ""}
                                sx={inputStyle(nameTMNotValid, theme)}/>
                            <Box display="flex" justifyContent="space-between" gap={6}>
                                <Button
                                    onClick={handleCloseRenameTM}
                                    sx={{
                                        width: "100%",
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        padding: "0.75rem 0",
                                        borderRadius: "0.65rem",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    {t("sensorManager.admin.mountPoints.rename.chanel")}
                                </Button>
                                <Button
                                    onClick={handleRenameTM}
                                    disabled={!nameTM || nameTMNotValid}
                                    sx={{
                                        width: "100%",
                                        background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                        padding: "0.75rem 0",
                                        borderRadius: "0.65rem",
                                        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                    }}
                                >
                                    {t("sensorManager.admin.mountPoints.rename.access")}
                                </Button>
                            </Box>
                        </Box>
                    </Modal>
                </>
            ) : null}
        </>
    )
}

export default Map
