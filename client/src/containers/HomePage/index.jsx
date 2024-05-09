import React, { useState, useEffect, useCallback } from 'react';
import Profile from './../../components/Profile/index';
const HomePage = ({accounts}) => {

  console.log("RENDERING HOME PAGE")
  console.log(accounts)
  return (
    <div className="mainContainer">
      <div className='header'>
        <h1>News Feed</h1>
        <p>Select a profile to view data!</p>
      </div>

      <div className='profilesContainer'>
        {accounts && accounts.valid && accounts.results.map(account => {
          return (
            <Profile profileData={account}/>
          )
        })}
      </div>

    </div>
  );
};

export default HomePage;