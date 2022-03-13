import React from 'react';
import UserChart from '../components/UserChart';
import DrinkChart from '../components/DrinkChart';
import FeatFormDialog from '../components/FeatFormDialog';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import _ from 'lodash';
import ProjectionChart from '../components/ProjectionChart';

// En ny chart för timeseries behövs, den som används här stöder int React v17
class Statistics extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tab: 0
        };
    }

    handleChange = (event, newValue) => {
        this.setState({ tab: newValue });
    };

    render() {
        const user = this.props.store.getState().user;
        return (
            <div>
                { user && _.get(user, 'type') !== 'admin' &&
                <FeatFormDialog store={this.props.store}/>}
                <Paper square>
                    <Tabs value={this.state.tab} indicatorColor="primary" textColor="primary" onChange={this.handleChange}>
                        <Tab label="Poäng"/>
                        <Tab label="Drycker"/>
                        <Tab label="Projektion"/>
                    </Tabs>
                </Paper>
                {this.state.tab === 0 && <UserChart store={this.props.store}/>}
                {this.state.tab === 0 && <DrinkChart store={this.props.store}/>}
                {this.state.tab === 2 && <ProjectionChart store={this.props.store}/>}
            </div>
        );
    }
}

export default Statistics;