import React from 'react';
import Year from './pages/Year';
import { HashRouter as Router, Routes, Route, Navigate  } from 'react-router-dom';
import { createMuiTheme } from '@material-ui/core/styles';
import MuiThemeProvider from '@material-ui/core/es/styles/MuiThemeProvider';
import blueGrey from '@material-ui/core/colors/blueGrey';
import CssBaseline from '@material-ui/core/CssBaseline';

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
                        <Routes>
                            <Route path='/' element={<Navigate to={`/year/${year}`}/>}/>
                            <Route path='/year/:year/*' element={<Year store={this.props.store}/>}>
                            </Route>
                        </Routes>
                    </Router>
                </MuiThemeProvider>
            </div>
        );
    }
}


export default VasagatanTracker;