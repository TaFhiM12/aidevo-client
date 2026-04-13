import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebase.init';
import axios from 'axios';

const googleProvider = new GoogleAuthProvider(); 
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const ACCESS_TOKEN_KEY = "aidevo_access_token";

const AuthProvider = ({children}) => {
    
    const [user , setUser] = useState(null);
    const [loading , setLoading] = useState(true);

    const obtainAccessToken = async (currentUser) => {
        if (!currentUser?.uid || !currentUser?.email) {
            return null;
        }

        const tokenResponse = await axios.post(
            `${API_BASE_URL}/auth/token`,
            {
                uid: currentUser.uid,
                email: currentUser.email,
            },
            {
                withCredentials: true,
            }
        );

        const accessToken = tokenResponse?.data?.data?.accessToken;
        if (accessToken) {
            localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        }

        return true;
    }

    const createUser = (email , password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth,email,password);
    }

    const signInUser = (email , password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth , email , password);
    }

    const updateProfileUser = (profile) => {
        setLoading(true);
        return updateProfile(auth.currentUser, profile);
    }

    const signInWithGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth , googleProvider);
    }

    const logOut = () => {
        setLoading(true);
        return axios
            .post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true })
            .catch((error) => {
                console.error('Failed to clear auth cookie:', error);
            })
            .finally(() => {
                localStorage.removeItem(ACCESS_TOKEN_KEY);
                return signOut(auth);
            });
    }

    const resetPassword = (email) => {
        return sendPasswordResetEmail(auth, email);
    }
    

    useEffect( () => {
        const unSubscribe = onAuthStateChanged(auth , async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    await obtainAccessToken(currentUser);
                } catch (tokenError) {
                    console.error('Failed to obtain access token:', tokenError);
                }
            } else {
                localStorage.removeItem(ACCESS_TOKEN_KEY);
            }

            setLoading(false);
        })

        return () => {
            unSubscribe();
        }
    } , [])
    

    const userinfo = {
        user,
        loading,
        setLoading,
        setUser,
        createUser,
        signInUser,
        updateProfileUser,
        signInWithGoogle,
        logOut,
        resetPassword,
        obtainAccessToken
    }
    return <AuthContext value={userinfo}>
        {children}
    </AuthContext>
};

export default AuthProvider;