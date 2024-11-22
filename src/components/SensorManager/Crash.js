import {useTranslation} from "react-i18next"
import {useTheme} from "@mui/material/styles"
import {
    Button,
    Divider,
    Typography
} from "@mui/material"
import {
    AccessTimeOutlined
} from "@mui/icons-material"


const Crash = () => {
    const theme = useTheme()
    const {t} = useTranslation()

    return (
        <Button
            sx={{
                gap: "0.75rem",
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
                "&:hover .MuiDivider-root": {
                    background: theme.palette.mode === "light" ? "#008f79" : "#013048",
                },
            }}
        >
            <Typography sx={{
                fontWeight: 600
            }}>
                {t("sensorManager.crashs.handle")}
            </Typography>
            <Divider orientation="vertical" flexItem sx={{
                width: "0.15rem",
            }}/>
            <AccessTimeOutlined/>
        </Button>
    )
}

export default Crash
