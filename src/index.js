import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";

import "i18n";
import "index.css";
import {Provider as AppProvider} from "components/Context";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <AppProvider/>
    </React.StrictMode>
);


if (process.env.NODE_ENV === "development") {
    console.log(process.env);
    reportWebVitals(console.log);
}
