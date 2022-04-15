/*global chrome*/
import './App.css';
import React, { useEffect, useState } from 'react';
import ContentLoader from 'react-content-loader'
import { useContext } from "react"
import { ListContext } from './context/data';
import YTLogo from "./assets/Youtube.png"
import { AuthContext } from './context/authContext';
import { getAuth } from "firebase/auth";

function App(props) {

  useEffect(() => {
    let newUserID = JSON.parse(localStorage.getItem('userID'))
    const auth = getAuth();
    const user = auth.currentUser;
    if (user || newUserID == null) {
      localStorage.setItem("userID", JSON.stringify(user.uid))
    }
  }, [])

  const { showNotificationForRandom, setSearchedData, searchedData,
    searchDataFromYouTube, randomData, loading, randomQuote,
    addVideoToList, checkIfInList, deleteUser,
    currentVideo, isLoaded, batList, userName, } = useContext(ListContext);

  const { logout } = useContext(AuthContext)
  const [search, setSearch] = useState("")
  const [searchResult, setSearchResult] = useState(batList)
  const [load5, setLoad5] = useState(5)

  useEffect(() => {
    if (loading) {
      setSearchResult(batList)
    }
  }, [loading, addVideoToList])

  useEffect(() => {
    if (search.length == 0) {
      setSearchResult(batList)
      setSearchedData([])
    }
  }, [search])

  let listEmpty;
  useEffect(() => {
    if (batList.length == 0) {
      listEmpty = true
    }
  }, [])
  const searchFunction = (e) => {
    setSearchResult(batList.filter((item) =>
      item._document.data.value.mapValue.fields.title.stringValue.toLowerCase().includes(search.toLowerCase())
    ))
  };

  return (

    <div>
      <div className="nav-section bat-flex bat-align-center bat-justify-between">
        <h4 className='bat-m-r-8px'>Hey, {userName[0] != null ? userName[0]._document.data.value.mapValue.fields.username.stringValue : "Human"}!👋🏻 {randomQuote} 🌻</h4>
        <button style={{ gap: "0.5rem" }} onClick={logout} class="bat-btn bat-flex bat-align-center bat-br-3px bat-btn-primary">
          LogOut  <i class="fas fa-sign-out-alt"></i>
        </button>
      </div>
      <header className="App-header">


        {isLoaded ?
          <>
            <div class="bat-card bat-card-horizontal card-with-dis bat-border-1">
              <img
                src={currentVideo.snippet.thumbnails.medium.url}
                alt={currentVideo.snippet.title}
              />
              <div class="bat-flex bat-flx-dir-col bat-justify-between bat-m-r-8px">
                <div class="fs-1r bold-600 .bat-primary-clr-x">
                  {currentVideo.snippet.title}
                </div>
                <div class="bat-flex width-100 bat-align-center bat-justify-between bat-m-r-8px">
                  <button class="bat-btn bat-br-3px bat-btn-with-icon" onClick={() => addVideoToList(currentVideo.snippet.title, currentVideo.id, currentVideo.snippet.thumbnails.medium.url)}>
                    <i class="far fa-heart"></i> <div>{checkIfInList(currentVideo.id) ? "Added to the List" : "Add to watchList"}</div>
                  </button>
                  <i class="fas fa-share-alt"></i>
                </div>
              </div>
            </div>
          </> : null
        }
      </header>



      {loading ?
        <>
          <div className="bat-flex bat-justify-between bat-align-center" style={{ marginTop: "0.5rem" }}>
            <h3>Your WatchList 🌻</h3>
            <a
              href={`https://www.youtube.com/watch?v=${randomData.resourceId != undefined ? randomData.resourceId.videoId : null}`}
              target="_blank"
              class="bat-btn bat-br-3px bat-fw-600 bat-fs-14px bat-btn-with-icon random-btn"
              onClick={() => showNotificationForRandom(randomData.title, randomData.thumbnails.medium.url)}
            >
              <span>Play A Random Song </span> <i class="fas fa-external-link-alt"></i>
            </a>
          </div>

          <div className='relative'>
            <input className='searchbar' type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={batList[Math.floor(Math.random() * batList.length)] != undefined ? `Try "${batList[Math.floor(Math.random() * batList.length)]._document.data.value.mapValue.fields.title.stringValue}"` : "Search here"}
            />
            <i class="fas fa-search"></i>
          </div>
          <div style={{ marginBottom: "0.5rem", display: search.length > 0 ? "flex" : "none" }} className="bat-flex bat-justify-between bat-align-center">
            {batList.length != 0 && <button style={{ width: "49%" }}
              class="bat-btn bat-justify-center bat-br-3px bat-fw-600 bat-fs-14px bat-btn-with-icon random-btn"
              onClick={() => searchFunction()}
            >
              <span>Search in the list </span>
            </button>}
            <button style={{ width: batList.length == 0 ? "100%" : "49%" }}
              class="bat-btn bat-justify-center bat-br-3px bat-fw-600 bat-fs-14px bat-btn-with-icon random-btn"
              onClick={() => searchDataFromYouTube(search)}
            >
              <span>Search from YouTube </span>
            </button>
          </div>



          {searchedData.length > 0 ?
            <>
              <h3>Results for {search}</h3>
              {searchedData.map(item => <div class="bat-card bat-card-horizontal card-with-dis bat-border-1">
                <img
                  src={item.snippet.thumbnails.medium.url}
                  alt={item.snippet.title}
                />
                <div class="bat-flex bat-flx-dir-col bat-justify-between width-100 bat-m-r-8px">
                  <div class="fs-1r bold-600 .bat-primary-clr-x">
                    {item.snippet.title}
                  </div>
                  <div class="bat-flex width-100 bat-align-center bat-justify-between bat-m-r-8px">
                    <button class="bat-btn bat-br-3px bat-btn-with-icon" onClick={() => addVideoToList(item.snippet.title, item.id.videoId, item.snippet.thumbnails.medium.url)}>
                      <i class="far fa-heart"></i>  <div>{checkIfInList(item.id.videoId) ? "Added" : "Add"}</div>
                    </button>
                    <a href={`https://www.youtube.com/watch?v=` + item.id.videoId} onClick={() => showNotificationForRandom(item.snippet.title, item.snippet.thumbnails.medium.url)} target="_blank" class="bat-btn bat-br-3px bat-btn-with-icon">
                      <span>Watch now</span> <i class="fas fa-external-link-alt"></i>
                    </a>
                  </div>
                </div>
              </div>).slice(0, load5)}
              {load5 <= 24 ? <button style={{
                margin: "1rem 0",
                width: "100%"
              }} class="bat-btn bat-fs-16px bat-flex bat-justify-center bat-br-3px bat-text-center bat-fw-600 bat-fs-14px bat-btn-with-icon random-btn"
                onClick={() => setLoad5(pre => pre + 5)}>Load More</button> : <h3 className='bat-pad-tb-1 bat-text-center'>End of results</h3>}
            </> : null}
          {searchedData.length > 0 ? <h3>Your WatchList 🌻</h3> : null}

          {searchResult.map(item =>
            <>
              <div class="bat-card bat-card-horizontal card-with-dis bat-border-1">
                <img
                  src={item._document.data.value.mapValue.fields.img.stringValue}
                  alt={item._document.data.value.mapValue.fields.title.stringValue}
                />
                <div class="bat-flex width-100 bat-flx-dir-col bat-justify-between bat-m-r-8px">
                  <div class="fs-1r bold-600 .bat-primary-clr-x">
                    {item._document.data.value.mapValue.fields.title.stringValue}
                  </div>
                  <div class="bat-badge bold-600">Sold Out</div>


                  <div class="bat-flex bat-align-center bat-justify-between bat-m-r-8px">
                    <a href={`https://www.youtube.com/watch?v=` + item._document.data.value.mapValue.fields.link.stringValue} onClick={() => showNotificationForRandom(item._document.data.value.mapValue.fields.title.stringValue, item._document.data.value.mapValue.fields.img.stringValue)} target="_blank" class="bat-btn bat-br-3px bat-btn-with-icon">
                      <span>Watch now</span> <i class="fas fa-external-link-alt"></i>
                    </a>

                    <div onClick={() => deleteUser(item.id)} >
                      <i class="fas fa-trash"></i>
                    </div>
                  </div>
                </div>
              </div>
            </>)}
          {
            batList.length <= 0 ? <div className='bat-m-tb-2r'>
              <img src={YTLogo} className="ty-logo" alt="logo" /> <h3 className='bat-txt-center'>
                There are no videos in the watchlist yet, start adding!
              </h3>
            </div> : null
          }
        </>
        :
        <ContentLoader
          viewBox="0 0 400 200"
          width={400}
          height={200} backgroundColor='#ffffff14' foregroundColor='#ffffff64'
          title="Loading news..."
          {...props}
        >
          <rect x="42.84" y="9.93" rx="5" ry="5" width="143.55" height="86.59" />
          <rect x="192.84" y="9.67" rx="0" ry="0" width="148.72" height="12.12" />
          <rect x="192.84" y="25.67" rx="0" ry="0" width="89" height="9" />

          <rect x="42.84" y="107" rx="5" ry="5" width="143.55" height="86.59" />
          <rect x="192.84" y="107" rx="0" ry="0" width="148.72" height="12.12" />
          <rect x="192.84" y="123" rx="0" ry="0" width="89" height="9" />
        </ContentLoader>}
    </div>
  );
}

export default App;


