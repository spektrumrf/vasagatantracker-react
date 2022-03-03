import React from 'react';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';

class Loading extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            active: false,
            loading: false,
            message: ''
        };
    }

    componentDidMount() {
        this.setState({
            message: this.props.message,
            loading: this.props.loading,
            active: this.props.active
        });
    }

    componentDidUpdate(prevProps) {
        if(prevProps.loading !== this.props.loading || prevProps.message !== this.props.message || prevProps.active !== this.props.active){
            this.setState({ loading: this.props.loading, message: this.props.message, active: this.props.active });
        }
    }

    render() {
        if(this.state.active) {
            return (
                <Card style={{ textAlign: 'center', margin: '10px 10px 10px 10px', backgroundColor: 'beige' }}>
                    {this.state.loading ? <LinearProgress/> :
                        <CardContent>
                            <Typography variant="subtitle1" color="error">{this.state.message}</Typography>
                        </CardContent>}
                </Card>
            );
        } else {
            return null;
        }
    }
}

export default Loading;