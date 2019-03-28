import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import uuid from 'uuid/v4';
import firestore from '../firestore';
import Typography from '../../node_modules/@material-ui/core/Typography/Typography';
import TextField from '../../node_modules/@material-ui/core/TextField/TextField';
import Button from '../../node_modules/@material-ui/core/Button/Button';

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: ''
        };
    }

    sendMessage = async () => {
        try {
            const id = uuid();
            const comment = {
                id,
                message: this.state.message,
                date: moment().unix(),
                username: this.props.store.getState().user.username
            };
            await firestore.getCollection('comments').doc(id).set(comment);
        } catch (error) {
            console.log(error);
        }
    };

    render() {
        const comments = this.props.store.getState().comments;
        return(
            <div style={{ maxWidth: '200px', margin: '10px', padding: '10px' }}>
                <Typography variant="h6" color="secondary">Shitty Chat</Typography>
                <form noValidate autoComplete="off">
                    <div>
                        <TextField
                            label="Meddelande"
                            value={this.state.message}
                            onChange={(event) => { this.setState({ message: event.target.value }); }}
                            margin="normal"
                            variant="outlined"
                            color="primary"
                        />
                    </div>
                    <div>
                        <Button variant="outlined" color="primary" onClick={this.sendMessage}>Skicka</Button>
                    </div>
                </form>
                <div style={{ marginTop: '15px' }}>
                    {_.map(comments, comment =>
                        <div key={comment.id}>
                            <Typography variant="subtitle2">{`${comment.username} ${moment.unix(comment.date).format('HH:mm:ss')}`}</Typography>
                            <Typography variant="body2">{comment.message}</Typography>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default Chat;