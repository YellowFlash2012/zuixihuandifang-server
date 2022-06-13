import React, { useContext } from "react";

import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";
import Button from "../FormElements/Button";

import "./NavLinks.css";

const NavLinks = (props) => {
    const navigate = useNavigate();

    const auth = useContext(AuthContext);

    const logoutHandler = () => {
        auth.logout();
        navigate("/auth")
    }

    return (
        <ul className="nav-links">
            <li>
                <NavLink to="/">ALL USERS</NavLink>
            </li>

            {auth.isLoggedIn ? (
                <>
                    <li>
                        <NavLink to={`/${auth.userId}/places`}>MY PLACES</NavLink>
                    </li>

                    <li>
                        <NavLink to="/places/new">ADD PLACE</NavLink>
                    </li>

                    <li>
                        <Button onClick={logoutHandler}>LOGOUT</Button>
                    </li>
                </>
            ) : (
                <li>
                    <NavLink to="/auth">LOGIN</NavLink>
                </li>
            )}
        </ul>
    );
};

export default NavLinks;
