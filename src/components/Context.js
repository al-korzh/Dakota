import * as React from "react"
import {Route, Routes, Navigate, BrowserRouter as Router} from "react-router-dom"
import {ThemeProvider, CssBaseline} from "@mui/material"

import {lightTheme, darkTheme} from "themes"

import Login from "components/Auth/Login"
import ResetPassword from "components/Auth/ResetPassword"
import {
    Provider as AuthProvider,
    useContext as useAuthContext
} from "components/Auth/Context"

import {Provider as SensorManagerProvider} from "components/SensorManager/Context"


const Context = React.createContext(undefined)

export const useContext = () => React.useContext(Context)

const PrivateRoute = ({children}) => {
    const {isAuthenticated} = useAuthContext()
    return isAuthenticated ? children : <Navigate to="/login"/>
}

export const Provider = () => {
    const [theme, setTheme] = React.useState(localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"))
    const [language, setLanguage] = React.useState(localStorage.getItem("language") || (navigator.language.split("-")[0]))
    const [error, setError] = React.useState()

    return (
        <Context.Provider value={{
            error, setError,
            theme, setTheme,
            language, setLanguage,
        }}>
            <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
                <CssBaseline/>
                <Router>
                    <AuthProvider>
                        <Routes>
                            <Route path="/login" element={<Login/>}/>
                            <Route path="/reset-password" element={<ResetPassword/>}/>
                            <Route path="/" element={<PrivateRoute><SensorManagerProvider/></PrivateRoute>}/>
                        </Routes>
                    </AuthProvider>
                </Router>
            </ThemeProvider>
        </Context.Provider>
    )
}
