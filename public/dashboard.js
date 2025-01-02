// const profileUri = 'https://api.spotify.com/v1/me';
const redirectUri = 'http://localhost:5500';
const accessToken = window.localStorage.getItem('access_token');

// add event listeners to the DOM
document.getElementById('logout-button').addEventListener('click',handleLogOutClick);
document.getElementById('tracks-button').addEventListener('click', handleTracksButtonClick);

// log in if needed
if (!accessToken) {
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
        topItems = await fetchTopItems();
        topItems_continued = await fetchTopItems_continued(topItems.next);
        console.log(topItems, topItems_continued);
        processResult(topItems, topItems_continued);
    } catch(Error){
        console.error("An error occured while clicking the 'tracks-button", Error);
    }
}

function handleLogOutClick(){
    localStorage.clear();
    window.location.href = redirectUri; // Redirect to login
}
async function fetchTopItems () {
    try{
        const topItems_call = await fetch('https://api.spotify.com/v1/me/top/tracks', {
            method: 'GET',
            type: 'track',
            time_range: 'long_term',
            limit: 50,
            offset: 0,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        if(!topItems_call.ok){
            throw new Error(`Failed to top Items: ${topItems_call.status} ${topItems_call.statusText}`);
        }else{
            const topItems = await topItems_call.json();
            return topItems
        }        
    }

    catch(Error){
        console.error("An error occured while fetching top Items", Error)
    }
}
async function fetchTopItems_continued(nextUrl){
    try{
        const topItems_call = await fetch(nextUrl, {
            method: 'GET',
            type: 'track',
            time_range: 'long_term',
            limit: 50,
            offset: 0,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        if(!topItems_call.ok){
            throw new Error(`Failed to top Items: ${topItems_call.status} ${topItems_call.statusText}`);
        }else{
            const topItems = await topItems_call.json();
            return topItems
        }        
    }

    catch(Error){
        console.error("An error occured while fetching top Items", Error)
    }
}
async function fetchProfile() {
    try{
        const result = await fetch("https://api.spotify.com/v1/me", {
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

//Find a way to make this process repeat over and over again until 'next' is
async function processResult(topItems, topItems_continued){    
    const items = topItems.items;
    const items_continued = topItems_continued.items;

    combinedArray = items.concat(items_continued);

    combinedArray.map((x) => {
        console.log(x.name);
    })
}