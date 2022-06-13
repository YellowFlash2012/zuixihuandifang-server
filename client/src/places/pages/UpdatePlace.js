import React, {useState, useEffect, useContext} from 'react'

import { useNavigate, useParams } from 'react-router-dom'
import {message} from "antd"

import Button from '../../shared/components/FormElements/Button';

import Input from '../../shared/components/FormElements/Input';

import { VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE } from '../../shared/Util/validators';

import { useForm } from '../../shared/hooks/form-hook';
import Card from '../../shared/components/UI/Card';
import { useHttpClient } from '../../shared/hooks/http-hook';
import LoadingSpinner from '../../shared/components/UI/LoadingSpinner';
import ErrorModal from '../../shared/components/UI/ErrorModal';
import { AuthContext } from '../../shared/context/auth-context';

import './NewPlace.css'

const UpdatePlace = () => {
    const navigate = useNavigate();

    const auth = useContext(AuthContext);

    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const [loadedPlace, setLoadedPlace] = useState();

    const placeId = useParams().placeId;

    const [formState, inputHandler, setFormData] = useForm({
        title: {
            value: '',
            isValid: false
        },
        description: {
            value: '',
            isValid: false
        }
    }, false);

    useEffect(() => {
        const fetchedPlace = async () => {
            try {
                const data = await sendRequest(
                    `${process.env.REACT_APP_SERVER_URL}/${placeId}`
                );
                setLoadedPlace(data.place);

                setFormData(
                    {
                        title: {
                            value: data.place.title,
                            isValid: true,
                        },
                        description: {
                            value: data.place.description,
                            isValid: true,
                        },
                    },
                    true
                );
            } catch (error) {
                console.error(error);
            }
        }
        fetchedPlace();
    }, [sendRequest, placeId, setFormData])

    if (isLoading) {
        return (
            <div className="center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!loadedPlace && !error) {
        return (
            <div className="center">
                <Card>
                    <h2>Such place doesn't exist. Please try again!</h2>
                </Card>
            </div>
        );
    }

    const placeUpdateSubmit = async (e) => {
        e.preventDefault();

        try {
            await sendRequest(
                `${process.env.REACT_APP_SERVER_URL}/places/${placeId}`,
                "PATCH",
                JSON.stringify({
                    title: formState.inputs.title.value,
                    description: formState.inputs.description.value,
                }),
                {
                    "Content-Type": "application/json",
                    Authorization: "BEARER" + auth.token,
                }
            );

            message.success("This was successfully updated!")

            navigate("/" + auth.userId + "/places");
        } catch (error) {
            console.error(error);
            message.error("This place can't be updated right now. Please try again later!")
        }
    }

    return (
        <div>
            <ErrorModal error={error} onClear={clearError} />

            {!isLoading && loadedPlace && <form
                className="place-form"
                onSubmit={placeUpdateSubmit}
            >
                <Input
                    id="title"
                    element="input"
                    type="text"
                    label="Title"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please enter a valid title"
                    onInput={inputHandler}
                    initialValue={loadedPlace.title}
                    initialValid={true}
                />

                <Input
                    id="description"
                    element="textarea"
                    label="Description"
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    errorText="Please enter a valid description {min. 5 characters}."
                    onInput={inputHandler}
                    initialValue={loadedPlace.description}
                    initialValid={true}
                />

                <Button type="submit" disabled={!formState.isValid}>
                    UPDATE YOUR PLACE
                </Button>
            </form>}
        </div>
    );
}

export default UpdatePlace
