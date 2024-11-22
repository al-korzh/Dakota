import axios from "axios"
import {useState} from "react"
import {useTranslation} from "react-i18next"
import {useTheme} from "@mui/material/styles"
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Typography,
    Button, InputAdornment, Box, Modal, TextField
} from "@mui/material"
import {
    Pin,
    Visibility,
    VisibilityOff,
} from "@mui/icons-material"

import {useContext} from "components/Auth/Context"


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
        padding: 0,
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


const Users = () => {
    const theme = useTheme()
    const {t} = useTranslation()

    const {users, setUsers} = useContext()
    const [selected, setSelected] = useState(null)
    const [openAdd, setOpenAdd] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    const [openUpdate, setOpenUpdate] = useState(false)

    const [email, setEmail] = useState("")
    const [permission, setPermission] = useState(null)
    const [telegramID, setTelegramID] = useState(null)
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [showPassword, setShowPassword] = useState(false)
    const [emailNotValid, setEmailNotValid] = useState(false)
    const [passwordNotValid, setPasswordNotValid] = useState(false)
    const [permissionNotValid, setPermissionNotValid] = useState(false)
    const [telegramIDNotValid, setTelegramIDNotValid] = useState(false)

    const generatePassword = (event, length = 12) => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~"
        let generatedPassword = ""

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length)
            generatedPassword += charset[randomIndex]
        }

        setPassword(generatedPassword)
        setConfirmPassword(generatedPassword)
        setPasswordNotValid(false)
    };

    const handleChangeEmail = (event) => {
        const value = event.target.value
        setEmail(value)

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
            setEmailNotValid(true)
        } else {
            setEmailNotValid(false)
        }
    }

    const handleChangePermission = (event) => {
        const value = event.target.value

        setPermission(value)
        if (value < 0 || value > 255) {
            setPermissionNotValid(true)
        } else {
            setPermissionNotValid(false)
        }
    }

    const handleChangeTelegramID = (event) => {
        const value = event.target.value

        setTelegramID(value)
        if (value.length !== 9 && value.length !== 10) {
            setTelegramIDNotValid(true)
        } else {
            setTelegramIDNotValid(false)
        }
    }

    const handleChangePassword = (event) => {
        const value = event.target.value

        setPassword(value)
        if (value !== confirmPassword) {
            setPasswordNotValid(true)
        } else {
            setPasswordNotValid(false)
        }
    }

    const handleChangeConfirmPassword = (event) => {
        const value = event.target.value

        setConfirmPassword(value)
        if (value !== password) {
            setPasswordNotValid(true)
        } else {
            setPasswordNotValid(false)
        }
    }

    const handleCloseAdd = () => {
        setEmail("")
        setPermission(null)
        setTelegramID(null)
        setPassword("")
        setConfirmPassword("")
        setOpenAdd(false)
        setEmailNotValid(false)
        setPasswordNotValid(false)
        setPermissionNotValid(false)
        setTelegramIDNotValid(false)
    }

    const handleAdd = async () => {
        try {
            const response = await axios({
                method: "post",
                url: `http://${process.env.REACT_APP_API_URL}/users`,
                data: {
                    email: email,
                    password: password,
                    telegram_id: telegramID,
                    permission: permission,
                }
            })

            handleCloseAdd()
            setUsers([...users, response.data])
        } catch (error) {
            if (error.status === 400) {
                alert(error.response.data.detail)
            }

            if (process.env.NODE_ENV === "development") {
                console.error("Error Add User", error.message)
            }
        }
    }

    const handleDelete = async () => {
        try {
            await axios({
                method: "delete",
                url: `http://${process.env.REACT_APP_API_URL}/users/${selected.id}`,
            })

            setUsers((prevUsers) => prevUsers.filter(user => user.id !== selected.id))
            setSelected(null)
            setOpenDelete(false)
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error Delete User", error.message)
            }
        }
    }

    const handleUpdate = async () => {
        try {
            await axios({
                method: "put",
                url: `http://${process.env.REACT_APP_API_URL}/users/${selected.id}`,
                data: {...selected, password: password},
            })

            setSelected(null)
            setPassword("")
            setConfirmPassword("")
            setPasswordNotValid(false)
            setOpenUpdate(false)
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Error Update User", error.message)
            }
        }
    }

    const handleSelect = (event, user) => {
        setSelected(user)
    }

    const columns = [
        {
            label: t("auth.admin.users.email"),
            dataKey: "email",
            width: 250,
        },
        {
            label: t("auth.admin.users.telegramID"),
            dataKey: "telegram_id",
            width: 150,
        },
        {
            label: t("auth.admin.users.permission"),
            dataKey: "permission",
            width: 150,
        },
    ]


    return (
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
                                        background: theme.palette.mode === "light" ? "#008f79" : "#013048"
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
                        {users.map((row, index) => (
                            <TableRow
                                key={row.id}
                                selected={selected?.id === row.id}
                                sx={{
                                    "&.Mui-selected": {
                                        ":hover": {
                                            background: "transparent",
                                        },
                                        background: "transparent",
                                    },
                                }}
                            >
                                <TableCell sx={{
                                    padding: 0,
                                    border: "none",
                                    textAlign: "center"
                                }}>
                                    <Checkbox
                                        checked={selected?.id === row.id}
                                        onClick={(event) => handleSelect(event, row)}
                                        icon={<UncheckedIcon/>}
                                        checkedIcon={<CheckedIcon/>}
                                        sx={{
                                            padding: 0.6,
                                            fontSize: "1.65rem",
                                            color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                            "&:hover": {
                                                background: "transparent",
                                            },
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
                                            {row[column.dataKey]}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>


            <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: "3rem",
                paddingLeft: "1.25rem",
            }}>
                <Button
                    onClick={() => setOpenAdd(true)}
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
                    {t("auth.admin.users.add.handle")}
                </Button>
                <Button
                    onClick={() => setOpenDelete(true)}
                    disabled={selected === null}
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
                    {t("auth.admin.users.delete.handle")}
                </Button>
                <Button
                    onClick={() => setOpenUpdate(true)}
                    disabled={selected === null}
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
                    {t("auth.admin.users.update.handle")}
                </Button>
            </Box>

            <Modal
                open={openAdd}
                onClose={handleCloseAdd}
            >
                <Box component="form" autoComplete="off" sx={{
                    width: {
                        xs: "100%",
                        sm: "25rem",
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
                        fontSize: "1.1rem",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        textAlign: "center",
                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                    }}>
                        {t("auth.admin.users.add.title")}
                    </Typography>
                    <Typography sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                    }}>
                        {t("auth.admin.users.email")}
                    </Typography>
                    <TextField
                        fullWidth
                        value={email}
                        autoComplete="new-email"
                        onChange={handleChangeEmail}
                        error={emailNotValid}
                        helperText={emailNotValid ? t("auth.admin.users.notValid.email") : ""}
                        label={t("auth.admin.users.email")}
                        sx={inputStyle(emailNotValid, theme)}/>
                    <Typography sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                    }}>
                        {t("auth.admin.users.telegramID")}
                    </Typography>
                    <TextField
                        type="number"
                        label={t("auth.admin.users.telegramID")}
                        fullWidth
                        value={telegramID}
                        onChange={handleChangeTelegramID}
                        error={telegramIDNotValid}
                        helperText={telegramIDNotValid ? t("auth.admin.users.notValid.telegramID") : ""}
                        sx={{
                            ...inputStyle(telegramIDNotValid, theme),
                            "& input[type=number]": {
                                MozAppearance: "textfield", // Убирает стрелки в Firefox
                                "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                                    WebkitAppearance: "none", // Убирает стрелки в Chrome, Safari, Edge
                                    margin: 0, // Дополнительно убирает отступы
                                },
                            },
                        }}
                    />
                    <Typography sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                    }}>
                        {t("auth.admin.users.password")}
                    </Typography>
                    <TextField
                        type={showPassword ? "text" : "password"}
                        label={t("auth.admin.users.password")}
                        fullWidth
                        autoComplete="new-password"
                        value={password}
                        onChange={handleChangePassword}
                        error={passwordNotValid}
                        helperText={passwordNotValid ? t("auth.admin.users.notValid.password") : ""}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <Box sx={{
                                        position: "absolute",
                                        top: "50%",
                                        transform: "translate(-10%, -50%)",
                                        right: 0,
                                        display: "flex",
                                    }}>
                                        <InputAdornment
                                            position="end"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            sx={{
                                                color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                                cursor: "pointer",
                                                "& .MuiSvgIcon-root": {
                                                    fontSize: "1.5rem",
                                                },
                                            }}
                                        >
                                            {showPassword ? <VisibilityOff/> : <Visibility/>}
                                        </InputAdornment>

                                        <InputAdornment
                                            position="end"
                                            onClick={generatePassword}
                                            sx={{
                                                color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                                cursor: "pointer",
                                                "& .MuiSvgIcon-root": {
                                                    fontSize: "1.5rem",
                                                },
                                            }}
                                        >
                                            <Pin/>
                                        </InputAdornment>
                                    </Box>
                                ),
                            },
                        }}
                        sx={inputStyle(passwordNotValid, theme)}/>
                    <Typography sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                    }}>
                        {t("auth.admin.users.confirmPassword")}
                    </Typography>
                    <TextField
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        autoComplete="new-password"
                        value={confirmPassword}
                        label={t("auth.admin.users.confirmPassword")}
                        onChange={handleChangeConfirmPassword}
                        error={passwordNotValid}
                        helperText={passwordNotValid ? t("auth.admin.users.notValid.password") : ""}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <Box sx={{
                                        position: "absolute",
                                        top: "50%",
                                        transform: "translate(-10%, -50%)",
                                        right: 0,
                                        display: "flex",
                                    }}>
                                        <InputAdornment
                                            position="end"
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            sx={{
                                                color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                                cursor: "pointer",
                                                "& .MuiSvgIcon-root": {
                                                    fontSize: "1.5rem",
                                                },
                                            }}
                                        >
                                            {showPassword ? <VisibilityOff/> : <Visibility/>}
                                        </InputAdornment>

                                        <InputAdornment
                                            position="end"
                                            onClick={generatePassword}
                                            sx={{
                                                color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                                cursor: "pointer",
                                                "& .MuiSvgIcon-root": {
                                                    fontSize: "1.5rem",
                                                },
                                            }}
                                        >
                                            <Pin/>
                                        </InputAdornment>
                                    </Box>
                                ),
                            },
                        }}
                        sx={inputStyle(passwordNotValid, theme)}/>
                    <Typography sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                    }}>
                        {t("auth.admin.users.permission")}
                    </Typography>
                    <TextField
                        type="number"
                        label={t("auth.admin.users.permission")}
                        fullWidth
                        value={permission}
                        onChange={handleChangePermission}
                        error={permissionNotValid}
                        helperText={permissionNotValid ? t("auth.admin.users.notValid.permission") : ""}
                        sx={{
                            ...inputStyle(permissionNotValid, theme),
                            "& input[type=number]": {
                                MozAppearance: "textfield", // Убирает стрелки в Firefox
                                "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                                    WebkitAppearance: "none", // Убирает стрелки в Chrome, Safari, Edge
                                    margin: 0, // Дополнительно убирает отступы
                                },
                            },
                        }}
                    />
                    <Box display="flex" justifyContent="space-between" gap={4}>
                        <Button
                            onClick={handleCloseAdd}
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
                            {t("auth.admin.users.add.chanel")}
                        </Button>
                        <Button
                            onClick={handleAdd}
                            disabled={!email || !password || !telegramID || !permission || emailNotValid || passwordNotValid || permissionNotValid || telegramIDNotValid}
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
                            {t("auth.admin.users.add.access")}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {selected ? (
                <>
                    <Modal
                        open={openDelete}
                        onClose={() => setOpenDelete(false)}
                    >
                        <Box sx={{
                            width: {
                                xs: "100%",
                                sm: "auto",
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
                                textAlign: "justify",
                                color: theme.palette.mode === "light" ? "#c4fcef" : "#ff8c69",
                                fontSize: "0.8rem",
                                textTransform: "uppercase",
                                fontWeight: 600,
                            }}>
                                {t("auth.admin.users.delete.confirm", {email: selected.email})}
                            </Typography>
                            <Box display="flex" justifyContent="space-between" gap={6}>
                                <Button
                                    onClick={() => setOpenDelete(false)}
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
                                    {t("auth.admin.users.delete.chanel")}
                                </Button>
                                <Button
                                    onClick={handleDelete}
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
                                    {t("auth.admin.users.delete.access")}
                                </Button>
                            </Box>
                        </Box>
                    </Modal>

                    <Modal
                        open={openUpdate}
                        onClose={() => setOpenUpdate(false)}
                    >
                        <Box component="form" autoComplete="off" sx={{
                            width: {
                                xs: "80%",
                                sm: "auto",
                            },
                            minWidth: "45%",
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
                            <TextField
                                fullWidth
                                type={showPassword ? "text" : "password"}
                                label={t("auth.admin.users.password")}
                                value={password}
                                autoComplete="new-password"
                                onChange={handleChangePassword}
                                error={passwordNotValid}
                                helperText={passwordNotValid ? t("auth.admin.users.notValid.password") : ""}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <Box sx={{
                                                position: "absolute",
                                                top: "50%",
                                                transform: "translate(-10%, -50%)",
                                                right: 0,
                                                display: "flex",
                                            }}>
                                                <InputAdornment
                                                    position="end"
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                    sx={{
                                                        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {showPassword ? <VisibilityOff/> : <Visibility/>}
                                                </InputAdornment>

                                                <InputAdornment
                                                    position="end"
                                                    onClick={generatePassword}
                                                    sx={{
                                                        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <Pin/>
                                                </InputAdornment>
                                            </Box>
                                        ),
                                    },
                                }}
                                sx={inputStyle(passwordNotValid, theme)}/>
                            <TextField
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                value={confirmPassword}
                                autoComplete="new-password"
                                label={t("auth.admin.users.confirmPassword")}
                                onChange={handleChangeConfirmPassword}
                                error={passwordNotValid}
                                helperText={passwordNotValid ? t("auth.admin.users.notValid.password") : ""}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <Box sx={{
                                                position: "absolute",
                                                top: "50%",
                                                transform: "translate(-10%, -50%)",
                                                right: 0,
                                                display: "flex",
                                            }}>
                                                <InputAdornment
                                                    position="end"
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                    sx={{
                                                        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {showPassword ? <VisibilityOff/> : <Visibility/>}
                                                </InputAdornment>

                                                <InputAdornment
                                                    position="end"
                                                    onClick={generatePassword}
                                                    sx={{
                                                        color: theme.palette.mode === "light" ? "#0087dd" : "#013048",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <Pin/>
                                                </InputAdornment>
                                            </Box>
                                        ),
                                    },
                                }}
                                sx={inputStyle(passwordNotValid, theme)}/>

                            <Box display="flex" justifyContent="space-between" gap={4}>
                                <Button
                                    onClick={() => {
                                        setPassword("")
                                        setConfirmPassword("")
                                        setPasswordNotValid(false)
                                        setOpenUpdate(false)
                                    }}
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
                                    {t("auth.admin.users.update.chanel")}
                                </Button>
                                <Button
                                    onClick={handleUpdate}
                                    disabled={!password || passwordNotValid}
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
                                    {t("auth.admin.users.update.access")}
                                </Button>
                            </Box>
                        </Box>
                    </Modal>
                </>
            ) : null}

        </>
    )
}

export default Users
