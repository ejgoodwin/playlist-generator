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
	}

	static get observedAttributes() {
	  return ['tracks-set'];
	}

	connectedCallback() {
		this.getArtistIds_();
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
		this.artistIds = [];
		this.artistNames = [];

		const artistChips = document.querySelectorAll('artist-chip');
		for (const chip of artistChips) {
			this.artistIds.push(chip.getAttribute('data-artist-id'));
			this.artistNames.push(chip.getAttribute('data-artist-name'));
		}
		this.getDiscoveryTracks_();
	}

	getDiscoveryTracks_() {
		if (this.artistIds.length === 0) return;

		this.artistNames.forEach(name => {
			// Search for mix playlists — these contain multiple artists unlike artist-only playlists
			fetch(`/api/search?q=${encodeURIComponent(name + ' mix')}&type=playlist&limit=5`)
			.then(res => res.json())
			.then(data => {
				const playlists = (data.playlists?.items || []).filter(p => p !== null);
				if (playlists.length === 0) return Promise.resolve([]);

				// Fetch first 3 playlists in parallel for more track variety
				return Promise.all(
					playlists.slice(0, 3).map(playlist =>
						fetch(`/api/playlists/${playlist.id}/tracks?limit=50`)
						.then(res => res.json())
						.then(data => data?.items || [])
						.catch(() => [])
					)
				);
			})
			.then(allItems => {
				if (!allItems?.length) return;

				const seen = new Set();
				const eligible = allItems.flat()
					.filter(item =>
						item.track?.id &&
						item.track.artists?.length > 0 &&
						item.track.album?.images?.length > 0 &&
						!this.artistIds.some(id => item.track.artists.some(a => a.id === id))
					)
					.map(item => item.track)
					.filter(track => {
						if (seen.has(track.id)) return false;
						seen.add(track.id);
						return true;
					})
					.sort(() => Math.random() - 0.5)
					.slice(0, 10);

				eligible.forEach(track => this.displayTracks_(track));
			})
			.catch(err => console.error('Discovery tracks error:', err));
		});
	}

	displayTracks_(track) {
		const minutes = Math.floor(track.duration_ms / 60000);
		const seconds = ((track.duration_ms % 60000) / 1000).toFixed(0);
		const duration = `${minutes}:${(seconds < 10 ? '0' : '') + seconds}`;

		const trackElement = document.createElement('related-track');
		trackElement.setAttribute('track-id', track.id);
		trackElement.setAttribute('track-uri', track.uri);
		trackElement.insertAdjacentHTML('beforeEnd', `<span slot="track-title">${track.name}</span>`);
		trackElement.insertAdjacentHTML('beforeEnd', `<span slot="track-artist">${track.artists[0].name}</span>`);
		trackElement.insertAdjacentHTML('beforeEnd', `<span slot="track-album">${track.album.name}</span>`);
		trackElement.insertAdjacentHTML('beforeEnd', `<span slot="track-time">${duration}</span>`);
		trackElement.insertAdjacentHTML('beforeEnd', `<img slot="track-image" alt="" class="track__image" src="${track.album.images[0].url}">`);

		let trackList = this.shadowRoot.querySelector('#related-tracks-list');
		if (!trackList) {
			trackList = document.createElement('div');
			trackList.id = 'related-tracks-list';
			this.shadowRoot.appendChild(trackList);
		}

		const trackListItems = this.shadowRoot.querySelectorAll('related-track');
		let randomTrackInsert = Math.floor(Math.random() * trackListItems.length);
		if (trackListItems.length > 1) {
			while (trackListItems[randomTrackInsert].hasAttribute('selected') && randomTrackInsert !== 0) {
				randomTrackInsert--;
			}
			trackList.insertBefore(trackElement, trackListItems[randomTrackInsert]);
		} else {
			trackList.appendChild(trackElement);
		}
	}
}

window.customElements.define('related-tracks', RelatedTracks);