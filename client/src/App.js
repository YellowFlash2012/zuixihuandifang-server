import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import NewPlace from "./places/pages/NewPlace";
import NotFound from "./places/pages/NotFound";
import UpdatePlace from "./places/pages/UpdatePlace";
import UserPlaces from "./places/pages/UserPlaces";
import MainNavigation from "./shared/components/navigation/MainNavigation";
import { AuthContext } from "./shared/context/auth-context";
import { useAuth } from "./shared/hooks/auth-hook";
import Auth from "./user/pages/Auth";

import Users from "./user/pages/Users";

import "antd/dist/antd.min.css";

function App() {
    const { login, logout, token, userId } = useAuth();

    return (
        <div className="App">
            <AuthContext.Provider
                value={{
                    isLoggedIn: !!token,
                    userId: userId,
                    login: login,
                    logout: logout,
                    token: token,
                }}
            >
                <BrowserRouter>
                    <MainNavigation />
                    <main>
                        <Routes>
                            {token ? (
                                <>
                                    <Route path="/" element={<Users />} />

                                    <Route
                                        path="/places/new"
                                        element={<NewPlace />}
                                    />

                                    <Route
                                        path="/:userId/places"
                                        element={<UserPlaces />}
                                    />

                                    <Route
                                        path="/places/:placeId"
                                        element={<UpdatePlace />}
                                    />
                                </>
                            ) : (
                                <>
                                    <Route path="/" element={<Users />} />
                                    <Route
                                        path="/:userId/places"
                                        element={<UserPlaces />}
                                    />
                                    <Route path="/auth" element={<Auth />} />
                                </>
                            )}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </main>
                </BrowserRouter>
            </AuthContext.Provider>
        </div>
    );
}

export default App;
