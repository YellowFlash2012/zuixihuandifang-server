import React from 'react'

import { Link } from 'react-router-dom';

import Card from '../../shared/components/UI/Card';
import PlaceItem from './PlaceItem';

import Button from '../../shared/components/FormElements/Button';

import "./PlaceList.css"

const PlaceList = (props) => {
    if (props.items.length === 0) {
        return (
            <div className="place-list center">
                <Card>
                    <h2>No place found! Do you want to create one?</h2>

                    <Button>
                        <Link to="places/new"> Share place</Link>
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <ul className="place-list">
            {props.items.map(place => (
                <PlaceItem
                    key={place.id}
                    id={place.id}
                    image={place.image}
                    title={place.title}
                    description={place.description}
                    address={place.address}
                    creatorId={place.creator}
                    coordinates={place.location}
                    onDelete={props.onDeletePlace}
                />
            ))}
        </ul>
    );
    
}

export default PlaceList
