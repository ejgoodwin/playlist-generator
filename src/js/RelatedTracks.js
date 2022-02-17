/*
	Find the artist chips, using the artist-id attributes, fetch the related tracks.
*/

class RelatedTracks extends HTMLElement {
	constructor() {
		super();

		// Shadow DOM.
		const shadowRoot = this.attachShadow({mode: 'open'});
		shadowRoot.innerHTML = `
			<style>
			* {
				box-sizing: border-box;
			}
			.track__image {
				border-radius: 5px;
				grid-row: 1 /span 2;
				width: 50px;
			}
			.related-tracks__heading {
				border-bottom: 1px solid var(--background-4);
				color: var(--text-colour-secondary);
				display: grid;
				font-size: .75rem;
				grid-gap: var(--track-grid-gap);
				grid-template: var(--track-grid-template-layout);
				margin-bottom: 8px;
				padding-bottom: 8px;
			}
			.related-tracks__heading-add {
				grid-column: 4;
				justify-self: center;
			}
			.related-tracks__heading-album {
				display: none;
			}
			.related-tracks__heading-preview {
				grid-column: 3;
				justify-self: center;
			}
			#related-tracks-list {
				display: grid;
				grid-gap: .5rem;
				list-style: none;
				margin: 0;
				padding: 0 0 2rem;
			}
			@media screen and (min-width: 800px) { 
				.related-tracks__heading-album {
					display: block;
				}
				.related-tracks__heading-add {
					grid-column: 5;
				}
				.related-tracks__heading-preview {
					grid-column: 4;
				}
			}
			</style>
		`;
		const template = document.getElementById('tracks-heading');
		const templateContent = template.content;
		shadowRoot.appendChild(templateContent.cloneNode(true));

		const tickSVG = '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="svg-inline--fa fa-check-circle fa-w-16" data-icon="check-circle" data-prefix="far" viewBox="0 0 512 512"><path fill="currentColor" d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm0 48c110.532 0 200 89.451 200 200 0 110.532-89.451 200-200 200-110.532 0-200-89.451-200-200 0-110.532 89.451-200 200-200m140.204 130.267-22.536-22.718c-4.667-4.705-12.265-4.736-16.97-.068L215.346 303.697l-59.792-60.277c-4.667-4.705-12.265-4.736-16.97-.069l-22.719 22.536c-4.705 4.667-4.736 12.265-.068 16.971l90.781 91.516c4.667 4.705 12.265 4.736 16.97.068l172.589-171.204c4.704-4.668 4.734-12.266.067-16.971z"/></svg>'

		this.artistIds = [];

		// Parameters from the hash of the url.
		this.params = null;
		this.accessToken = null;

		// Fetch options.
		this.options = null

		this.relatedArtists = [];
		this.relatedArtistsIds = [];
		this.relatedTracksList = [];
		this.chosenTracks = [];
	}

	static get observedAttributes() {
	  return ['tracks-set'];
	}

	connectedCallback() {
		this.getArtistIds_();

		this.accessToken = window.localStorage.access_token;
		this.options = {
		  'headers': {
		    'Authorization': `Bearer ${this.accessToken}`
		  }
		}
	}

	attributeChangedCallback(attrName, oldVal, newVal) {
		this.getArtistIds_();

		let trackList = this.shadowRoot.querySelector('#related-tracks-list');
		const trackItems = this.shadowRoot.querySelectorAll('related-track');
		// Remove tracks that are not selected. Keep the selected tracks so that when another artist
		// is added and new related tracks are generated, the user does not lose the tracks that are already selected.
		trackItems.forEach((item) => {
			if (!item.hasAttribute('selected')) {
				item.remove();
			}
		});

		if (!trackList) {
			trackList = document.createElement('div');
			trackList.id = 'related-tracks-list';
			this.shadowRoot.appendChild(trackList);
		}
	}

	getArtistIds_() {
		// Reset artists ID list.
		this.artistIds = [];

		// Get all artist chips and store their artist IDs.
		const artistChips = document.querySelectorAll('artist-chip');
		
		for(const artist of artistChips) {
			const artistId = artist.getAttribute('data-artist-id');
			this.artistIds.push(artistId);
		}
		this.getRelatedArtists_();
	}

	getRelatedArtists_() {
		const artistUrls = [];
		this.relatedArtists = [];

		for (const id of this.artistIds) {
			artistUrls.push(`https://api.spotify.com/v1/artists/${id}/related-artists`);
		}

		Promise.all(
			artistUrls.map(url => {
				fetch(url, this.options)
				.then(res => res.json())
				.then(data => {
					this.extractIds_(data);
					this.getRelatedTracks_();
				})
			})
		)
	}

	extractIds_(data) {
		this.relatedArtistsIds = [];
		for (const artist of data.artists) {
			this.relatedArtistsIds.push(artist.id);
		}
	}

	getRelatedTracks_() {
		let trackUrls = [];

		// Limit number of tracks based on the amount on artists (artist chips) being used.
		const limit = Math.floor(this.relatedArtistsIds.length / this.artistIds.length);
		this.relatedArtistsIds.forEach((id, counter) => {
			if (counter > limit) {
				return;
			}
			trackUrls.push(`https://api.spotify.com/v1/artists/${id}/top-tracks?market=from_token`);
		});

		Promise.all(
			trackUrls.map(url => {
				fetch(url, this.options)
				.then(res => res.json())
				.then(tracks => {
					const randomNumber = Math.floor(Math.random() * tracks.tracks.length);
					const randomTrack = tracks.tracks[randomNumber];
					this.displayTracks_(randomTrack);
				})
			})
		)
	}

	displayTracks_(track) {
		// Calculate track time.
		const minutes = Math.floor(track.duration_ms / 60000);
		const seconds = ((track.duration_ms % 60000) / 1000).toFixed(0);
		const duration = `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`;
		// Create new <related-track> element.
		const trackElement = document.createElement('related-track');
		trackElement.setAttribute('track-id', track.id);
		trackElement.setAttribute('track-uri', track.uri);
		// Add slot info.
		trackElement.insertAdjacentHTML('beforeEnd', `<span slot="track-title">${track.name}</span>`);
		trackElement.insertAdjacentHTML('beforeEnd', `<span slot="track-artist">${track.artists[0].name}</span>`);
		trackElement.insertAdjacentHTML('beforeEnd', `<span slot="track-album">${track.album.name}</span>`);
		trackElement.insertAdjacentHTML('beforeEnd', `<span slot="track-time">${duration}</span>`);
		trackElement.insertAdjacentHTML('beforeEnd', `<img slot="track-image" alt="" class="track__image" src=${track.album.images[0].url}>`);

		const trackList = this.shadowRoot.querySelector('#related-tracks-list');
		const trackListItems = this.shadowRoot.querySelectorAll('related-track');
		// Random number used to add new track in list.
		let randomTrackInsert =  Math.floor(Math.random() * trackListItems.length);
		// Add the tracks in random order to mix multiple artists.
		if (trackListItems.length > 1) {
			// Insert new items before the selected tracks so that selected tracks are placed at the bottom of the list.
			while (trackListItems[randomTrackInsert].hasAttribute('selected') &&
				randomTrackInsert != 0) {
					randomTrackInsert--;
			}
			trackList.insertBefore(trackElement, trackListItems[randomTrackInsert]);
		} else {
			trackList.appendChild(trackElement);
		}
	}
}

window.customElements.define('related-tracks', RelatedTracks);