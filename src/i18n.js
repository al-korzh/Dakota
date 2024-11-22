import i18n from "i18next";
import {initReactI18next} from "react-i18next";


i18n
    .use(initReactI18next)
    .init({
        resources: {
            ru: {
                translation: {
                    auth: {
                        submit: "Войти",
                        username: "Логин",
                        password: "Пароль",
                        recovery: "Восстановить вход",
                        usernameNotValid: "Пожалуйста, введите корректный email",
                        error: "Неверный логин и/или пароль",
                        resetPassword: {
                            username: "E-mail",
                            submit: "Сбросить пароль",
                            error: "Неверный логин",
                            title: "Пожалуйста, введите свой e-mail",
                        },
                        admin: {
                            users: {
                                handle: "Пользователи",
                                email: "E-mail",
                                telegramID: "Telegram ID",
                                permission: "Уровень доступа",
                                password: "Пароль",
                                confirmPassword: "Подтвердите пароль",
                                notValid: {
                                    email: "Пожалуйста, введите корректный email",
                                    password: "Пароли не совпадают",
                                    permission: "Должно быть больше -1 и меньше 256",
                                    telegramID: "Должно состоять из 9 или 10 цифр",
                                },
                                add: {
                                    handle: "Добавить",
                                    title: "Добавление пользователя",
                                    access: "Подтвердить",
                                    chanel: "Отмена",
                                },
                                delete: {
                                    handle: "Удалить",
                                    access: "Подтвердить",
                                    chanel: "Отмена",
                                    confirm: "Вы точно хотите удалить пользователя {{email}}, после удаления он не сможет получить доступ к системе",
                                },
                                update: {
                                    handle: "Обновить",
                                    access: "Подтвердить",
                                    chanel: "Отмена",
                                },
                                chanel: "Отмена",
                            },
                        },
                    },
                    sensorManager: {
                        logout: "Выйти",
                        charts: {
                            no: "Нет данных",
                            allIntervals: "Нет",
                            query: "Введите ваш запрос",
                            title: "Название точки монтирования",
                        },
                        crashs: {
                            handle: "Ошибки",
                        },
                        reports: {
                            handle: "Отчет",
                            chanel: "Отмена",
                            select: "Тип",
                            un: {
                                select: "Выберете тип выше",
                            },
                            mountPoints: {
                                select: "Точки монтирования",
                            },
                            parameters: {
                                select: "Параметры",
                            },
                            crashs: {
                                select: "Ошибки",
                                all: "Все ошибки",
                            },
                        },
                        admin: {
                            map: {
                                handle: "Обновить карту",
                                title: "При обновлении карты все датчики потеряют свое настоящее месторасположение (SVG)",
                                chanel: "Отмена",
                                access: "Выбрать изображение",
                                404: "Не найдена",
                            },
                            sensors: {
                                controller: "Контроллер",
                                parameter: "Параметр",
                                address: "Адрес",
                                add: {
                                    handle: "Добавить сенсор",
                                    chanel: "Отмена",
                                    access: "Добавить",
                                    noSensors: "Больше нет свободны сенсоров",
                                    selectTM: {
                                        confirm: "Выберите Точку Монтирования",
                                        notTM: "Сперва создайте точку монтирования",
                                        label: "Точка монтирования",
                                    },
                                },
                                delete: {
                                    handle: "Удалить сенсор",
                                    chanel: "Отмена",
                                    access: "Удалить",
                                    confirm: "Вы точно хотите удалить сенсор?",
                                }
                            },
                            mountPoints: {
                                add: {
                                    handle: "Добавить ТМ",
                                    confirm: "Задайте имя точки монтирования (50 знаков)",
                                    chanel: "Отмена",
                                    access: "Добавить",
                                    input: "Имя точки монтирования",
                                    notValid: "Длина до 50 знаков",
                                },
                                update: {
                                    handle: "Редактировать ТМ",
                                    chanel: "Отмена",
                                    access: "Отвязать",
                                },
                                delete: {
                                    handle: "Удалить ТМ",
                                    confirm: "Вы точно хотите удалить точку монтирования?",
                                    chanel: "Отмена",
                                    access: "Удалить",
                                },
                                rename: {
                                    handle: "Переименовать ТМ",
                                    confirm: "Задайте новое имя точки монтирования (50 знаков)",
                                    chanel: "Отмена",
                                    access: "Подтвердить",
                                    input: "Имя точки монтирования",
                                    notValid: "Длина до 50 знаков",
                                },
                            },
                        },
                    },
                },
            },
            en: {
                translation: {
                    auth: {
                        submit: "Login",
                        username: "Username",
                        password: "Password",
                        recovery: "Recover Access",
                        usernameNotValid: "Please enter a valid email",
                        error: "Invalid username and/or password",
                        resetPassword: {
                            username: "E-mail",
                            submit: "Reset Password",
                            error: "Invalid username",
                            title: "Please enter your email",
                        },
                        admin: {
                            users: {
                                handle: "Users",
                                email: "E-mail",
                                telegramID: "Telegram ID",
                                permission: "Access Level",
                                password: "Password",
                                confirmPassword: "Confirm Password",
                                notValid: {
                                    email: "Please enter a valid email",
                                    password: "Passwords do not match",
                                    permission: "Must be greater than -1 and less than 256",
                                    telegramID: "Must be 9 or 10 digits",
                                },
                                add: {
                                    handle: "Add",
                                    title: "Add User",
                                    access: "Confirm",
                                    chanel: "Cancel",
                                },
                                delete: {
                                    handle: "Delete",
                                    access: "Confirm",
                                    chanel: "Cancel",
                                    confirm: "Are you sure you want to delete the user {{email}}? After deletion, they will not be able to access the system",
                                },
                                update: {
                                    handle: "Update",
                                    access: "Confirm",
                                    chanel: "Cancel",
                                },
                                chanel: "Cancel",
                            },
                        },
                    },
                    sensorManager: {
                        logout: "Logout",
                        charts: {
                            no: "No data",
                            allIntervals: "No",
                            query: "Enter your query",
                            title: "Mount Point Name",
                        },
                        crashs: {
                            handle: "Errors",
                        },
                        reports: {
                            handle: "Report",
                            chanel: "Cancel",
                            select: "Type",
                            un: {
                                select: "Select a type above",
                            },
                            mountPoints: {
                                select: "Mount Points",
                            },
                            parameters: {
                                select: "Parameters",
                            },
                            crashs: {
                                select: "Errors",
                                all: "All errors",
                            },
                        },
                        admin: {
                            map: {
                                handle: "Update Map",
                                title: "Updating the map will cause all sensors to lose their current location (SVG)",
                                chanel: "Cancel",
                                access: "Choose Image",
                                404: "Not found",
                            },
                            sensors: {
                                controller: "Controller",
                                parameter: "Parameter",
                                address: "Address",
                                add: {
                                    handle: "Add Sensor",
                                    chanel: "Cancel",
                                    access: "Add",
                                    noSensors: "No more available sensors",
                                    selectTM: {
                                        confirm: "Select a Mount Point",
                                        notTM: "Create a mount point first",
                                        label: "Mount Point",
                                    },
                                },
                                delete: {
                                    handle: "Delete Sensor",
                                    chanel: "Cancel",
                                    access: "Delete",
                                    confirm: "Are you sure you want to delete the sensor?",
                                },
                            },
                            mountPoints: {
                                add: {
                                    handle: "Add MP",
                                    confirm: "Set a mount point name (up to 50 characters)",
                                    chanel: "Cancel",
                                    access: "Add",
                                    input: "Mount Point Name",
                                    notValid: "Up to 50 characters",
                                },
                                update: {
                                    handle: "Edit MP",
                                    chanel: "Cancel",
                                    access: "Untie",
                                },
                                delete: {
                                    handle: "Delete MP",
                                    confirm: "Are you sure you want to delete the mount point?",
                                    chanel: "Cancel",
                                    access: "Delete",
                                },
                                rename: {
                                    handle: "Rename MP",
                                    confirm: "Set a new mount point name (up to 50 characters)",
                                    chanel: "Cancel",
                                    access: "Confirm",
                                    input: "Mount Point Name",
                                    notValid: "Up to 50 characters",
                                },
                            },
                        },
                    },
                },
            },
        },
        lng:
            localStorage.getItem("language") || "ru",
        fallbackLng:
            "ru",
        interpolation:
            {
                escapeValue: false,
            }
        ,
    })
    .then(() => {
    })
    .catch((error) => {
        if (process.env.NODE_ENV === "development") {
            console.error("i18n initialization failed:", error);
        }
    });

export const languages = Object.keys(i18n.options.resources);

export default i18n;
