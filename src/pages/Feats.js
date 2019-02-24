import React from 'react';
import FeatsList from '../components/FeatsList';
import FeatFormDialog from '../components/FeatFormDialog';
import _ from 'lodash';

const Feats = props => {
    const user = props.store.getState().user;
    return (
        <div>
            {user && _.get(user, 'type') !== 'admin' &&
                <FeatFormDialog store={props.store} snack={props.snack}/>}
            <FeatsList store={props.store} filter='team' snack={props.snack}/>
        </div>
    );
};

export default Feats;