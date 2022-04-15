/* global chrome */
import { createContext, useEffect, useState, useRef } from 'react';
import { db } from '../config/firebase-config';
import YTLogo from "./../assets/Youtube.png"
import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

export const ListContext = createContext()

const ListContextProvider = (props) => {
    // api key and youtube link
    let apiKey = "API_KEY_HERE"
    let link = "youtube.com/watch"
    const [isLoaded, setisLoaded] = useState(false)


    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [searchedData, setSearchedData] = useState([])

    const checkIfLoggedIn = () => {
        let newUserID = JSON.parse(localStorage.getItem('userID'))
        if (newUserID != null) {
            setIsLoggedIn(true)
        } else {
            setIsLoggedIn(false)
        }
    }

    // get collection
    let newUserID = JSON.parse(localStorage.getItem('userID'))
    const auth = getAuth();
    const user = auth.currentUser;
    // const usersCollectionRef = collection(db, newUserID);


    // get current video data
    const [currentVideo, setCurrentVideo] = useState("")
    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
            var newURL = tabs[0].url
            if (newURL.includes(link)) {
                var newYTURL = newURL.replace("https://www.youtube.com/watch?v=", "");
                var apiLINK = "https://www.googleapis.com/youtube/v3/videos?id=" + newYTURL + "&key=" + apiKey + "&part=snippet,statistics,contentDetails";
                fetch(apiLINK)
                    .then(data => data.json())
                    .then(data => {
                        var newVideo = data.items[0];
                        setCurrentVideo(newVideo)
                        setisLoaded(true)

                    }).catch(err => console.log(err))

            } else {
            }
        })

    }, [user, chrome.tabs])



    const [causeReRender, setcauseReRender] = useState(false)
    // get data list
    const [batList, setBatList] = useState([])
    const [userName, setuserName] = useState("")
    const [loading, setloading] = useState(false)

    useEffect(() => {
        if (newUserID != null) {
            const usersCollectionRef = collection(db, newUserID);
            const getUsers = async () => {
                const data = await getDocs(usersCollectionRef);
                // setBatList(data.docs)
                setBatList(data.docs.filter(item => item._document.data.value.mapValue.fields.title.stringValue.length >= 1));
                let userNameData = data.docs.filter(item => item._document.data.value.mapValue.fields.username != null);
                setuserName(userNameData)
                setloading(true)
            };
            getUsers();
        }

    }, [causeReRender, user, localStorage.getItem("userID")]);

    const [rerenderRandom, setReRenderRandom] = useState(true)
    const showNotificationForRandom = (title, imgLink) => {
        // eslint - disable - next - line react - hooks / exhaustive - deps
        chrome.notifications.create('test', {
            type: 'image',
            iconUrl: YTLogo,
            title: `Playing ${title}`,
            message: `Hey ${userName[0]._document.data.value.mapValue.fields.username.stringValue}, ${random[Math.floor(Math.random() * random.length)]} 🌻`,
            imageUrl: imgLink,
            priority: 2
        });
        setReRenderRandom(!rerenderRandom)
    }


    const [randomMusicVideo, setrandomMusicVideo] = useState("")
    const [randomData, setrandomData] = useState([])

    const playListIDs = ["RDCLAK5uy_n9Fbdw7e6ap-98_A-8JYBmPv64v-Uaq1g", "RDCLAK5uy_ngT3H4Vu-YMwwjFPt6Ocr3n7j2l-cUAeQ", "RDCLAK5uy_k1272v-yXtLJm7gmMiAxjOl-vh5aEC11A", "PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG"]

    useEffect(() => {
        const playListID = playListIDs[Math.floor(Math.random() * playListIDs.length)]
        fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playListID}&key=${apiKey}&maxResults=50`)
            .then(data => data.json())
            .then(data => {
                setrandomMusicVideo(data.items[Math.floor(Math.random() * data.items.length)].snippet.resourceId.videoId)
                setrandomData(data.items[Math.floor(Math.random() * data.items.length)].snippet)
                // console.log("playListIDs api running");
                // showNotificationForRandom(data.items[Math.floor(Math.random() * data.items.length)].snippet)
            }).catch(err => console.log(err))
    }, [rerenderRandom])



    // check and add video to list
    const [alreadyInList, setAlreadyInList] = useState(false)
    const addVideoToList = (title, id, url) => {
        const found = batList.some(item =>
            item._document.data.value.mapValue.fields.link.stringValue === id);
        if (!checkIfInList(id) || batList.length == 0) {
            if (!found) {
                createUser(title, id, url)
                setAlreadyInList(true)
            } else {
                setAlreadyInList(true)
            }
        } else {
            alert("somethins wrong");
        }
    }

    const checkIfInList = (itemID) => {
        const found = batList.some(item => item._document.data.value.mapValue.fields.link.stringValue === itemID);
        if (!found) {
            return false
        } else {
            return true
        }
    }

    const createUser = async (title, id, url) => {
        const usersCollectionRef = collection(db, newUserID);
        const document = await addDoc(usersCollectionRef, { title: title, img: url, link: id }, user.uid);
        setcauseReRender(!causeReRender)
        setAlreadyInList(true)
    };


    // delete video from list
    const deleteUser = async (id) => {
        const userDoc = doc(db, newUserID, id);
        await deleteDoc(userDoc);
        setcauseReRender(!causeReRender)
    };


    const searchDataFromYouTube = (keyword) => {
        const searchiEndpoint = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&type=video&key=YOUR_KEY_HERE&q="
        fetch(searchiEndpoint + keyword)
            .then(data => data.json())
            .then(data => {
                // console.log("search api running");
                setSearchedData(data.items)
            }).catch(err => console.log(err))
    }



    // random
    const random = ["Take a break", "Have some water", "You've got this", "Everything will be fine", "Things will get better", "Keep Smiling", "Have a beautiful day", "Take care of yourself", "Spend some time with fam"];
    const randomQuote = random[Math.floor(Math.random() * random.length)]
    return (
        <ListContext.Provider value={{ searchDataFromYouTube, setSearchedData, searchedData, randomQuote, showNotificationForRandom, randomData, randomMusicVideo, batList, checkIfInList, loading, userName, alreadyInList, addVideoToList, deleteUser, userName, createUser, currentVideo, isLoaded, checkIfLoggedIn, isLoggedIn, setIsLoggedIn }}>
            {props.children}
        </ListContext.Provider>
    )
}

export default ListContextProvider;
