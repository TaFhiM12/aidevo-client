import React, { useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { createUserWithEmailAndPassword, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/firebase.init';
import axios from 'axios';

const googleProvider = new GoogleAuthProvider(); 
const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const ACCESS_TOKEN_KEY = "aidevo_access_token";
const ACCESS_USER_INFO_KEY = "aidevo_user_info";
const TOKEN_ATTEMPT_TIMEOUTS = [10000, 15000, 20000, 25000];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const hasOrganizationMetadata = (userInfo) => {
    if (!userInfo || userInfo.role !== 'organization') {
        return true;
    }

    const organizationType =
        userInfo?.organization?.type || userInfo?.type || userInfo?.roleType;
    const organizationName =
        userInfo?.organization?.name || userInfo?.organizationName || userInfo?.name;

    return Boolean(String(organizationType || '').trim()) && Boolean(String(organizationName || '').trim());
};

const AuthProvider = ({children}) => {
    
    const [user , setUser] = useState(null);
    const [loading , setLoading] = useState(true);
    const tokenRequestRef = React.useRef(null);

    const obtainAccessToken = async (currentUser, options = {}) => {
        if (!currentUser?.uid || !currentUser?.email) {
            return null;
        }

        const forceRefresh = Boolean(options.forceRefresh);
        const existingToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const existingUserInfo = localStorage.getItem(ACCESS_USER_INFO_KEY);
        if (existingToken && !forceRefresh) {
            try {
                if (existingUserInfo) {
                                    const parsedUserInfo = JSON.parse(existingUserInfo);
                                    if (hasOrganizationMetadata(parsedUserInfo)) {
                                        return parsedUserInfo;
                                    }
                }
                // Fall through to refresh so we can restore structured user metadata.
            } catch {
                // Fall through to refresh so we can restore structured user metadata.
            }
        }

        if (tokenRequestRef.current) {
            return tokenRequestRef.current;
        }

        tokenRequestRef.current = (async () => {
            let lastError = null;

            // Warm up sleeping backend instances before token issuance.
            try {
                await axios.get(`${API_BASE_URL}/`, { timeout: 6000 });
            } catch {
                // Ignore warm-up errors and continue with token attempts.
            }

            for (let attempt = 0; attempt < TOKEN_ATTEMPT_TIMEOUTS.length; attempt += 1) {
                try {
                    const tokenResponse = await axios.post(
                        `${API_BASE_URL}/auth/token`,
                        {
                            uid: currentUser.uid,
                            email: currentUser.email,
                        },
                        {
                            withCredentials: true,
                            timeout: TOKEN_ATTEMPT_TIMEOUTS[attempt],
                        }
                    );

                    const accessToken = tokenResponse?.data?.data?.accessToken;
                    const userInfo = tokenResponse?.data?.data?.user || null;
                    if (accessToken) {
                        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
                        if (userInfo) {
                            localStorage.setItem(ACCESS_USER_INFO_KEY, JSON.stringify(userInfo));
                        }
                        return userInfo || true;
                    }
                } catch (error) {
                    lastError = error;
                    if (attempt < TOKEN_ATTEMPT_TIMEOUTS.length - 1) {
                        await wait((attempt + 1) * 350);
                    }
                }
            }

            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(ACCESS_USER_INFO_KEY);
            console.warn(`Failed to obtain token from ${API_BASE_URL}:`, lastError?.message || "Unknown error");
            console.warn('Proceeding without access token. Your app may have limited functionality.');
            return false;
        })();

        try {
            return await tokenRequestRef.current;
        } finally {
            tokenRequestRef.current = null;
        }
    }

    const createUser = (email , password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth,email,password);
    }

    const signInUser = (email , password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth , email , password);
    }

    const updateProfileUser = async (profile) => {
        setLoading(true);
        try {
            return await updateProfile(auth.currentUser, profile);
        } finally {
            setLoading(false);
        }
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
                localStorage.removeItem(ACCESS_USER_INFO_KEY);
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
                localStorage.removeItem(ACCESS_USER_INFO_KEY);
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