import React from 'react';
import Year from './pages/Year';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';
import Snackbar from '../node_modules/@material-ui/core/Snackbar/Snackbar';
import SnackbarContent from '../node_modules/@material-ui/core/SnackbarContent/SnackbarContent';
import Typography from '../node_modules/@material-ui/core/Typography/Typography';
import { createMuiTheme } from '@material-ui/core/styles';
import MuiThemeProvider from '../node_modules/@material-ui/core/es/styles/MuiThemeProvider';
import pink from '@material-ui/core/colors/pink';
import blueGrey from '@material-ui/core/colors/blueGrey';
import CssBaseline from '../node_modules/@material-ui/core/CssBaseline/CssBaseline';

const theme = createMuiTheme({
    palette: {
        primary: pink,
        secondary: blueGrey,
    },
    typography: {
        useNextVariants: true,
    },
});

class VasagatanTracker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            messageInfo: {},
        };
    }

    queue = [];

    handleClick = (message, type) => {
        this.queue.push({
            message,
            type,
            key: new Date().getTime(),
        });

        if (this.state.open) {
            this.setState({ open: false });
        } else {
            this.processQueue();
        }
    };

    processQueue = () => {
        if (this.queue.length > 0) {
            this.setState({
                messageInfo: this.queue.shift(),
                open: true
            });
        }
    };

    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({ open: false });
    };

    handleExited = () => {
        this.processQueue();
    };

    render() {
        const state = this.props.store.getState();
        const year = state.activeYear;
        const messageInfo = this.state.messageInfo;
        const open = this.state.open;
        const type = this.state.type;
        const backgroundColors = { warning: 'red', success: 'green', info: 'black' };

        return (
            <div>
                <CssBaseline />
                <MuiThemeProvider theme={theme}>
                    <Router>
                        <div>
                            <Route exact path='/' render={() => <Redirect to={`/year/${year}`}/>}/>
                            <Route path='/year/:year' render={({ match }) =>
                                <Year store={this.props.store} year={match.params.year} snack={this.handleClick}/>
                            }>
                            </Route>
                        </div>
                    </Router>
                    <Snackbar
                        key={messageInfo.key}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                        }}
                        disableWindowBlurListener={true}
                        open={open}
                        autoHideDuration={6000}
                        onClose={this.handleClose}
                        onExited={this.handleExited}
                        style={{ zIndex: 9999 }}
                    >
                        <SnackbarContent
                            style={{ backgroundColor: backgroundColors[type] }}
                            message={
                                <Typography variant="h6" color="primary">{ messageInfo.message }</Typography>}/>
                    </Snackbar>
                </MuiThemeProvider>
            </div>
        );
    }
}


export default VasagatanTracker;