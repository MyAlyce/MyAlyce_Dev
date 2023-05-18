import React from 'react';
import { Bluetooth } from 'react-feather';
import { UserBarExpanded } from './UserBarExpanded.tsx';

export function Statistics (){
    return (
        <>
        <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h3>Welcome Josh</h3>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group me-2">
            <select className="form-select" aria-label="Default select example">
              <option selected>Select Stream</option>
              <option value="1">My Device One</option>
              <option value="2">Two</option>
              <option value="3">Three</option>
            </select>
          </div>
          <button type="button" className="btn btn-info">
          <Bluetooth color="#E1F8F8" size={20}/>
          <span data-feather="bluetooth" className="align-text-bottom"></span>
          Connect</button>
        </div>
      </div>
      <UserBarExpanded/>
    </>
    )
}