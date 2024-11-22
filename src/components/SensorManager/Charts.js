import dayjs from "dayjs"
import {debounce} from "lodash"
import {useEffect, useRef, memo} from "react"
import {useTranslation} from "react-i18next"
import {createChart} from "lightweight-charts"
import {useTheme} from "@mui/material/styles"
import {
    Box,
    Stack,
    Typography,
} from "@mui/material"

import Loading from "components/Loading"

import {useContext} from "components/SensorManager/Context"


function hslToHex(h, s, l) {
    s /= 100
    l /= 100
    const k = n => (n + h / 30) % 12
    const a = s * Math.min(l, 1 - l)
    const f = n =>
        l - a * Math.max(Math.min(k(n) - 3, 9 - k(n), 1), -1)
    const toHex = x => Math.round(x * 255).toString(16).padStart(2, "0")
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`
}

function generateColor(index, total) {
    const hue = (index * (360 / total)) % 360
    return hslToHex(hue, 70, 50)
}

const chartOptions = (chartContainerRef, theme) => {
    return {
        timeScale: {
            timeVisible: true,
        },
        localization: {
            timeFormatter: (timestamp) => dayjs.unix(timestamp).format("D MM 'YY HH:mm"),
        },
        grid: {
            vertLines: {
                visible: false,
            },
            horzLines: {
                visible: false,
            },
        },
        layout: {
            attributionLogo: false,
            background: {
                color: "rgba(0,0,0,0)"
            },
            textColor: theme.palette.mode === "light" ? "#0087dd" : "#fff",
            fontSize: 0.8 * parseFloat(getComputedStyle(document.documentElement).fontSize),
        },
        width: chartContainerRef.current.clientWidth,
    }
}

const Charts = memo(() => {
    const theme = useTheme()
    const {t} = useTranslation()
    const chartRef = useRef(null)
    const seriesMap = useRef({})
    const chartContainerRef = useRef()
    const earliestDataTime = useRef()
    const {
        sensors,
        loading,
        typeChart,
        measurements,
        getMeasurements,
        urlGETMeasurements,
        timeIntervalCharts,
        valuesTimeInterval,
        setVisibleRange
    } = useContext()


    const logVisibleRange = (visibleRange) => {
        if (visibleRange) {
            const {from, to} = visibleRange;
            setVisibleRange({
                start: from,
                end: to,
            });
        }
    };

    useEffect(() => {
        const sockets = []

        if (!chartContainerRef.current) return

        if (measurements && Object.keys(measurements).length > 0) {
            chartContainerRef.current.innerHTML = ""

            if (typeChart === "parameter") {
                const chart = createChart(
                    chartContainerRef.current,
                    {
                        ...chartOptions(chartContainerRef, theme),
                        crosshair: {
                            horzLine: {
                                labelVisible: false,
                                visible: false,
                            },
                        },
                        height: chartContainerRef.current.clientHeight,
                    },
                )
                chartRef.current = chart

                // Легенда
                const legend = document.createElement("div")
                legend.className = "chart-legend"
                legend.style = `position: absolute; top: 0; z-index: 1;`
                chartContainerRef.current.appendChild(legend)

                // Создаем серию и добавляем данные
                Object.keys(measurements).forEach((key, index) => {
                    let color = generateColor(index, Object.keys(measurements).length)
                    const series = chart.addLineSeries({
                        color: color,
                    })
                    series.setData(measurements[key])
                    seriesMap.current[key] = series

                    // Добавляем элемент в легенду
                    const legendItem = document.createElement("div")
                    legendItem.innerHTML = key
                    legendItem.style.color = color
                    legend.appendChild(legendItem)

                    // Отслеживаем курсор
                    chart.subscribeCrosshairMove(param => {
                        let valueFormatted = ""
                        if (param.time) {
                            const data = param.seriesData.get(series)
                            if (data !== undefined) {
                                valueFormatted = data.value.toFixed(2)
                            }
                        }
                        legendItem.innerHTML = `${key} <strong>${valueFormatted}</strong>`
                    })

                    // WebSocket
                    if (valuesTimeInterval(new Date())[timeIntervalCharts] === 0) {
                        const item = sensors.find(sensor => sensor.mount_point && sensor.mount_point.name === key)

                        const socket = new WebSocket(
                            `ws://${process.env.REACT_APP_API_URL}/measurements/notifications/${item.id}`
                        )

                        socket.onmessage = (event) => {
                            if (process.env.NODE_ENV === "development") {
                                console.log("WS Listen Sensors:", event.data)
                            }

                            series.update(JSON.parse(event.data))
                        }
                        sockets.push(socket)
                    }
                })

                if (chartRef.current && chartRef.current.timeScale()) {
                    chartRef.current.timeScale().subscribeVisibleTimeRangeChange(logVisibleRange)
                }

                // Находим самое раннее время
                earliestDataTime.current = Math.min(
                    ...Object.values(measurements).flat().map(m => m.time)
                )

                // Устанавливаем видимый диапазон времени
                const to = chart.timeScale().getVisibleRange().to;
                chart.timeScale().setVisibleRange({from: to - 86400, to: to})

                // Функция для обработки подгрузки данных
                const handleRangeChange = debounce(async (visibleRange) => {
                    if (!visibleRange) return

                    const {from, to} = visibleRange

                    if (from < (earliestDataTime.current + (to - from))) {
                        const newMeasurements = await getMeasurements(urlGETMeasurements, {
                            params: {
                                "end": earliestDataTime.current,
                            }
                        })

                        if (process.env.NODE_ENV === "development") {
                            console.log("Log UP Measurements", newMeasurements)
                        }

                        if (Object.keys(newMeasurements).length === 0) {
                            chart.timeScale().unsubscribeVisibleTimeRangeChange(handleRangeChange)
                            return
                        }

                        // Обновляем существующую серию или создаем новую
                        Object.keys(newMeasurements).forEach((key, index) => {
                            if (seriesMap.current[key]) {
                                // Если серия существует, дополняем ее
                                seriesMap.current[key].setData([...newMeasurements[key], ...seriesMap.current[key].data()])
                            } else {
                                // Создаем новую серию, если её нет
                                const series = chart.addLineSeries({
                                    color: generateColor(index, Object.keys(newMeasurements).length),
                                })
                                series.setData(newMeasurements[key])
                                seriesMap.current[key] = series

                                // Обновляем легенду
                                const legendItem = document.createElement("div")
                                legendItem.innerHTML = key
                                legendItem.style.color = theme.palette.mode === "light" ? "#0087dd" : "#ff8c69"
                                legend.appendChild(legendItem)

                                chart.subscribeCrosshairMove(param => {
                                    let valueFormatted = ""
                                    if (param.time) {
                                        const data = param.seriesData.get(series)
                                        if (data !== undefined) {
                                            valueFormatted = data.value.toFixed(2)
                                        }
                                    }
                                    legendItem.innerHTML = `${key} <strong>${valueFormatted}</strong>`
                                })
                            }
                        })

                        // Обновляем самое раннее время
                        earliestDataTime.current = Math.min(
                            ...Object.values(newMeasurements).flat().map(m => m.time)
                        )
                    }
                }, 500)

                // Подписываемся на изменения временного диапазона
                chart.timeScale().subscribeVisibleTimeRangeChange(handleRangeChange)

                // Следим за изменением размеров контейнера
                const resizeObserver = new ResizeObserver(() => {
                    requestAnimationFrame(() => {
                        if (chartContainerRef.current) {
                            chart.applyOptions({
                                width: chartContainerRef.current.clientWidth,
                                height: chartContainerRef.current.clientHeight,
                            })
                        }
                    })
                })
                resizeObserver.observe(chartContainerRef.current)

                // Очищаем все при размонтировании
                return () => {
                    if (chartRef.current) {
                        chartRef.current.timeScale().unsubscribeVisibleTimeRangeChange(logVisibleRange)
                        chartRef.current.remove()
                    }
                    resizeObserver.disconnect()
                    sockets.forEach(socket => socket.close())
                }
            } else if (typeChart === "mount-point") {
                chartRef.current = {}
                earliestDataTime.current = {}
                seriesMap.current = {}

                Object.keys(measurements).forEach((key, index) => {
                    // Добавляем название графика в DOM
                    const chartTitle = document.createElement("div")
                    chartTitle.className = "chart-title"
                    chartTitle.style = `color: ${theme.palette.mode === "light" ? "#0087dd" : "#ff8c69"}; text-align: center; font-weight: bold; text-transform: uppercase;`
                    chartTitle.innerHTML = key
                    chartContainerRef.current.appendChild(chartTitle)

                    const chart = createChart(
                        chartContainerRef.current,
                        {
                            ...chartOptions(chartContainerRef, theme),
                            height: 10 * parseFloat(getComputedStyle(document.documentElement).fontSize),
                        },
                    )
                    chartRef.current[key] = chart

                    const series = chart.addLineSeries({
                        color: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                    })
                    series.setData(measurements[key])
                    seriesMap.current[key] = series

                    // Сохраняем самое раннее время
                    earliestDataTime.current[key] = Math.min(
                        ...Object.values(measurements[key]).flat().map(m => m.time)
                    )

                    // Функция для подгрузки данных
                    const handleRangeChange = debounce(async (visibleRange) => {
                        if (!visibleRange) return

                        const {from, to} = visibleRange

                        if (from < (earliestDataTime.current[key] + (to - from))) {
                            const newMeasurements = await getMeasurements(urlGETMeasurements, {
                                params: {
                                    "end": earliestDataTime.current[key],
                                }
                            })

                            if (process.env.NODE_ENV === "development") {
                                console.log("Log UP Measurements", newMeasurements)
                            }

                            if (Object.keys(newMeasurements).length === 0) {
                                chart.timeScale().unsubscribeVisibleTimeRangeChange(handleRangeChange)
                                return
                            }

                            // Обновляем данные для существующей серии
                            if (newMeasurements[key]) {
                                const updatedData = [...newMeasurements[key], ...series.data()]
                                series.setData(updatedData)

                                // Обновляем самое раннее время для этого ключа
                                earliestDataTime.current[key] = Math.min(
                                    ...Object.values(updatedData).map(m => m.time)
                                )
                            }
                        }
                    }, 500)

                    // Устанавливаем видимый диапазон времени
                    const to = chart.timeScale().getVisibleRange().to;
                    chart.timeScale().setVisibleRange({from: to - 86400, to: to})
                    chart.timeScale().subscribeVisibleTimeRangeChange(handleRangeChange)

                    if (chartRef.current[key] && chartRef.current[key].timeScale()) {
                        chartRef.current[key].timeScale().subscribeVisibleTimeRangeChange(logVisibleRange)
                    }

                    // Следим за изменениями размера контейнера
                    const resizeObserver = new ResizeObserver(() => {
                        requestAnimationFrame(() => {
                            if (chartContainerRef.current) {
                                chart.applyOptions({
                                    width: chartContainerRef.current.clientWidth,
                                    height: 10 * parseFloat(getComputedStyle(document.documentElement).fontSize),
                                })
                            }
                        })
                    })
                    resizeObserver.observe(chartContainerRef.current)

                    // WebSocket
                    if (valuesTimeInterval(new Date())[timeIntervalCharts] === 0) {
                        const item = sensors.find(sensor => sensor.parameter && sensor.parameter.name === key)

                        const socket = new WebSocket(
                            `ws://${process.env.REACT_APP_API_URL}/measurements/notifications/${item.id}`
                        )

                        socket.onmessage = (event) => {
                            if (process.env.NODE_ENV === "development") {
                                console.log("WS Listen Sensors:", event.data)
                            }

                            series.update(JSON.parse(event.data))
                        }
                        sockets.push(socket)
                    }

                    // Очищаем все при размонтировании
                    return () => {
                        chart.remove()
                        resizeObserver.disconnect()
                        sockets.forEach(socket => socket.close())
                    }
                })
            }
        }

        document.querySelectorAll("#tv-attr-logo").forEach(el => el.remove())

        return () => {
            sockets.forEach(socket => socket.close())
            Object.values(chartRef.current).forEach(chart => chart.remove())
        }
    }, [measurements])

    useEffect(() => {
        if (chartContainerRef.current) {
            const chartTitles = chartContainerRef.current.querySelectorAll(".chart-title")
            chartTitles.forEach((title) => {
                title.style.color = theme.palette.mode === "light" ? "#0087dd" : "#ff8c69"
            })

            const chartLegends = chartContainerRef.current.querySelectorAll(".chart-legend")
            chartLegends.forEach((title) => {
                title.style.color = theme.palette.mode === "light" ? "#0087dd" : "#ff8c69"
            })

            if (seriesMap.current && typeChart === "mount-point") {
                Object.values(seriesMap.current).forEach((series, index) => {
                    series.applyOptions({
                        color: theme.palette.mode === "light" ? "#0087dd" : "#ff8c69",
                    })
                })
            }

            if (chartRef.current && typeChart === "mount-point") {
                Object.values(chartRef.current).forEach((chart, index) => {
                    chart.applyOptions({
                        layout: {
                            textColor: theme.palette.mode === "light" ? "#0087dd" : "#fff",
                        },
                    })
                })
            }

            if (chartRef.current && typeChart === "parameter") {
                chartRef.current.applyOptions({
                    layout: {
                        textColor: theme.palette.mode === "light" ? "#0087dd" : "#fff",
                    },
                })
            }
        }
    }, [theme])

    if (loading) {
        return <Loading/>
    }

    if (!measurements || Object.keys(measurements).length === 0) {
        return <Typography>{t("sensorManager.charts.no")}</Typography>
    }

    return (
        <Stack gap={3} sx={{
            width: "100%",
            height: "100%",
            overflowY: "auto",
        }}>
            <Box ref={chartContainerRef} sx={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflowX: "hidden",
                scrollbarGutter: "stable",
                "::-webkit-scrollbar-track": {
                    borderColor: theme.palette.mode === "light" ? "#ffffff" : "#313538",
                    background: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                },
                "::-webkit-scrollbar-thumb": {
                    background: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                },
            }}/>
        </Stack>
    )
})

export default Charts
