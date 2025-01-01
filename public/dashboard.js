const profileUrl = 'https://api.spotify.com/v1/me';
const redirectUri = 'http://localhost:5500';
const accessToken = window.localStorage.getItem('access_token');

console.log('Access Token:', accessToken);
console.log('Request Headers:', {
    Authorization: `Bearer ${accessToken}`,
});

if (!accessToken) {
    console.error('You must be logged in.');
    window.location.href = 'index.html'; // Redirect to login page
}else{
    console.log('Token Scopes:', localStorage.getItem('access_token_scope'));
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
            return profileData;

        }catch(Error){
            console.error('Error fetching profile data:', Error);
        }
    }

    fetchProfile()
        .then((profileData) => {
            console.log(profileData);
            document.getElementById('display-name').innerText = profileData.display_name;
        })
        .catch((Error) => {
            console.error('Error: ', Error);
        });
    
    document.getElementById('logout-button').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = redirectUri; // Redirect to login
    })
}
 document.getElementById('tracks-button').addEventListener('click', () =>{
    try{
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
                }
                const topItems = await topItems_call.json();
                return topItems;
            }
            catch(Error){
                console.error("An error occured while fetching top Items", Error)
            }
        }
        fetchTopItems()
            .then((topItems) => {
                console.log(topItems);
                const items = topItems.items;
                const trackMap = items.map((x) => {
                    console.log(x.name)
                })
                console.log(trackMap);
            
            })
            .catch((Error) => {
                console.error('Error: ', Error);
            })

    }catch(Error){
        console.error("An error occured while clicking the 'tracks-button", Error);
    }
 })