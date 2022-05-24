import { makeRedirectUri, revokeAsync, startAsync } from 'expo-auth-session';
import React, { useEffect, createContext, useContext, useState, ReactNode } from 'react';
import { generateRandom } from 'expo-auth-session/build/PKCE';

import { api } from '../services/api';

interface User {
  id: number;
  display_name: string;
  email: string;
  profile_image_url: string;
}

interface AuthContextData {
  user: User;
  isLoggingOut: boolean;
  isLoggingIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface AuthProviderData {
  children: ReactNode;
}

interface StringMap {
  [key: string]: string;
}

const AuthContext = createContext({} as AuthContextData);

const twitchEndpoints = {
  authorization: 'https://id.twitch.tv/oauth2/authorize',
  revocation: 'https://id.twitch.tv/oauth2/revoke'
};

function AuthProvider({ children }: AuthProviderData) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [user, setUser] = useState({} as User);
  const [userToken, setUserToken] = useState('');

  const toQueryString = (params: StringMap) =>
  "?" +
  Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  // get CLIENT_ID from environment variables

  async function signIn() {
    try {
      // set isLoggingIn to true
      setIsLoggingIn(true);
      // REDIRECT_URI - create OAuth redirect URI using makeRedirectUri() with "useProxy" option set to true
      // RESPONSE_TYPE - set to "token"
      // SCOPE - create a space-separated list of the following scopes: "openid", "user:read:email" and "user:read:follows"
      // FORCE_VERIFY - set to true
      // STATE - generate random 30-length string using generateRandom() with "size" set to 30

      const redirectUri = makeRedirectUri({ useProxy: true });
      const state = generateRandom(30);

      const params = {
        client_id: process.env.CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'token',
        scope: 'openid user:read:email user:read:follows',
        force_verify: true,
        state
      }

      const queryParams = toQueryString(params);
      const authUrl = `${twitchEndpoints.authorization}${queryParams}`;
      console.log(authUrl);


      const response = await startAsync({
        authUrl,
        showInRecents: true
      });
      
      console.log(response);
      // assemble authUrl with twitchEndpoint authorization, client_id, 
      // redirect_uri, response_type, scope, force_verify and state

      // call startAsync with authUrl

      // verify if startAsync response.type equals "success" and response.params.error differs from "access_denied"
      // if true, do the following:

      if(state !== response.params.state) {
        throw new Error('Invalid state');
      }

      if(response.type === 'success' && response.params.error !== 'access_denied') {
        // set userToken to response.params.access_token
        setUserToken(response.params.access_token);
        // call api.get with userToken and "https://api.twitch.tv/helix/users"
        api.defaults.headers['Authorization'] = `Bearer ${response.params.access_token}`;
        const { data } = await api.get('/users');
        // set user to data
        // console.log(data);
        setUser({
          id: data.data[0].id,
          display_name: data.data[0].display_name,
          email: data.data[0].email,
          profile_image_url: data.data[0].profile_image_url
        });
      }

        // verify if startAsync response.params.state differs from STATE
        // if true, do the following:
          // throw an error with message "Invalid state value"

        // add access_token to request's authorization header

        // call Twitch API's users route

        // set user state with response from Twitch API's route "/users"
        // set userToken state with response's access_token from startAsync
    } catch (error) {
      // throw an error
      throw new Error("Error signing in:", error);
    } finally {
      // set isLoggingIn to false
      setIsLoggingIn(false);
    }
  }

  async function signOut() {
    try {
      // set isLoggingOut to true
      setIsLoggingOut(true);
      // call revokeAsync with access_token, client_id and twitchEndpoint revocation
      await revokeAsync({
        token: userToken,
        clientId : process.env.CLIENT_ID,
      }, {revocationEndpoint :twitchEndpoints.revocation});
    } catch (error) {
    } finally {
      // set user state to an empty User object
      // set userToken state to an empty string
      setUser({} as User);
      setUserToken('');
      delete api.defaults.headers.authorization;
      setIsLoggingOut(false);

      // remove "access_token" from request's authorization header

      // set isLoggingOut to false
    }
  }

  useEffect(() => {
    // add client_id to request's "Client-Id" header
    api.defaults.headers['Client-Id'] = process.env.CLIENT_ID;
  }, [])

  // useEffect(() => {
  //   console.log(user);
  // }, [user])

  return (
    <AuthContext.Provider value={{ user, isLoggingOut, isLoggingIn, signIn, signOut }}>
      { children }
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth };
