import axios from "axios"
import * as React from "react"
import {useNavigate} from "react-router-dom"

import Loading from "components/Loading"


const Context = React.createContext(undefined)

export const useContext = () => React.useContext(Context)

export const Provider = ({children}) => {
    const navigate = useNavigate()
    const [users, setUsers] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [currentUser, setCurrentUser] = React.useState(null)
    const [isAuthenticated, setIsAuthenticated] = React.useState(false)

    const logout = async () => {
        try {
            await axios.post(`http://${process.env.REACT_APP_API_URL}/auth/logout`, {}, {
                withCredentials: true,
            })
            setIsAuthenticated(false)
            setCurrentUser(null)
            navigate("/login")
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Logout error:", error)
            }
        }
    }

    const getUsers = async () => {
        try {
            const response = await axios({
                method: "get",
                url: `http://${process.env.REACT_APP_API_URL}/users`,
            })

            setUsers(response.data)
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error GET Users", error.message)
            }
        }
    }

    const checkAuth = async () => {
        try {
            const response = await axios.post(`http://${process.env.REACT_APP_API_URL}/auth/check`, {}, {
                withCredentials: true,
            })
            setCurrentUser(response.data)
            setIsAuthenticated(true)
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error Auth Check:", error)
            }
            setCurrentUser(null)
            setIsAuthenticated(false)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        checkAuth()
            .then(() => {
            })
            .catch((error) => {
                if (process.env.NODE_ENV === "development") {
                    console.error("Error Auth Check:", error)
                }
            })

        getUsers()
            .then(() => {
            })
            .catch((error) => {
                if (process.env.NODE_ENV === "development") {
                    console.error("Error GET Users:", error)
                }
            })
    }, [])

    if (loading) {
        return <Loading/>
    }

    return (
        <Context.Provider value={{
            users, setUsers,
            currentUser, setCurrentUser,
            isAuthenticated, setIsAuthenticated,
            logout
        }}>
            {children}
        </Context.Provider>
    )
}
