import React, { useCallback, useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import HomePage from '../HomePage/index';
import ProfilePage from '../ProfilePage';

const Base = () => {
  const [accounts, setAccounts] = useState(null);

  const getAccounts = useCallback(() => {
    fetch('/accounts')
      .then(res => res.json())
      .then(setAccounts);
  });

  useEffect(() => {
    getAccounts();
  }, []);



  return (
    <Routes>
      <Route default exact path='/' element={<HomePage accounts={accounts}/>}></Route>
      <Route path="/profile/:name" element={<ProfilePage currentAccount={accounts} />}></Route>
    </Routes>
  );
}

export default Base;