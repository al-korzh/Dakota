import {createTheme} from '@mui/material/styles';
import lightBackgroundImage from "./assets/images/background-light.jpg";
import darkBackgroundImage from "./assets/images/background-dark.png";


const breakpoints = (theme) => ({
    fontSize: 12,
    [theme.breakpoints.up('sm')]: {
        fontSize: 17,
    },
    [theme.breakpoints.up('md')]: {
        fontSize: 18,
    },
    [theme.breakpoints.up('lg')]: {
        fontSize: 19,
    },
    [theme.breakpoints.up('xl')]: {
        fontSize: 20,
    },
});


const theme = createTheme({
    spacing: (factor) => `${factor}rem`,
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1280,
            xl: 1920,
        },
    },
    typography: {
        fontFamily: "Montserrat, sans-serif",
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                "*": {
                    letterSpacing: "0.5px",
                    lineHeight: "1 !important",
                },
                "*:focus-visible": {
                    outline: "none",
                },
                "::-webkit-scrollbar": {
                    width: "0.75rem",
                },
                "::-webkit-scrollbar-track": {
                    borderRadius: "1rem",
                    borderWidth: "0.3rem",
                    borderStyle: "solid",
                },
                "::-webkit-scrollbar-thumb": {
                    borderRadius: "0.3rem",
                },
                body: {
                    fontSize: "1rem",
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center center',
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    lineHeight: 1,
                },
            },
        },
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    fontSize: "2rem",
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: "none",
                    position: "relative",
                    borderRadius: "1.75rem",
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    border: "none",
                    borderRadius: "1rem",
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    bottom: 0,
                    top: "auto",
                    height: "88%",
                    borderTopRightRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    minHeight: "auto",
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    width: "350px",
                },
            },
        },
        MuiDateRangeCalendar: {
            styleOverrides: {
                monthContainer: {
                    width: "100%",
                },
            },
        },
    },
})

const lightTheme = createTheme(theme, {
    palette: {
        mode: "light",
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundImage: `url(${lightBackgroundImage})`,
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    background: "#c4fcef",
                    "&:hover": {
                        background: "#008f79",
                    },
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: "#008f79",
                },
            },
        },


        MuiDialog: {
            styleOverrides: {
                paper: {
                    maxWidth: "none",
                    color: "#008f79",
                    background: "#c4fcef",
                    border: "1px solid #008f79",
                },
            },
        },
        MuiPickersDay: {
            styleOverrides: {
                root: {
                    color: "#008f79",
                    "&.Mui-selected": {
                        backgroundColor: "#008f79",
                        color: "#c4fcef",
                        "&:focus": {
                            backgroundColor: "#008f79",
                            color: "#c4fcef",
                        },
                        "&:hover": {
                            backgroundColor: "#0087dd",
                            color: "#c4fcef",
                        },
                    },
                    "&:hover": {
                        backgroundColor: "#008f79",
                        color: "#c4fcef",
                    },
                },
            },
        },
        MuiDateRangePickerDay: {
            styleOverrides: {
                hiddenDayFiller: {
                    background: "none",
                },
                dayInsideRangeInterval: {
                    color: "#c4fcef",
                    "&:hover": {
                        backgroundColor: "#0087dd",
                        color: "#c4fcef",
                    },
                },
                rangeIntervalDayHighlight: {
                    backgroundColor: "#008f79",
                    color: "#c4fcef",
                },
                rangeIntervalDayHighlightStart: {
                    backgroundColor: "#008f79",
                    color: "#c4fcef",
                },
                rangeIntervalDayHighlightEnd: {
                    backgroundColor: "#008f79",
                    color: "#c4fcef",
                },
                dayOutsideRangeInterval: {
                    borderColor: "#008f79",
                    "&:hover": {
                        borderColor: "#008f79 !important",
                    },
                },
            },
        },
        MuiPickersSlideTransition: {
            styleOverrides: {
                root: {
                    color: "#008f79",
                },
            },
        },
        MuiPickersArrowSwitcher: {
            styleOverrides: {
                button: {
                    color: "#008f79",
                    "&:hover": {
                        color: "#008f79",
                        background: "none",
                    },
                },
            },
        },
        MuiDayCalendar: {
            styleOverrides: {
                weekDayLabel: {
                    color: "#008f79",
                },
            },
        },
        MuiPickersToolbar: {
            styleOverrides: {
                root: {
                    padding: "2rem 1rem",
                    "& .MuiTypography-root": {
                        color: "#008f79",
                    },
                },
            },
        },
        MuiPickersToolbarText: {
            styleOverrides: {
                root: {
                    color: "#008f79",
                    "&.Mui-selected": {
                        color: "#008f79",
                    },
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    "& .MuiButtonBase-root": {
                        color: "#008f79",
                    },
                },
            },
        },
    },
});

