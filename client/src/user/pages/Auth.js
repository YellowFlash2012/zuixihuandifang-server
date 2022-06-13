import React, {useContext, useState} from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from "antd";

import Input from '../../shared/components/FormElements/Input'

import { useForm } from "../../shared/hooks/form-hook"

import { VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/Util/validators'

import Button from "../../shared/components/FormElements/Button"
import Card from '../../shared/components/UI/Card'

import LoadingSpinner from "../../shared/components/UI/LoadingSpinner"
import ErrorModal from "../../shared/components/UI/ErrorModal"

import {AuthContext} from "../../shared/context/auth-context"

import { useHttpClient } from '../../shared/hooks/http-hook'
import ImageUpload from '../../shared/components/FormElements/ImageUpload'

import "./Auth.css"

const Auth = () => {
    const navigate = useNavigate();

    const auth = useContext(AuthContext);

    const [isLoginMode, setIsLoginMode] = useState(true);

    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const [formState, inputHandler, setFormData] = useForm(
        {
            email: {
                value: "",
                isValid: false,
            },
            password: {
                value: "",
                isValid: false,
            },
            
        },
        false
    );

    const switchModeHandler = () => {
        if (!isLoginMode) {
            setFormData({
                ...formState.inputs,
                name: undefined,
                image:undefined
            }, formState.inputs.email.isValid && formState.inputs.password.isValid)
        } else {
            setFormData({
                ...formState.inputs,
                name: {
                    value: '',
                    isValid: false
                },
                image: {
                    value:null,
                    isValid: false
                }
            }, false);
        }
        setIsLoginMode(prevState => !prevState);
    }

    const authHandler = async (e) => {
        e.preventDefault();

        console.log(formState.inputs);

        if (isLoginMode) {
            try {
                const data = await sendRequest(
                    process.env.REACT_APP_SERVER_URL + "/users/login",
                    "POST",
                    JSON.stringify({
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value,
                    }),
                    {
                        "Content-Type": "application/json",
                    },
                    
                );

                auth.login(data.userId, data.token);
                message.success("Welcome back!")
                navigate("/")
            } catch (error) {
                console.log(error);
                message.error("Invalid credentials, please try again!")
            }
                
        } else {
            
            try {
                //image upload config
                const formData = new FormData();
                formData.append('email', formState.inputs.email.value);
                formData.append('name', formState.inputs.name.value);
                formData.append('password', formState.inputs.password.value);
                formData.append('image', formState.inputs.image.value);

                const data = await sendRequest(
                    process.env.REACT_APP_SERVER_URL + "/users/signup",

                    "POST",
                    formData

                    // JSON.stringify({
                    //     name: formState.inputs.name.value,
                    //     email: formState.inputs.email.value,
                    //     password: formState.inputs.password.value,
                    // }),
                    // {
                    //     "Content-Type": "application/json",
                    // }
                );

                console.log(data);
                auth.login(data.userId, data.token);
                message.success("Thank you for signing up")
                navigate("/")
            } catch (err) {
                console.log(err);
                message.error(`${err}`)
            }
        }

        console.log(formState.inputs);
        
        // navigate("/")
    };


    return (
        <>
            <ErrorModal error={error} onClear={clearError} />
            <Card className="authentication">
                {isLoading && <LoadingSpinner asOverlay />}

                <form className="place-form" onSubmit={authHandler}>
                    {!isLoginMode && (
                        <Input
                            id="name"
                            element="input"
                            type="text"
                            label="Name"
                            validators={[VALIDATOR_REQUIRE()]}
                            errorText="Please enter a name."
                            onInput={inputHandler}
                        />
                    )}

                    {!isLoginMode && <ImageUpload
                        center
                        id="image"
                        onInput={inputHandler}
                        errorText="Please provide an image."
                    />
                    }

                    <Input
                        id="email"
                        element="input"
                        type="email"
                        label="Email"
                        validators={[VALIDATOR_EMAIL()]}
                        errorText="Please enter a valid email address."
                        onInput={inputHandler}
                    />

                    <Input
                        id="password"
                        element="input"
                        label="Password"
                        type="password"
                        validators={[VALIDATOR_MINLENGTH(13)]}
                        errorText="Password must be at least 13 characters"
                        onInput={inputHandler}
                    />

                    <Button type="submit" disabled={!formState.isValid}>
                        {isLoginMode ? "LOGIN" : "SIGN UP"}
                    </Button>
                </form>
                <Button inverse onClick={switchModeHandler}>
                    {isLoginMode ? "SIGN UP" : "LOGIN"} INSTEAD
                </Button>
            </Card>
        </>
    );
}

export default Auth
