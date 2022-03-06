import React from 'react';
import Year from './pages/Year';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';
import { createMuiTheme } from '@mui/material/styles';
import MuiThemeProvider from '../node_modules/@mui/material/es/styles/MuiThemeProvider';
import blueGrey from '@mui/material/colors/blueGrey';
import CssBaseline from '../node_modules/@mui/material/CssBaseline/CssBaseline';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#ff6cac',
            contrastText: '#000'
        },
        secondary: blueGrey,
    },
    typography: {
        useNextVariants: true,
    }
});

class VasagatanTracker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const state = this.props.store.getState();
        const year = state.activeYear;
        return (
            <div>
                <CssBaseline />
                <MuiThemeProvider theme={theme}>
                    <Router>
                        <div>
                            <Route exact path='/' render={() => <Redirect to={`/year/${year}`}/>}/>
                            <Route path='/year/:year' render={({ match }) =>
                                <Year store={this.props.store} year={match.params.year}/>
                            }>
                            </Route>
                        </div>
                    </Router>
                </MuiThemeProvider>
            </div>
        );
    }
}


export default VasagatanTracker;