const darkTheme = createTheme(theme, {
    palette: {
        mode: "dark",
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundImage: `url(${darkBackgroundImage})`,
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    background: "#ff8c69",
                    "&:hover": {
                        background: "#013048",
                    },
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    background: "#013048",
                },
            },
        },


        MuiDialog: {
            styleOverrides: {
                paper: {
                    maxWidth: "none",
                    color: "#ff8c69",
                    background: "#013048",
                    border: "1px solid #ff8c69",
                },
            },
        },
        MuiPickersDay: {
            styleOverrides: {
                root: {
                    color: "#ff8c69",
                    "&.Mui-selected": {
                        backgroundColor: "#ff8c69",
                        color: "#013048",
                        "&:focus": {
                            backgroundColor: "#ff8c69",
                            color: "#013048",
                        },
                        "&:hover": {
                            backgroundColor: "#6a3f52",
                            color: "#013048",
                        },
                    },
                    "&:hover": {
                        backgroundColor: "#ff8c69",
                        color: "#013048",
                    },
                },
            },
        },
        MuiDateRangePickerDay: {
            styleOverrides: {
                hiddenDayFiller: {
                    background: "none",
                },
                rangeIntervalDayHighlight: {
                    backgroundColor: "#6a3f52",
                    color: "#013048",
                },
                rangeIntervalDayHighlightStart: {
                    backgroundColor: "#ff8c69",
                    color: "#013048",
                },
                rangeIntervalDayHighlightEnd: {
                    backgroundColor: "#ff8c69",
                    color: "#013048",
                },
                dayOutsideRangeInterval: {
                    borderColor: "#ff8c69",
                    "&:hover": {
                        borderColor: "#ff8c69 !important",
                    },
                },
            },
        },
        MuiPickersSlideTransition: {
            styleOverrides: {
                root: {
                    color: "#ff8c69",
                },
            },
        },
        MuiPickersArrowSwitcher: {
            styleOverrides: {
                button: {
                    color: "#ff8c69",
                    "&:hover": {
                        color: "#ff8c69",
                        background: "none",
                    },
                },
            },
        },
        MuiDayCalendar: {
            styleOverrides: {
                weekDayLabel: {
                    color: "#ff8c69",
                },
            },
        },
        MuiPickersToolbar: {
            styleOverrides: {
                root: {
                    padding: "2rem 1rem",
                    "& .MuiTypography-root": {
                        color: "#ff8c69",
                    },
                },
            },
        },
        MuiPickersToolbarText: {
            styleOverrides: {
                root: {
                    color: "#ff8c69",
                    "&.Mui-selected": {
                        color: "#ff8c69",
                    },
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    "& .MuiButtonBase-root": {
                        color: "#ff8c69",
                    },
                },
            },
        },
    },
});


darkTheme.components.MuiCssBaseline.styleOverrides.html = breakpoints(darkTheme);
lightTheme.components.MuiCssBaseline.styleOverrides.html = breakpoints(lightTheme);


export {lightTheme, darkTheme};
