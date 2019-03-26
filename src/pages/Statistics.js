import React from 'react';
import UserChart from '../components/UserChart';
import DrinkChart from '../components/DrinkChart';
import FeatFormDialog from '../components/FeatFormDialog';
import Paper from "../../node_modules/@material-ui/core/Paper/Paper";
import Tabs from "../../node_modules/@material-ui/core/Tabs/Tabs";
import Tab from "../../node_modules/@material-ui/core/Tab/Tab";
import _ from "lodash";
import ProjectionChart from "../components/ProjectionChart";

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
                        <Tab label="Poängställning"/>
                        <Tab label="Drycker"/>
                        <Tab label="Projektion"/>
                    </Tabs>
                </Paper>
                {this.state.tab === 0 && <UserChart store={this.props.store}/>}
                {this.state.tab === 1 && <DrinkChart store={this.props.store}/>}
                {this.state.tab === 2 && <ProjectionChart store={this.props.store}/>}
            </div>
        );
    }
};

export default Statistics;