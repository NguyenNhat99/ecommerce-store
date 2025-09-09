import Dashboard from "./pages/admin/Dashboard";
import Buttons from "./pages/admin/Buttons";
import Badges from "./pages/admin/Badges";
import Tables from "./pages/admin/Tables";
import SocialButtons from "./pages/admin/SocialButtons";
import Cards from "./pages/admin/Cards";
import Alerts from "./pages/admin/Alerts";
import ProgressBars from "./pages/admin/ProgressBars";
import Modals from "./pages/admin/Modals";
import Grids from "./pages/admin/Grids";
import Typography from "./pages/admin/Typography";
import BasicForm from "./pages/admin/BasicForm";
import AdvancedForm from "./pages/admin/AdvancedForm";
import Icons from "./pages/admin/Icons";
import Widgets from "./pages/admin/Widgets";
import Chartjs from "./pages/admin/Chartjs";
import Recharts from "./pages/admin/Recharts";
import GoogleMaps from "./pages/admin/GoogleMaps";
import LeafletMaps from "./pages/admin/LeafletMaps";
import Login from "./pages/admin/Login";
import Register from "./pages/admin/Register";
import Brandico from "./components/Icon/Brandico";
import Entypo from "./components/Icon/Entypo";
import FontAwesome from "./components/Icon/FontAwesome";
import Fontelico from "./components/Icon/Fontelico";
import Page404 from "./pages/admin/Error404";
import Page500 from "./pages/admin/Error500";

const routes = [
    {
        path: "/",
        component: Dashboard,
    },
    {
        path: ".",
        component: Dashboard,
    },
    {
        path: "/dashboard",
        component: Dashboard,
    },
    {
        path: "/components/buttons",
        component: Buttons,
    },
    {
        path: "/components/badges",
        component: Badges,
    },
    {
        path: "/components/socials",
        component: SocialButtons,
    },
    {
        path: "/components/cards",
        component: Cards,
    },
    {
        path: "/components/alerts",
        component: Alerts,
    },
    {
        path: "/components/progressbars",
        component: ProgressBars,
    },
    {
        path: "/components/modals",
        component: Modals,
    },
    {
        path: "/components/grids",
        component: Grids,
    },
    {
        path: "/components/typography",
        component: Typography,
    },
    {
        path: "/tables",
        component: Tables,
    },
    {
        path: "/forms/basic-form",
        component: BasicForm,
    },
    {
        path: "/forms/advanced-form",
        component: AdvancedForm,
    },
    {
        path: "/icons",
        component: Icons,
    },
    {
        path: "/icons/brandico",
        component: Brandico,
    },
    {
        path: "/icons/entypo",
        component: Entypo,
    },
    {
        path: "/icons/font-awesome",
        component: FontAwesome,
    },
    {
        path: "/icons/fontelico",
        component: Fontelico,
    },
    {
        path: "/widgets",
        component: Widgets,
    },
    {
        path: "/charts/chartjs",
        component: Chartjs,
    },
    {
        path: "/charts/recharts",
        component: Recharts,
    },
    {
        path: "/maps/google-map",
        component: GoogleMaps,
    },
    {
        path: "/maps/leaflet-maps",
        component: LeafletMaps,
    },
    {
        route: "/login",
        component: Login,
    },
    {
        route: "/register",
        component: Register,
    },
    {
        route: "/page404",
        component: Page404,
    },
    {
        route: "*",
        component: Page404,
    },
    {
        route: "/page500",
        component: Page500,
    },
];

export default routes;

