import "flexboxgrid/dist/flexboxgrid.css";
import "react-toastify/dist/ReactToastify.css";

import "@styles/devpanel.scss";

import {App} from "@devpanel/app";

window.App = App.getInstance() as App;
window.App.loadConfig({});
