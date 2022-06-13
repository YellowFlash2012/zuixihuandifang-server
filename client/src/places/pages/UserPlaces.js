import React, { useState, useEffect } from 'react';

import { useParams } from 'react-router-dom';

import PlaceList from '../components/PlaceList';

import {useHttpClient} from "../../shared/hooks/http-hook"

import ErrorModal from "../../shared/components/UI/ErrorModal" 
import LoadingSpinner from "../../shared/components/UI/LoadingSpinner" 


const UserPlaces = () => {

    const [loadedPlaces, setLoadedPlaces] = useState();

    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const userId = useParams().userId;

    useEffect(() => {
        const fetchedPlaces = async () => {
            try {
                const data = await sendRequest(
                    `${process.env.REACT_APP_SERVER_URL}/places/user/${userId}`
                );

                console.log(data);
                setLoadedPlaces(data.places);
                console.log(data.places);
                console.log(data.places.map(place=>place.id));
            } catch (error) {
                
            }
        }
        fetchedPlaces();
    }, [sendRequest, userId])
    
    const placeDeleteHandler = (deletedPlaceId) => {
        setLoadedPlaces(prevPlaces => prevPlaces.filter(place => place.id !== deletedPlaceId));
    }

    return (
        <>
            <ErrorModal error={error} onClear={clearError} />

            {isLoading && (
                <div className="center">
                    <LoadingSpinner />
                </div>
            )}

            {!isLoading && loadedPlaces && <PlaceList items={loadedPlaces} onDeletePlace={placeDeleteHandler} />}
        </>
    );
}

export default UserPlaces
