import React, {Component} from 'react'
import { client, logoutSequence } from '../../../scripts/client'
import { Button } from 'react-bootstrap'

export class DeleteUser extends Component<{userId?:string}> {

    unique=`deleteuser${Math.floor(Math.random()*1000000000000000)}`;

    deleteCurrentUser = () => {
        let userId = this.props?.userId ? this.props.userId : client.currentUser._id;
        client.deleteUser(
            userId, 
            ((document.getElementById(this.unique+'incldata') as HTMLInputElement)?.checked), 
            () => {
                logoutSequence(); //delete then logout
            }
        );
    }

    render() {
        return (<>
            <Button onClick={this.deleteCurrentUser}>Delete Profile</Button>
            <span>
                Delete All Data:&nbsp;<input type='checkbox' id={this.unique+'incldata'} checked={true}/>
            </span>
        </>);
    }

}