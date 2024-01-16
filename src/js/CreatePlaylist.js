class CreatePlaylist extends HTMLElement {
  constructor() {
    super();

    // Shadow DOM.
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = `
			<style>
				* {
					box-sizing: border-box;
				}
				:host {
					color: var(--text-colour-primary);
				}
				.create-playlist-heading {
					margin-top: 0;
				}
				.playlist-name-input {
					background: var(--background-3);
					border: 0;
					color: var(--text-colour-primary);
					font-family: var(--font-family-primary);
					font-size: 1rem;
					padding: .75rem 1rem;
					margin: 0 0 1rem;
					width: 100%;
				}
				.playlist-name-input[input-error] {
					border: 1px solid var(--error-colour-bright);
				}
				.added-tracks {
					margin: 0;
					padding: 0;
				}
				.added-track {
					border-bottom: 1px solid var(--background-4);
					display: grid;
					font-weight: 500;
					grid-gap: 4px 14px;
					grid-template: auto / 42px auto 25px;
					padding: 14px 0;
				}
				.added-track__artist {
					color: var(--text-colour-secondary);
					font-size: .875rem;
					grid-row: 2;
				}
				.added-track__image {
					border-radius: 3px;
					grid-row: 1 / span 2;
					width: 42px;
				}
				.added-tracks-container {
					margin-bottom: 1rem;
				}
				.remove-track {
					background: url(images/icon-close.svg) center no-repeat;
					background-size: 16px;
					border: 0;
					color: var(--error-colour);
					grid-row: 1 / span 2;
					padding: .18rem 1rem .2rem .5rem;
				}
				.remove-track:hover {
					color: var(--error-colour-bright);
					cursor: pointer;
				}
				.create-playlist-button {
					background: rgb(113,44,163);
					background: linear-gradient(162deg, rgba(113,44,163,1) 0%, rgba(22,35,137,1) 100%);
					border: 0;
					border-radius: 100px;
					color: white;
					font-family: var(--font-family-primary);
					font-size: 1rem;
					padding: 12px 24px;
					position: relative;
					z-index: 1;
				}
				.create-playlist-button-inner {
					cursor: pointer;
					z-index: 1;
				}
				.create-playlist-button::after {
					background: var(--primary-colour-darken);
					border-radius: 100px;
					bottom: 0;
					content: '';
					cursor: pointer;
					left: 0;
					opacity: 0;
					position: absolute;
					right: 0;
					top: 0;
					transition: .2s;
					z-index: -1;
				}
				.create-playlist-button:hover::after {
					opacity: .4;
				}
				.add-tracks-error {
					color: var(--error-colour-bright);
					display: none;
				}
				.add-tracks-error[error-show] {
					display: block;
				}
				::-webkit-input-placeholder { /* Chrome/Opera/Safari */
				  color: var(--input-placeholder-colour);
				}
				::-moz-placeholder { /* Firefox 19+ */
				  color: var(--input-placeholder-colour);
				}
				:-ms-input-placeholder { /* IE 10+ */
				  color: var(--input-placeholder-colour);
				}
				:-moz-placeholder { /* Firefox 18- */
				  color: var(--input-placeholder-colour);
				}
			</style>
			<h2 class="create-playlist-heading">Playlist</h2>
			<input id="playlist-name-input" class="playlist-name-input" type="text" placeholder="Playlist name">
			<div class="added-tracks-container">
				<span class="add-tracks-error">Add a track to create a playlist</span>
			</div>
			<button id="create-playlist-button" class="create-playlist-button"><span class="create-playlist-button-inner">Create playlist</span></button>
		`;

    this.relatedTracksEl = document.querySelector("related-tracks");
    this.trackListContainer = this.shadowRoot.querySelector(
      ".added-tracks-container",
    );
    this.createButton = this.shadowRoot.querySelector(
      "#create-playlist-button",
    );
    this.playlistNameInput = this.shadowRoot.querySelector(
      "#playlist-name-input",
    );
    this.createButton.addEventListener("click", () => this.validatePlaylist_());
    this.addTracksError = this.shadowRoot.querySelector(".add-tracks-error");

    this.params = null;
    this.accessToken = null;
    this.options = null;
  }

  static get observedAttributes() {
    return ["tracks-updated"];
  }

  connectedCallback() {
    this.accessToken = window.localStorage.access_token;
    this.options = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    };

    this.playlistNameInput.addEventListener("keypress", () =>
      this.inputChange_(),
    );
  }

  attributeChangedCallback(attrName, oldVal, newVal) {
    const selectedTracks = this.relatedTracksEl.shadowRoot.querySelectorAll(
      "related-track[selected]",
    );
    console.log("selectedTracks", selectedTracks);
    let trackList = this.shadowRoot.querySelector(".added-tracks");

    if (trackList) {
      trackList.remove();
    }

    trackList = document.createElement("ul");
    trackList.classList.add("added-tracks");
    this.trackListContainer.appendChild(trackList);

    for (const track of selectedTracks) {
      // List item.
      const newTrack = document.createElement("li");
      newTrack.setAttribute("added-track-uri", track.getAttribute("track-uri"));
      newTrack.classList.add("added-track");

      // Image.
      const trackImage = document.createElement("img");
      trackImage.src = track.querySelector('[slot="track-image"]').src;
      trackImage.classList.add("added-track__image");
      newTrack.appendChild(trackImage);

      // Track title.
      const trackTitle = document.createElement("span");
      trackTitle.textContent = track.querySelector(
        '[slot="track-title"]',
      ).textContent;
      newTrack.appendChild(trackTitle);

      // Artist.
      const trackArtist = document.createElement("span");
      trackArtist.textContent = track.querySelector(
        '[slot="track-artist"]',
      ).textContent;
      trackArtist.classList.add("added-track__artist");
      newTrack.appendChild(trackArtist);

      const newTrackRemoveButton = document.createElement("button");
      newTrackRemoveButton.innerHTML = "";
      newTrackRemoveButton.classList.add("remove-track");
      newTrackRemoveButton.addEventListener("click", (event) =>
        this.removeTrack_(event),
      );
      newTrack.appendChild(newTrackRemoveButton);

      trackList.appendChild(newTrack);
    }

    if (this.addTracksError.getAttribute("error-show")) {
      this.addTracksError.removeAttribute("error-show");
    }
  }

  validatePlaylist_() {
    const addedTracks = this.shadowRoot.querySelectorAll(".added-track");
    let playlistError = false;
    // TODO: add validation popups for the inputs.
    if (this.playlistNameInput.value.length < 1) {
      this.playlistNameInput.setAttribute("input-error", true);
      playlistError = true;
    } else {
      this.playlistNameInput.removeAttribute("input-error");
    }
    if (addedTracks.length < 1) {
      this.addTracksError.setAttribute("error-show", true);
      playlistError = true;
    } else {
      this.addTracksError.removeAttribute("error-show");
    }

    if (playlistError) {
      return;
    }
    /*
			TODO:
			- Create playlist.
			- Add songs to playlist.
			- (https://developer.spotify.com/documentation/web-api/reference/#category-playlists)
		*/

    // Create playlist.
    // Get current user's profile.
    const userUrl = `https://api.spotify.com/v1/me`;
    const userOptions = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    };
    fetch(userUrl, userOptions)
      .then((res) => res.json())
      .then((data) => {
        console.log(data.id);
        this.createPlaylist_(data.id);
      });
  }

  inputChange_() {
    if (this.playlistNameInput.getAttribute("input-error")) {
      this.playlistNameInput.removeAttribute("input-error");
    }
  }

  createPlaylist_(userId) {
    const url = `https://api.spotify.com/v1/users/${userId}/playlists`;
    const data = {
      name: this.playlistNameInput.value,
      description: "description",
      public: false,
    };

    this.options["method"] = "POST";
    this.options["body"] = JSON.stringify(data);

    fetch(url, this.options)
      .then((res) => res.json())
      .then((data) => {
        this.addTracks_(data.id);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  addTracks_(playlistId) {
    // Create JSON object of track uris.
    const trackUris = {
      uris: [],
    };
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const addedTracks = this.shadowRoot.querySelectorAll(".added-track");
    const trackList = this.shadowRoot.querySelector(".added-tracks");

    addedTracks.forEach((track) => {
      const uri = track.getAttribute("added-track-uri");
      trackUris["uris"].push(uri);
    });

    this.options["body"] = JSON.stringify(trackUris);

    fetch(url, this.options).then((res) => {
      // TODO: toast for ack - success or failure.
      console.log(res);
      trackList.remove();
      this.resetRelatedTracks_();
      this.playlistNameInput.value = "";
    });
  }

  removeTrack_(event) {
    const item = event.target.closest("li");
    const uriAttr = item.getAttribute("added-track-uri");
    const relatedTracksSelectedItem =
      this.relatedTracksEl.shadowRoot.querySelector(
        `related-track[track-uri="${uriAttr}"]`,
      );

    if (relatedTracksSelectedItem) {
      relatedTracksSelectedItem.removeAttribute("selected");
      relatedTracksSelectedItem.shadowRoot
        .querySelector(".track__add")
        .removeAttribute("selected");
    }

    item.remove();
  }

  resetRelatedTracks_() {
    const selectedTracks = this.relatedTracksEl.shadowRoot.querySelectorAll(
      `related-track[selected]`,
    );
    selectedTracks.forEach((track) => {
      track.removeAttribute("selected");
      track.shadowRoot.querySelector(".track__add").removeAttribute("selected");
    });
  }
}

window.customElements.define("create-playlist", CreatePlaylist);
