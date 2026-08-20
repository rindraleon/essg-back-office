import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { routesStatic } from "../../routes";
import LogoITDC from "../../assets/files/images/logo/itdc_logo.png";

const Header: React.FC = () => {
    const [open, setOpen] = useState(false);

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `text-sm font-medium ${isActive ? "text-indigo-600" : "text-gray-700 hover:text-gray-900"
        }`;

    return (
        <header className="bg-white shadow-sm z-20">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Brand */}
                <Link to={routesStatic.home} className="inline-flex items-center gap-3">
                    <img src={LogoITDC} alt="Logo" className="w-12 h-12" />
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <NavLink to={routesStatic.home} className={navLinkClass}>
                        Accueil
                    </NavLink>
                    <NavLink to={routesStatic.example} className={navLinkClass}>
                        Example
                    </NavLink>
                </nav>

                {/* Mobile menu button */}
                <div className="md:hidden">
                    <IconButton
                        aria-label="Toggle menu"
                        aria-expanded={open}
                        onClick={() => setOpen((s) => !s)}
                        size="small"
                        className="text-gray-700"
                    >
                        {open ? <CloseIcon /> : <MenuIcon />}
                    </IconButton>
                </div>
            </div>

            {/* Mobile panel */}
            {open && (
                <div className="md:hidden bg-white border-t shadow-sm">
                    <div className="px-6 py-4 flex flex-col gap-4">
                        <nav className="flex flex-col gap-2">
                            <NavLink
                                to={routesStatic.home}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `py-2 px-3 rounded-md ${isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-700 hover:bg-gray-50"}`
                                }
                            >
                                Accueil
                            </NavLink>

                            <NavLink
                                to={routesStatic.example}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `py-2 px-3 rounded-md ${isActive ? "bg-indigo-50 text-indigo-600" : "text-gray-700 hover:bg-gray-50"}`
                                }
                            >
                                Example
                            </NavLink>
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;