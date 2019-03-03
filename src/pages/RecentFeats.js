import React from 'react';
import FeatsList from '../components/FeatsList';
import FeatFormDialog from '../components/FeatFormDialog';
import _ from "lodash";

const RecentFeats = props => {
    const user = props.store.getState().user;
    return (
        <div>
            { user && _.get(user, 'type') !== 'admin' &&
                    <FeatFormDialog store={props.store}/>}
            <FeatsList store={props.store} filter='all'/>
        </div>
    );
};

export default RecentFeats;