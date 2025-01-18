const profileUri = 'https://api.spotify.com/v1/me';
const topTrackUri = 'https://api.spotify.com/v1/me/top/tracks';
const topArtistUri = 'https://api.spotify.com/v1/me/top/artists';
const redirectUri = 'https://stnford.github.io/SpotifyStats/';
// const redirectUri = 'http://localhost:5500';
const accessToken = window.localStorage.getItem('access_token');
window.localStorage.setItem('trackNames', null);
window.localStorage.setItem('artistNames', null);

// add event listeners to the DOM
document.getElementById('tracks-button').addEventListener('click', handleTracksButtonClick);
document.getElementById('artists-button').addEventListener('click', handleArtistsButtonClick);
document.getElementById('logout-button').addEventListener('click',handleLogOutClick);
document.getElementById('extended-streaming-button').addEventListener('click', () => {
    window.location.href = 'extended-streaming.html';
});

// log in if needed
if (!accessToken || accessToken == "" || accessToken == null) {
    console.error('You must be logged in.');
    window.location.href = 'index.html'; // Redirect to login page 
} else {;
    populatePage()
}

async function populatePage (){
    console.log('Token Scopes:', localStorage.getItem('scope'));
    profileData = await fetchProfile();
    console.log(profileData);

    document.getElementById('display-name').innerText = profileData.display_name;
    document.getElementById('display-name').href = profileData.external_urls.spotify;
}

async function handleTracksButtonClick(){

    try{
        let trackNames
        if(window.localStorage.getItem('trackNames') === 'null' ){
            let topTracksData = await fetchTopTracks(topTrackUri);
            let trackNames = processResult(topTracksData); //extracts and puts names into an array
            console.log("this is 'trackNames", trackNames)
            window.localStorage.setItem('trackNames', JSON.stringify(trackNames));
            console.log("this is also 'trackNames' but from localStrorage: ", localStorage.getItem('trackNames'))
            populateList(trackNames);
        }else {
            // If trackNames already exists, parse it from localStorage
            trackNames = JSON.parse(window.localStorage.getItem('trackNames'));
            populateList(trackNames); // Populate the list
        }
        //if the results-continer is hidden, show it. It is shown, hide it.
        toggleButton(document.getElementById('tracks-button'), document.getElementById('results-list'));
    } catch(Error){
        console.error("An error occured while clicking the 'tracks-button", Error);
    }
}

async function handleArtistsButtonClick(){
    try{
        let artistNames
        if(window.localStorage.getItem('artistNames') === 'null'){
            let topArtistsData = await fetchTopArtists(topArtistUri);
            artistNames = processResult(topArtistsData); //extracts and puts names into an array
            console.log("this is 'artistNames", artistNames)
            window.localStorage.setItem('artistNames', JSON.stringify(artistNames));
            console.log("this is also 'artistNames' but from localStrorage: ", localStorage.getItem('artistNames'))
            populateList(artistNames);
        }else {
            // If artistNames already exists, parse it from localStorage
            artistNames = JSON.parse(window.localStorage.getItem('artistNames'));
            populateList(artistNames); // Populate the list
        }
        console.log("inside handleArtistsButtonClick()! here's the artists array: ", artistNames)
        toggleButton(document.getElementById('artists-button'), document.getElementById('results-list'));
    } catch(Error){
        console.error("An error occured while clicking the 'artists-button", Error);
    }
}

function toggleButton(activeButton, htmlList) {
    const resultsContainer = document.getElementById('results-container');
    const tracksButton = document.getElementById('tracks-button');
    const artistsButton = document.getElementById('artists-button');

    // Check if the results container is hidden
    if (resultsContainer.style.display === 'none' || resultsContainer.style.display === '') {
        resultsContainer.style.display = 'flex'; // Show the results container
        activeButton.innerText = 'Hide Results'; // Update the clicked button text

        // Hide the other button
        if (activeButton === tracksButton) {
            artistsButton.style.display = 'none';
        } else if (activeButton === artistsButton) {
            tracksButton.style.display = 'none';
        }
    } else {
        resultsContainer.style.display = 'none'; // Hide the results container

        // Reset both buttons
        tracksButton.style.display = 'inline-block'; // Make both buttons visible again
        artistsButton.style.display = 'inline-block';
        tracksButton.innerText = 'See top tracks';
        artistsButton.innerText = 'See top artists';

        // Clear the list
        clearList(htmlList);
    }
}


async function fetchTopTracks (uri) {

    try{
        const topTracks_call = await fetch(uri, {
            method: 'GET',
            type: 'track',
            time_range: 'long_term',
            limit: 50,
            offset: 0,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        if(!topTracks_call.ok){
            throw new Error(`Failed to top Items: ${topTracks_call.status} ${topTracks_call.statusText}`);
        }else{
            const topTrackData = await topTracks_call.json();
            return topTrackData;
        }        
    }
    catch(Error){
        console.error("An error occured while fetching top tracks", Error)
    }
}

async function fetchTopArtists(uri){

    try{
        const topArtists_call = await fetch(uri, {
            method: 'GET',
            type: 'artists',
            time_range: 'long_term',
            limit: 50,
            offset: 0,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        if(!topArtists_call.ok){
            throw new Error(`Failed to top Items: ${topArtists_call.status} ${topArtists_call.statusText}`)
        }else{
            const topArtistsData = await topArtists_call.json();
            return topArtistsData;
        }
    }catch(Error){
        console.error("An error occured while fetching top artists", Error)
    }
}

function processResult(topItems){    
    try{
        console.log('Top Items from processResult(): ', topItems);
        const names = topItems.items.map( item => item.name )
        console.log(names);
        return names;
    }catch(Error){
        console.error("An error occured while Processing results", Error);
    }
    // const items = topItems.items;
    // items.forEach(name => {
    //     console.log(name);
    // })
}

function populateList(listItems){
    try{
        console.log("I have made it to populateList()!!!")
        const itemsList = document.getElementById('results-list'); //HTML list
        const itemsArray = Array.from(itemsList.children); //Array List
        console.log("Here is 'lisyItems' we will put in in itemsArray: ", listItems)
        if(isEmpty(itemsArray)){
            console.log("This is 'itemsArray', it should be empty: ", isEmpty(itemsArray), itemsArray);
            listItems.forEach( name => {
                const li = document.createElement("li");
                li.textContent = name;
                itemsList.appendChild(li);
            })
            return itemsList
        }
    }catch(Error){
        console.error("An error occured while populating the list", Error);
    }
}

function clearList(listItems){
    try{
        console.log("Inside clearList(). Here is listItems: ", listItems)
        const itemsList = document.getElementById('results-list');
        console.log("here is itemsList from clearList(): ", itemsList)
        const itemsArray = Array.from(itemsList.children);
        if(!isEmpty(itemsArray)){
            listItems.innerHTML = "";
        }
    }catch(Error){
        console.error("An error occured while clearing the list", Error)
    }
}

async function fetchProfile() {
    console.log("This is the accessToken", accessToken)
    try{
        const result = await fetch(profileUri, {
            method: "GET", 
            headers: { 
                Authorization: `Bearer ${accessToken}` 
            },
        });
        if (!result.ok) {
            throw new Error(`Failed to fetch profile: ${result.status} ${result.statusText}`);
        }
        const profileData = await result.json();
        return profileData

    }catch(Error){
        console.error('Error fetching profile data:', Error);
    }

}

function isEmpty(list){
    return list.length === 0;
}

function handleLogOutClick(){
    localStorage.clear();
    window.location.href = redirectUri; // Redirect to login
}