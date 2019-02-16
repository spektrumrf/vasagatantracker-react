import React from 'react';
import LocationsList from '../components/LocationsList';
import FeatFormDialog from '../components/FeatFormDialog';
import _ from "lodash";

const Locations = props => {
    const user = props.store.getState().user;
    return (
        <div>
            {_.get(user, 'type') !== 'admin' &&
                    <FeatFormDialog store={props.store} snack={props.snack}/>}
            <LocationsList store={props.store} snack={props.snack}/>
        </div>
    );
};

export default Locations;