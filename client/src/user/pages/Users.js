import React, {useEffect, useState} from 'react'
import UsersList from '../components/UsersList'

import ErrorModal from "../../shared/components/UI/ErrorModal"
import LoadingSpinner from "../../shared/components/UI/LoadingSpinner"
import { useHttpClient } from '../../shared/hooks/http-hook'

const Users = () => {

    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const [loadedUsers, setLoadedUsers] = useState();

    // bad idea to put async directly in useEffect callback, hence the necessity for sendRequest()
    useEffect(() => {
        const fetchUsers = async () => {
            

            try {
                const data = await sendRequest(process.env.REACT_APP_SERVER_URL + "/users");

                setLoadedUsers(data.users);
                

            } catch (err) {
                
                console.log(err);
            }
            
        };
        fetchUsers();
    }, [sendRequest])

    
    return (
        <>
            <ErrorModal error={error} onClear={clearError} />

            {isLoading && (
                <div className='center'>
                <LoadingSpinner />
            </div>
            )}

            {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
        </>
    );
}

export default Users
