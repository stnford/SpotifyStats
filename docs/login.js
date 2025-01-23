const clientId = 'b26f9b63745d46fe8f2e839bfdb6bc2a';
// const redirectUri = 'https://stnford.github.io/SpotifyStats/';
const redirectUri = 'http://localhost:5500';

// document.getElementById('apple-login-button').addEventListener('click', () => {
//     window.open('apple-dashboard.html', '_blank');
// })

// when the login button is clicked, generate a code, hash it, and verify it. Define your
//clientID, redirectURI, scopes, the autharization URI, and search params for the URL. 
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('spotify-login-button').addEventListener('click', async() => {

        console.log("Login button clicked!")
        
        //generates the codeVerifier
        const generateRandomString = (length) => {
            const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const values = crypto.getRandomValues(new Uint8Array(length));
            return values.reduce((acc, x) => acc + possible[x % possible.length], "");
        }

        try{
            const codeVerifier  = generateRandomString(64);
            const hashed = await sha256(codeVerifier);
            const codeChallenge = base64encode(hashed);

            const scope = 'user-read-private user-read-email user-top-read playlist-read-private playlist-modify-private playlist-modify-public user-read-recently-played user-library-read user-read-private';
            const authUrl = new URL("https://accounts.spotify.com/authorize");

            const params =  {
                response_type: 'code',
                client_id: clientId,
                scope,
                code_challenge_method: 'S256',
                code_challenge: codeChallenge,
                redirect_uri: redirectUri,
            }

            //set the search query of the URL to the defined parameters (everything after the '?')
            //save the perviously generated codeVerifier value to the key 'code_verifier' within local storage
            //set the URL of the current window to the new authUrl with search params included and redirects 
            //to the Spotify authorization server login page
            authUrl.search = new URLSearchParams(params).toString();
            window.localStorage.setItem('code_verifier', codeVerifier);
            window.location.href = authUrl.toString();

        }catch(err){
            console.log("Error during login process", err);
        }
    });

    document.getElementById('source-button').addEventListener('click', () => {
        window.open('https://github.com/stnford/SpotifyStats', '-blank');
    })

    //create an interable object of the url's search paramaters for the current window
    //get the code from the urlParams object and save it in the var 'code'
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');

    //exchange the autharization code for an access token
    const getToken = async code => {
        const url = 'https://accounts.spotify.com/api/token';
        //retrive the original codeVerifier form local storage and set it again
        let codeVerifier = localStorage.getItem('code_verifier');
    
        //payload is the data being sent in a request or response 
        const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
        }),
        }
    
        const body = await fetch(url, payload);
        const response = await body.json();

        console.log("Here is the response: ", response);

        window.localStorage.setItem('access_token', response.access_token); 
        window.localStorage.setItem('refresh_token', response.refresh_token);
        window.localStorage.setItem('scope', response.scope);
    }

    //validate authentication status through the console
    if(code){
        console.log("This is the code: ", code)
        getToken(code).then(() => {
            console.log("Authentication successful!");
            console.log('Access Token received:', localStorage.getItem('access_token'));
            console.log('Refresh Token received:', localStorage.getItem('refresh_token'));
            console.log('Scope Recieved: ', localStorage.getItem('scope'));

            // window.location.href = 'https://stnford.github.io/SpotifyStats/dashboard.html';
            window.location.href = 'dashboard.html';
        }).catch(err => {
            console.log("Failed to exchange code for token: ", err);
        });
    }else{
        console.log('No code found. Redirecting to login...');
    }
    /*
            Method Definitions
    */

    //hashing the codeVerifier using the sha256 algorithm.
    //This is the value that will be sent within the user authorization request
    const sha256 = async (plain) => {
        const encoder = new TextEncoder()
        const data = encoder.encode(plain)
        return window.crypto.subtle.digest('SHA-256', data)
    }

    //function that returns the base64 representation of sha256's calculation
    const base64encode = (input) => {
        return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    }  
});
