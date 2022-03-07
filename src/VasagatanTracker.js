import React from 'react';
import Year from './pages/Year';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { blueGrey } from '@mui/material/colors';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
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
                <ThemeProvider theme={theme}>
                    <Router>
                        <div>
                            <Route exact path='/' render={() => <Redirect to={`/year/${year}`}/>}/>
                            <Route path='/year/:year' render={({ match }) =>
                                <Year store={this.props.store} year={match.params.year}/>
                            }>
                            </Route>
                        </div>
                    </Router>
                </ThemeProvider>
            </div>
        );
    }
}


export default VasagatanTracker;