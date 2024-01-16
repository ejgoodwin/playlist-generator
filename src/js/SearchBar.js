/*
	Search bar: take the value of the input and fetch related artists to
	provide suggested artists.
*/

class SearchBar extends HTMLElement {
  constructor() {
    super();

    // Shadow DOM.
    const shadowRoot = this.attachShadow({ mode: "open" });
    // let template = document.getElementById('test-template');
    // let templateContent = template.content;
    // shadowRoot.appendChild(templateContent.cloneNode(true));
    shadowRoot.innerHTML = `
			<style>
				* {
				  box-sizing: border-box;
				}
				:host {
					color: var(--text-colour-primary);
				}
				.search-bar-artist {
					background: transparent;
					border: var(--border-primary);
					border-radius: 5rem;
					color: var(--text-colour-primary);
					font-size: 1.25rem;
					padding: .75rem 1.5rem;
					position: relative;
					width: 100%;
				}
				#artist-list-container {
					background: var(--background-2);
					box-shadow: 0px 2px 8px rgb(0 0 0 / 20%);
					list-style: none;
					margin: 1rem 0 0;
					min-width: 350px;
					padding: .5rem;
					position: absolute;
					z-index: 2;
				}
				.artist-list-button {
					background: var(--background-2);
					border: 0;
					border-radius: 0;
					color: var(--text-colour-primary);
					font-size: 16px;
					padding: .5rem 1rem;
					text-align: left;
					width: 100%;
				}
				.artist-list-button:hover {
					background: var(--background-3);
					cursor: pointer;
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
				@media only screen and (min-width: 1200px) {
					#search-bar-container {
						width: 50%;
					}
				}
			</style>
			<div id="search-bar-container">
				<input 
					type="text" 
					name="search-artist" 
					id="search-artist" 
					class="search-bar-artist"
					placeholder="Search">
			</div>
			`;

    // Search bar input value
    this.searchInput = this.shadowRoot.querySelector("#search-artist");

    // API endpoint.
    this.relatedArtistsUrl = "";

    // Parameters from the hash of the url.
    this.params = null;
    this.accessToken = null;

    // Fetch options.
    this.options = null;

    // List of artists returned from fetch.
    this.artistsList = null;

    // The container for the input and dropdown.
    this.searchBarContainer = this.shadowRoot.querySelector(
      "#search-bar-container",
    );
  }

  connectedCallback() {
    this.accessToken = window.localStorage.access_token;
    this.options = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    };

    this.addEventListener("input", this.fetchSuggestedArtists_);
  }

  fetchSuggestedArtists_() {
    // Return if there is no input value.
    if (this.searchInput.value.length < 1) {
      return;
    }

    this.relatedArtistsUrl = `https://api.spotify.com/v1/search?q=${this.searchInput.value}&type=track,album,artist&limit=10`;

    fetch(this.relatedArtistsUrl, this.options)
      .then((res) => res.json())
      .then((data) => {
        this.artistsList = data.artists;
        this.displayArtists_();
      });
  }

  displayArtists_() {
    // Return if there are no artists.
    if (this.artistsList === null) {
      return;
    }

    // Remove previous list so that an updated list can be added.
    let artistListContainer = this.shadowRoot.querySelector(
      "#artist-list-container",
    );
    if (artistListContainer) {
      artistListContainer.remove();
    }

    // Create ul and append to shadow root.
    artistListContainer = document.createElement("ul");
    artistListContainer.id = "artist-list-container";
    this.shadowRoot.appendChild(artistListContainer);

    for (const artist of this.artistsList.items) {
      const artistListItem = document.createElement("li");
      const artistListItemButton = document.createElement("button");
      artistListItemButton.classList.add("artist-list-button");
      artistListItemButton.innerHTML = artist.name;
      artistListItemButton.addEventListener("click", () =>
        this.chooseArtist_(artist.id, artist.name, artist.images[0].url),
      );
      artistListItem.appendChild(artistListItemButton);
      artistListContainer.appendChild(artistListItem);
    }
  }

  chooseArtist_(artistId, artistName, artistImage) {
    // Find the existing chips and filter to see if artist chip already exists. If it does, return.
    const allChips = document.querySelectorAll("[data-artist-id]");
    const chipExists = [...allChips].filter(
      (chip) => chip.getAttribute("data-artist-id") === artistId,
    );
    if (chipExists.length === 0) {
      // TODO: add visual acknowledgement that the chip already exists.
      // Create new artist chip.
      const artistChip = document.createElement("artist-chip");
      artistChip.setAttribute("data-artist-id", artistId);
      artistChip.setAttribute("data-artist-name", artistName);
      artistChip.setAttribute("data-artist-image", artistImage);

      // Append new artist chip to container.
      const chipContainer = document.querySelector(".artist-chips");
      chipContainer.appendChild(artistChip);
    }
    // Remove previous list once an artist has been selected.
    this.shadowRoot.querySelector("#artist-list-container").remove();
    // Reset search input.
    this.searchInput.value = "";
  }
}

window.customElements.define("search-bar", SearchBar);
