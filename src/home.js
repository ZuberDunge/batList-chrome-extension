/* global chrome */
import App from "./App";
import OffIMG from "./assets/offline.png"
import { getAuth } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { ListContext } from "./context/data";
import Footer from "./footer";
import Main from "./main";


export default function Home() {
    const { isLoggedIn, setIsLoggedIn } = useContext(ListContext)
    const auth = getAuth();
    const user = auth.currentUser;
    let newUserID = JSON.parse(localStorage.getItem('userID'))

    useEffect(() => {
        newUserID = JSON.parse(localStorage.getItem('userID'))
        if (newUserID != null) {
            setIsLoggedIn(true)
        } else {
            setIsLoggedIn(false)
        }
    }, [isLoggedIn])


    return (<>
        {navigator.onLine ? (isLoggedIn ? <App /> : <Main />) : <h2 className="youre-offline">
            <img src={OffIMG} alt="offline" />
            ooops!! seems like you're offline!!
        </h2>}
        <Footer />
    </>)
}