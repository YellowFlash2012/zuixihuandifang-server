import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from "antd";

import Input from '../../shared/components/FormElements/Input'

import Button from "../../shared/components/FormElements/Button"

import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/Util/validators'

import { useForm } from '../../shared/hooks/form-hook'
import { useHttpClient } from '../../shared/hooks/http-hook'
import { AuthContext } from '../../shared/context/auth-context'
import ErrorModal from '../../shared/components/UI/ErrorModal'
import LoadingSpinner from '../../shared/components/UI/LoadingSpinner'
import ImageUpload from '../../shared/components/FormElements/ImageUpload'

import "./NewPlace.css"


const NewPlace = () => {

    const auth = useContext(AuthContext);

    const navigate = useNavigate();

    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const [formState, inputHandler] = useForm({
        title: {
            value: "",
            isValid: false,
        },
        description: {
            value: "",
            isValid: false,
        },
        address: {
            value: "",
            isValid: false,
        },
        image: { //image should match the id="image" in the <ImageUpload /> component
            value: null,
            isValid:false
        }
    }, false);

    
    
    const formSubmitHandler = async (e) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('title', formState.inputs.title.value);
            formData.append('description', formState.inputs.description.value);
            formData.append('address', formState.inputs.address.value);
            // formData.append('creator', auth.userId);
            formData.append('image', formState.inputs.image.value);


            await sendRequest(
                process.env.REACT_APP_SERVER_URL + "/places",
                "POST",
                formData,
                { Authorization: "BEARER " + auth.token }
                // JSON.stringify({
                //     title: formState.inputs.title.value,
                //     description: formState.inputs.description.value,
                //     address: formState.inputs.address.value,
                //     creator: auth.userId,
                // }), {'Content-Type':'application/json'}
            );
            message.success("New place created!");
            navigate("/");
        } catch (error) {
            console.log(error);
            message.error(
                "Something went wrong. Please try again later!"
            );
        }
        
        console.log(formState.inputs);

    }

    return (
        <>
            <ErrorModal error={error} onClear={clearError} />

            <form className="place-form" onSubmit={formSubmitHandler}>

                {isLoading && <LoadingSpinner asOverlay />}
                <Input
                    id="title"
                    element="input"
                    type="text"
                    label="Title"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please enter a valid text."
                    onInput={inputHandler}
                />

                <Input
                    id="description"
                    element="description"
                    label="Description"
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    errorText="Please enter a valid description (at least 5 characters)."
                    onInput={inputHandler}
                />

                <Input
                    id="address"
                    element="input"
                    label="Address"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please enter a valid address."
                    onInput={inputHandler}
                />

                <ImageUpload id="image" onInput={inputHandler} errorText="Kindly provide an image" />

                <Button type="submit" disabled={!formState.isValid}>
                    ADD YOUR PLACE
                </Button>
            </form>
        </>
    );
}

export default NewPlace
