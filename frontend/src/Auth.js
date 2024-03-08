import LoginPage from './loginpage';
import { Navigate } from 'react-router-dom'
import { useState } from 'react';
export default function AuthUser() {
    const [auth, setAuth] = useState(false);
    function handleAuth() {
        window.tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                throw (resp);
            }
            setAuth(true);
        };

        if (window.gapi.client.getToken() === null) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            // when establishing a new session.
            window.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            window.tokenClient.requestAccessToken({ prompt: '' });
        }
    }
    return (<>  <LoginPage handleAuth={handleAuth} /> {auth && <Navigate to="/home" />}</>)
}