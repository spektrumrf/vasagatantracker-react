import React from 'react';
import Year from './pages/Year';
import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
                        <Routes>
                            <Route path='/' element={<Navigate to={`/year/${year}`}/>}/>
                            <Route path='/year/:year/*' element={<Year store={this.props.store}/>}/>
                        </Routes>
                    </Router>
                </ThemeProvider>
            </div>
        );
    }
}


export default VasagatanTracker;