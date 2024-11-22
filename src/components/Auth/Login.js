import axios from "axios"
import {useState} from "react"
import {useTranslation} from "react-i18next"
import {useNavigate} from "react-router-dom"
import {useTheme} from "@mui/material/styles"
import {
    Box,
    Fade,
    Stack,
    Button,
    TextField,
    Typography
} from "@mui/material"

import {useContext} from "components/Auth/Context"

import Logo from "components/Logo"
import ThemeSwitcher from "components/ThemeSwitcher"
import LanguageSwitcher from "components/LanguageSwitcher"


const Login = () => {
    const theme = useTheme()
    const navigate = useNavigate()
    const {t} = useTranslation()
    const {setIsAuthenticated, setCurrentUser} = useContext()

    const [error, setError] = useState(false)

    const [username, setUsername] = useState("")
    const [usernameNotValid, setUsernameNotValid] = useState(false)
    const [userNameHasValue, setUserNameHasValue] = useState(false)

    const [password, setPassword] = useState("")
    const [passwordHasValue, setPasswordHasValue] = useState(false)


    const handleUsernameChange = (e) => {
        const value = e.target.value
        setUsername(value)
        setUserNameHasValue(value !== "")

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
            setUsernameNotValid(true)
        } else {
            setUsernameNotValid(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const response = await axios.post(`http://${process.env.REACT_APP_API_URL}/auth/login`, {
                username,
                password
            }, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                withCredentials: true,
            })
            setIsAuthenticated(true)
            setCurrentUser(response.data)
            navigate("/")
        } catch (error) {
            setIsAuthenticated(false)
            setCurrentUser(null)

            if (error.response.status === 404) {
                setError(true)
            }

            if (process.env.NODE_ENV === "development") {
                console.error("Error Login", error)
            }
        }
    }

    const makeAnimationStartHandler = (stateSetter) => (e) => {
        const autofilled = !!e.target?.matches("*:-webkit-autofill")
        if (e.animationName === "mui-auto-fill") {
            stateSetter(autofilled)
        }

        if (e.animationName === "mui-auto-fill-cancel") {
            stateSetter(autofilled)
        }
    }


    return (
        <Stack gap={4} sx={{
            width: "23rem",
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <ThemeSwitcher/>
                <Logo/>
                <LanguageSwitcher/>
            </Stack>

            <Stack justifyContent="center" alignItems="center" gap={2}>
                <Box sx={{
                    minHeight: "1.5rem",
                }}>
                    <Fade in={!!error}>
                        <Typography sx={{
                            color: theme.palette.mode === "light" ? "#008f79" : "#013048",
                            height: "auto",
                            fontSize: "1.5rem",
                            fontWeight: 600,
                        }}>{t("auth.error")}</Typography>
                    </Fade>
                </Box>

                <TextField
                    fullWidth
                    value={username}
                    autoComplete="username"
                    error={usernameNotValid}
                    label={t("auth.username")}
                    onChange={handleUsernameChange}
                    helperText={t("auth.usernameNotValid")}
                    inputProps={{
                        onAnimationStart: makeAnimationStartHandler(setUserNameHasValue)
                    }}
                    InputLabelProps={{
                        shrink: userNameHasValue
                    }}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.palette.mode === "light" ? "#c4fcef" : "#013048",
                            },
                            "& fieldset": {
                                borderWidth: "0.2rem",
                                borderColor: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                                "& legend": {
                                    fontSize: "1.5rem",
                                },
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderWidth: "0.2rem",
                                borderColor: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                            },
                            "&.Mui-error fieldset": {
                                borderColor: "#d32f2f",
                            },
                        },
                        "& .MuiInputBase-root": {
                            borderRadius: "222rem",
                        },
                        "& .MuiInputBase-input": {
                            height: "auto",
                            color: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                            fontWeight: 400,
                            fontSize: "1.5rem",
                            padding: "1rem",
                            borderRadius: "inherit",
                            backgroundColor: "transparent",
                            "&:-webkit-autofill": {
                                fontSize: "1.5rem",
                                WebkitBoxShadow: "0 0 0 100px transparent inset",
                                transition: "background-color 5000s ease-in-out 0s",
                            },
                        },
                        "& label.Mui-focused": {
                            color: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                        },
                        "& label": {
                            fontWeight: 400,
                            color: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                            fontSize: "1.5rem",
                            transform: "translate(1rem, calc(50% + 0.375rem)) scale(1)",
                            "&.MuiInputLabel-shrink": {
                                transform: "translate(1.5rem, -0.6rem) scale(0.75)",
                            },
                        },
                        "& label.Mui-error": {
                            color: "#d32f2f",
                        },
                        "& .MuiFormHelperText-root": {
                            visibility: usernameNotValid ? "visible" : "hidden",
                            fontSize: "0.75rem",
                            minHeight: "0.75rem",
                        },
                    }}
                />
                <TextField
                    fullWidth
                    type="password"
                    value={password}
                    label={t("auth.password")}
                    autoComplete="current-password"
                    onChange={(e) => {
                        setPassword(e.target.value)
                        setPasswordHasValue(e.target.value !== "")
                    }
                    }
                    inputProps={{
                        onAnimationStart: makeAnimationStartHandler(setPasswordHasValue)
                    }}
                    InputLabelProps={{
                        shrink: passwordHasValue
                    }}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: theme.palette.mode === "light" ? "#c4fcef" : "#013048",
                            },
                            "& fieldset": {
                                borderWidth: "0.2rem",
                                borderColor: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                                "& legend": {
                                    fontSize: "1.5rem",
                                }
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                borderWidth: "0.2rem",
                                borderColor: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                            },
                            "&.Mui-focused fieldset": {
                                borderColor: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                            },
                            "&.Mui-error fieldset": {
                                borderColor: "#d32f2f",
                            },
                        },
                        "& .MuiInputBase-root": {
                            borderRadius: "222rem",
                        },
                        "& .MuiInputBase-input": {
                            height: "auto",
                            color: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                            fontWeight: 400,
                            fontSize: "1.5rem",
                            padding: "1rem",
                            borderRadius: "inherit",
                            backgroundColor: "transparent",
                            "&:-webkit-autofill": {
                                fontSize: "1.5rem",
                                WebkitBoxShadow: "0 0 0 100px transparent inset",
                                transition: "background-color 5000s ease-in-out 0s",
                            },
                        },
                        "& label.Mui-focused": {
                            color: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                        },
                        "& label": {
                            fontWeight: 400,
                            color: theme.palette.mode === "light" ? "#008f79" : "#ff8c69",
                            fontSize: "1.5rem",
                            transform: "translate(1rem, calc(50% + 0.375rem)) scale(1)",
                            "&.MuiInputLabel-shrink": {
                                transform: "translate(1.5rem, -0.6rem) scale(0.75)",
                            },
                        },
                        "& label.Mui-error": {
                            color: "#d32f2f",
                        },
                        "& .MuiFormHelperText-root": {
                            visibility: usernameNotValid ? "visible" : "hidden",
                            fontSize: "0.75rem",
                            minHeight: "0.75rem",
                        },
                    }}
                />

                <Button
                    onClick={handleSubmit}
                    disabled={!username || !password || usernameNotValid}
                    sx={{
                        width: "100%",
                        fontWeight: 400,
                        fontSize: "1.5rem",
                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                        background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                        borderRadius: "222rem",
                        padding: "1rem",
                        textTransform: "math-auto",
                        "&:hover": {
                            color: theme.palette.mode === "light" ? "#008f79" : "#013048",
                            background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                        },
                        "&.Mui-disabled": {
                            background: "rgba(0, 0, 0, 0.26)",
                        },
                    }}
                >
                    {t("auth.submit")}
                </Button>
            </Stack>

            <Button
                href="/reset-password"
                sx={{
                    width: "100%",
                    fontWeight: 400,
                    fontSize: "1.5rem",
                    color: theme.palette.mode === "light" ? "#008f79" : "#013048",
                    background: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                    borderRadius: "222rem",
                    padding: "1rem",
                    textTransform: "math-auto",
                    "&:hover": {
                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                        background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                    },
                }}
            >
                {t("auth.recovery")}
            </Button>
        </Stack>
    )
}

export default Login
