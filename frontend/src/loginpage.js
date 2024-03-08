import React from 'react';
import './loginpage.css';


const LoginPage = ({handleAuth}) => {
  return (
      <div className="app-container">
        <div className="login-container">
          <h1>Login</h1>
          <p>connect your calender</p>
          <button onClick={handleAuth}>
            <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google Logo"/>
          </button>
        </div>
      </div>
  );
};

export default LoginPage;
