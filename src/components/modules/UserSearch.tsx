import React, {Component} from 'react'
import { Button, Form } from 'react-bootstrap';
import { client } from '../../scripts/client';


export class UserSearch extends Component<{onClick:(ev)=>void}> {

    unique=`search${Math.floor(Math.random()*100000000000000000)}`;

    onClick = (ev) => {}

    ref;

    queryResults = [] as any[];

    constructor(props:{onClick:(ev)=>void}) {
        super(props);

        if(props?.onClick) this.onClick = props.onClick;
        this.ref = React.createRef();
    }

    queryUsers = () => {
        let query = (document.getElementById(this.unique + 'query') as HTMLInputElement).value;
        this.queryResults = [];
        if(query) {
            let int = 0;
            
            client.queryUsers(query, 0, 0).then((res) => {
                res?.forEach((user) => {
                    this.queryResults.push(
                        <option key={int} value={user._id}>
                            {/* <Avatar
                                dataState='done'
                                imgSrc={user.pictureUrl ? user.pictureUrl : personIcon}
                                size='xs'
                                name={
                                    {
                                        first:user.firstName as string,
                                        last:user.lastName as string,
                                    }
                                }
                                backgroundColor='lightblue'
                            /> */}{user.firstName} {user.lastName} 
                        </option>
                    );
                    int++;
                });
                this.setState({});
            });
        }
    }

    render() {

        return (
            <div>
                <h3>Search Users</h3>
                <div>
                <Form>
                    <Form.Group className="mb-3" controlId="searchInput">
                        <Form.Label>Name or Email</Form.Label>
                        <Form.Control 
                            id={this.unique+'query'} 
                            type="text" 
                            defaultValue=""
                            ref={this.ref as any}
                            placeholder="Enter Name or Email" 
                            size="sm"
                        />
                    <Button variant="outline-success" size="sm" onClick={this.queryUsers} >Search</Button>
                    </Form.Group>
                </Form>
                </div>
                <h4>Results</h4>
                <div>
                    <Form>
                        <Form.Group className="mb-3" controlId="searchResult">
                            <Form.Select 
                                size="sm"
                                id={this.unique+'select'} 
                                onChange={()=>{}} 
                            >
                                { this.queryResults.map(v => {
                                        return v;
                                    }) }
                            </Form.Select>
                        <Button variant="secondary"size="sm" onClick={()=>{
                            let select = document.getElementById(this.unique+'select') as HTMLSelectElement;
                            let userId = select.value;
                            let name = select.options[select.selectedIndex].innerText;    
                            this.onClick({userId, name});
                        }}>Select</Button>
                        </Form.Group>
                    </Form>
                </div>
            </div>
        );
    }

}