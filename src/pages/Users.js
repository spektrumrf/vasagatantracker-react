import React from 'react';
import UsersList from '../components/UsersList';
import UserChart from '../components/UserChart';
import FeatFormDialog from '../components/FeatFormDialog';
import _ from 'lodash';

const Users = props => {
    const user = props.store.getState().user;
    return (
        <div>
            { user &&  _.get(user, 'type') !== 'admin' &&
                    <FeatFormDialog store={props.store}/>
            }
            <UsersList store={props.store}/> &nbsp;
            <UserChart store={props.store}/>
        </div>
    );
};

export default Users;