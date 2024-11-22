import dayjs from "dayjs"
import axios from "axios"
import * as React from "react"
import {useTranslation} from "react-i18next"
import duration from "dayjs/plugin/duration"

import App from "components/SensorManager/App"


dayjs.extend(duration)

const Context = React.createContext(undefined)

export const useContext = () => React.useContext(Context)

export const Provider = () => {
    const {t, i18n} = useTranslation()

    const [sensors, setSensors] = React.useState([])
    const [parameters, setParameters] = React.useState([])
    const [mountPoints, setMountPoints] = React.useState([])
    const [measurements, setMeasurements] = React.useState()
    const [urlGETMeasurements, setUrlGETMeasurements] = React.useState()

    const [loading, setLoading] = React.useState(false)
    const [mapOverlay, setMapOverlay] = React.useState(null)
    const [typeChart, setTypeChart] = React.useState("")
    const [titleCharts, setTitleCharts] = React.useState()
    const [allIntervalsLabel, setAllIntervalsLabel] = React.useState(t("sensorManager.charts.allIntervals"))
    const [timeIntervalCharts, setTimeIntervalCharts] = React.useState(allIntervalsLabel)
    const [visibleRange, setVisibleRange] = React.useState({})
    const valuesTimeInterval = (now = null) => ({
        [allIntervalsLabel]: 0,
        "1H": 3600,
        "1D": 86400,
        "1W": 604800,
        "1M": now ? dayjs.duration(dayjs(now).add(1, "month").diff(now)).asSeconds() : 0,
        "1Y": now ? dayjs.duration(dayjs(now).add(1, "year").diff(now)).asSeconds() : 0,
    })

    const getMeasurements = async (url, {params = {}} = {}) => {
        try {
            const response = await axios({
                method: "get",
                url: `http://${process.env.REACT_APP_API_URL}/measurements${url}`,
                params: {
                    ...params,
                    "interval": valuesTimeInterval(new Date())[timeIntervalCharts],
                },
            })

            setUrlGETMeasurements(url)
            return response.data
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error GET Measurements", error.message)
            }
        }
    }

    const getReports = async (url, ids, start, end, fileFormat) => {
        try {
            const response = await axios({
                method: "get",
                url: `http://${process.env.REACT_APP_API_URL}/reports/${url}`,
                params: {
                    "ids": ids,
                    "start": start,
                    "end": end,
                    "file_format": fileFormat,
                },
                responseType: "blob",
            })

            const contentDisposition = response.headers["content-disposition"]
            const filename = contentDisposition
                ? contentDisposition.split("filename=")[1].replace(/[""]/g, "")
                : `report.${fileFormat}`

            return [filename, response.data]
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error GET Reports", error.message)
            }
        }
    }

    const getSensors = async () => {
        try {
            const response = await axios.get(`http://${process.env.REACT_APP_API_URL}/sensors`)
            setSensors(response.data)
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error GET Sensors", error.message)
            }
        }
    }

    const getParameters = async () => {
        try {
            const response = await axios.get(`http://${process.env.REACT_APP_API_URL}/parameters`)
            setParameters(response.data)
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error GET Parameters", error.message)
            }
        }
    }

    const getMountPoints = async () => {
        try {
            const response = await axios.get(`http://${process.env.REACT_APP_API_URL}/mount-points`)
            setMountPoints(response.data)
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error GET Mount Points", error.message)
            }
        }
    }

    const getMapOverlay = async () => {
        try {
            const response = await axios({
                method: "get",
                url: `http://${process.env.REACT_APP_API_URL}/map`,
            })

            setMapOverlay(response.data)
        } catch (error) {
            setMapOverlay(error.status)

            if (process.env.NODE_ENV === "development") {
                console.error("Error GET Map", error.message)
            }
        }
    }

    const getData = async () => {
        try {
            await Promise.all([getSensors(), getParameters(), getMountPoints()])
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error GET data:", error)
            }
        }
    }

    React.useEffect(() => {
        const newLabel = t("sensorManager.charts.allIntervals")
        setAllIntervalsLabel(newLabel)
        if (timeIntervalCharts === allIntervalsLabel) {
            setTimeIntervalCharts(newLabel)
        }
    }, [i18n.language, t, allIntervalsLabel, timeIntervalCharts])

    React.useEffect(() => {
        getMapOverlay()
            .then(() => {
            })
            .catch((error) => {
                if (process.env.NODE_ENV === "development") {
                    console.error("Error GET Map:", error)
                }
            })

        getData()
            .then(() => {
            })
            .catch((error) => {
                if (process.env.NODE_ENV === "development") {
                    console.error("Error GET data:", error)
                }
            })
    }, [])

    React.useEffect(() => {
        if (!urlGETMeasurements) return

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
    }, [timeIntervalCharts, urlGETMeasurements])

    React.useEffect(() => {
        const socket = new WebSocket(`ws://${process.env.REACT_APP_API_URL}/sensors/notifications`)

        socket.onmessage = (event) => {
            if (process.env.NODE_ENV === "development") {
                console.log("WS Listen Sensors:", event.data)
            }

            getData()
                .then(() => {
                })
                .catch((error) => {
                    if (process.env.NODE_ENV === "development") {
                        console.error("Error WS GET data:", error)
                    }
                })
        }

        return () => {
            socket.close()
        }
    }, [])


    return (
        <Context.Provider value={{
            sensors, setSensors,
            parameters,
            mountPoints, setMountPoints,
            measurements, setMeasurements,
            getMeasurements, getReports,
            urlGETMeasurements, setUrlGETMeasurements,
            mapOverlay, setMapOverlay,
            typeChart, setTypeChart,
            titleCharts, setTitleCharts,
            valuesTimeInterval, timeIntervalCharts, setTimeIntervalCharts,
            setLoading, loading, visibleRange, setVisibleRange,
        }}>
            <App/>
        </Context.Provider>
    )
}
