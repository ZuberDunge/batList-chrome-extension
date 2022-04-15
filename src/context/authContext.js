/* global chrome */
import { createContext, useContext, useEffect, useState } from 'react';
import { doc, setDoc } from "firebase/firestore";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
} from "firebase/auth";
import { auth } from "./../config/firebase-config";
import { db } from "./../config/firebase-config";
import { ListContext } from './data';

export const AuthContext = createContext()

const AuthContextProvider = (props) => {


    const [passVisible, setPassVisible] = useState(true);
    const [newUser, setNewUser] = useState(true);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [user, setUser] = useState({});
    const [rememberMe, setRememberMe] = useState(false);

    const [wrongPassword, setwrongPassword] = useState(false);
    const [userExist, setuserExist] = useState(false);

    onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });

    const { setIsLoggedIn } = useContext(ListContext)
    const [stopLoading, setStopLoading] = useState(false)
    const registerUser = async (userName, registerEmail, registerPassword) => {
        try {
            const { user } = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword)
            localStorage.setItem("userID", JSON.stringify(user.uid))
            await setDoc(doc(db, user.uid, user.uid), { title: "", img: "", link: "", username: userName })
            setIsLoggedIn(true)
            setStopLoading(true)
            // remember me
            localStorage.setItem("userEmail", registerEmail)
            localStorage.setItem("userPassword", registerPassword)

        } catch (error) {
            console.log(error);
            userExistFun()
        }
    }

    useEffect(() => {
        if (localStorage.getItem("userEmail") != null) {
            setLoginEmail(localStorage.getItem("userEmail"))
        }
        if (localStorage.getItem("userPassword") != null) {
            setLoginPassword(localStorage.getItem("userPassword"))
        }
    }, [])
    const login = async (email, password) => {
        try {
            const { user } = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            localStorage.setItem("userID", JSON.stringify(user.uid))
            setIsLoggedIn(true)
            // remember me
            if (rememberMe) {
                localStorage.setItem("userEmail", email)
                localStorage.setItem("userPassword", password)
            }

        } catch (error) {
            console.log(error);
            wrongPasswordFun()
        }
    };

    const logout = async () => {
        await signOut(auth);
        localStorage.removeItem("userID")
        setIsLoggedIn(false)
    };


    const wrongPasswordFun = () => {
        setTimeout(() => {
            setwrongPassword(false)
        }, 2000)
        setwrongPassword(true)
    }

    const userExistFun = () => {
        setTimeout(() => {
            setuserExist(false)
        }, 2000)
        setuserExist(true)
    }

    const loginAsGuest = () => {
        setRememberMe(true)
        const email = (Math.random() + 1).toString(36).substring(2) + "@batList.com";
        const pass = (Math.random() + 1).toString(36).substring(2)
        registerUser("Human", email, pass)
    }

    return (
        <AuthContext.Provider value={{
            loginAsGuest, stopLoading,
            passVisible, setPassVisible, userExist, setRememberMe, wrongPassword, newUser, setNewUser, loginEmail,
            loginPassword, user, setUser, login, logout, registerUser
        }}>
            {props.children}
        </AuthContext.Provider>
    )
}

export default AuthContextProvider;
