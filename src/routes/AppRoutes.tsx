    import { Route, Routes } from "react-router-dom";
    import { Home, Example } from "../pages";
    import { routesStatic } from ".";

    const AppRoutes = () => {
        return (
            <Routes>
                <Route path={routesStatic.home} element={<Home />} />
                <Route path={routesStatic.example} element={<Example />} />
            </Routes>
        )
    }

    export default AppRoutes;