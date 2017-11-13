const Spotify = {
	getAccessToken() {
		const clientID = "16ac34b5c2354d1b9fed37f39f9661c1";
		const redirectURI = "http://localhost:3000/";
		const accessToken = localStorage.getItem('accessToken');
		const expiration = localStorage.getItem('expiration');
		if ( accessToken ) {//access token is already set, return it
			window.setTimeout(() => {
				localStorage.removeItem('accessToken');
				localStorage.removeItem('expiration');
			}, expiration * 1000); 
			console.log(`accessToken already set, logged as: ${accessToken}`);
			return accessToken;
		}
		else {//access token is not set
			let accessTokenValue = window.location.href.match(/access_token=([^&]*)/);
			let expirationValue = window.location.href.match(/expires_in=([^&]*)/);
			if (accessTokenValue && expirationValue) {//check if the URL was updated with the access token
				localStorage.setItem('accessToken', accessTokenValue[1]);
				localStorage.setItem('expiration', expirationValue[1]);
				window.setTimeout(() => {
					localStorage.removeItem('accessToken');
					localStorage.removeItem('expiration');
				}, expirationValue[1] * 1000); 
				window.history.replaceState({}, document.title, "/");
				console.log(`accessToken was set, logged as: ${accessTokenValue[1]}`);
				return accessTokenValue[1];
			}
			else {
				window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
			}
		}
	},

	search(searchTerm, updateSearchResults) {
		let accessToken = this.getAccessToken();
		let url = `https://api.spotify.com/v1/search?type=track&q=${searchTerm}`;
		if (accessToken) {
			return fetch(url, { 
				headers: {'Authorization': `Bearer ${accessToken}`} 
			})
			.then(response => {
			  if(response.ok) {
			    return response.json();
			  }
			  throw new Error('Track Search Request failed!');
			}, networkError => {
				console.log(networkError.message);
			})
			.then(jsonResponse => {
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
		}
		else {
			Promise.reject(new Error('Access token not found, fetching access token')).then(error => {
			  // not called
			}, error => {
			  console.log(error); // Stacktrace
			});
			console.log('Your access token is bad');
			alert('Your access token is missing or expired, I will attempt to fetch a fresh one. You may be prompted to login to your spotify account.');
		}
	},

	savePlaylist( playlistName, arrayOfTrackURIs) {
		debugger;
		let userAccessToken = this.getAccessToken();
		if(playlistName && arrayOfTrackURIs) {
			let userID = '';
			if (userAccessToken) {
				fetch('https://api.spotify.com/v1/me', {
					headers: {
						'Authorization': `Bearer ${userAccessToken}`
					}
				})
				.then(response => {
					if (response.ok) {
						return response.json();
					}
					throw new Error('Spotify User ID Lookup Request failed!');
				}, networkError => {
					console.log(networkError.message);
				})
				.then(jsonResponse => {
					userID = jsonResponse.id;
					fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${userAccessToken}`
						},
						body: JSON.stringify({name: playlistName})
					})
					.then(response => {
						if (response.ok) {
							return response.json();
						}
						throw new Error('Playlist Creation Request failed!');
					})
					.then(jsonResponse => {
						let playlistID = jsonResponse.id;
						console.log(`playlistID: ${playlistID}`);
					})
				})
			}
			else {
				console.log(`savePlaylist(). Bad accessToken: ${userAccessToken}.`);
				return;
			}
		}
		else {
			console.log(`savePlaylist() did have all the right information. Playlist Name: ${playlistName}. arrayOfTrackURIs: ${arrayOfTrackURIs}`);
			return;
		}
	}
};

export default Spotify;