let accessToken = window.location.href.match(/access_token=([^&]*)/);
let expiration = window.location.href.match(/expires_in=([^&]*)/);
const clientID = "16ac34b5c2354d1b9fed37f39f9661c1";
const redirectURI = "http://localhost:3000/";
const Spotify = {
	getAccessToken() {
		if (accessToken) {//access token is already set, return it
			window.setTimeout(() => accessToken = '', expiration * 1000); window.history.replaceState({}, document.title, "/");
			return accessToken;
		}
		else {//access token is not set
			accessToken = window.location.href.match(/access_token=([^&]*)/);
			expiration = window.location.href.match(/expires_in=([^&]*)/);
			window.setTimeout(() => accessToken = '', expiration * 1000); window.history.replaceState({}, document.title, "/");
			if (accessToken && expiration) {//check if the URL was updated with the access token
				return accessToken;
			}
			else {
				window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
			}
		}
	},

	search(searchTerm, updateSearchResults) {
		let accessToken = this.getAccessToken();
		let url = `https://api.spotify.com/v1/search?type=track&q=${searchTerm}`;
		return fetch(url, { 
			headers: {'Authorization': `Bearer ${accessToken[1]}`} 
		}).then(response => {
		  if(response.ok) {
		    return response.json();
		  }
		  throw new Error('Request failed!');
		}, networkError => {
		  console.log(networkError.message);
		}).then(jsonResponse => {
			let trackArray = jsonResponse.tracks.items.map(track => {
				return ({
					id: track.id,
					name: track.name,
					artist: track.artists[0].name,
					album: track.album.name,
					uri: track.uri
				});
			});
			return trackArray;
		});
	},

	savePlaylist( playlistName, arrayOfTrackURIs) {
		if(playlistName && arrayOfTrackURIs) {
			let accessToken = this.getAccessToken();
			let authorizationHeader = {
				'Authorization': `Bearer ${accessToken[1]}`
			};
			let userID = '';
			fetch('https://api.spotify.com/v1/me', {headers: authorizationHeader})
			.then(response => {
				if (response.ok) {
					fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
						method: 'POST',
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${accessToken[1]}`,
						body: {name: playlistName}
					})
					.then(response => {
						if (response.ok) {
							return response.json();
						}
					})
					.then(jsonResponse => {
						let playlistID = jsonResponse.id;
					})
				}
			})
		}
		else {
			return;
		}
	}
};

export default Spotify;