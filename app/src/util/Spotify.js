const Spotify = {
	accessToken: window.location.href.match(/access_token=([^&]*)/) || null,
	expiration: window.location.href.match(/expires_in=([^&]*)/) || null,
	getAccessToken() {
		const clientID = "16ac34b5c2354d1b9fed37f39f9661c1";
		const redirectURI = "http://localhost:3000/";
		if (this.accessToken) {//access token is already set, return it
			window.setTimeout(() => this.accessToken = '', this.expiration * 1000); window.history.replaceState({}, document.title, "/");
			console.log(`getAccessToken logged as: ${this.accessToken}`);
			return this.accessToken;
		}
		else {//access token is not set
			this.accessToken = window.location.href.match(/access_token=([^&]*)/);
			this.expiration = window.location.href.match(/expires_in=([^&]*)/);
			window.setTimeout(() => this.accessToken = '', this.expiration * 1000); window.history.replaceState({}, document.title, "/");
			if (this.accessToken && this.expiration) {//check if the URL was updated with the access token
				console.log(`getAccessToken logged as: ${this.accessToken}`);
				return this.accessToken;
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
				headers: {'Authorization': `Bearer ${accessToken[1]}`} 
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
		let userAccessToken = this.getAccessToken();
		if(playlistName && arrayOfTrackURIs) {
			let authorizationHeader = null;
			let userID = '';
			if (userAccessToken) {
				authorizationHeader = {
					'Authorization': `Bearer ${userAccessToken[1]}`
				}
				return fetch('https://api.spotify.com/v1/me', {headers: authorizationHeader})
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
					return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
						method: 'POST',
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${userAccessToken[1]}`,
						body: {name: playlistName}
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