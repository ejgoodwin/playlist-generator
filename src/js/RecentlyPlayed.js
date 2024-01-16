class RecentlyPlayed extends HTMLElement {
  constructor() {
    super();

    // Shadow DOM.
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.innerHTML = `
            <style>
                .artist-container {
                    display: grid;
                    grid-gap: 16px;
                    grid-template-columns: repeat(2, 1fr);
                }
                .artist-button {
                    align-items: flex-end;
                    background-position: center;
                    background-size: cover;
                    border: 0;
                    border-radius: 4px;
                    display: flex;
                    height: 92px;
                    opacity: .7;
                    padding: 0;
                    transition: .1s;
                }
                .artist-button:hover {
                    cursor: pointer;
                }
                .artist-button:hover,
                .artist-button:hover .artist-name {
                    opacity: 1;
                }
                .artist-name {
                    background: var(--background-4);
                    border-radius: 0 0 3px 3px;
                    color: white;
                    display: block;
                    font-family: var(--font-family-primary);
                    opacity: .85;
                    padding: 7px 12px;
                    text-align: initial;
                    transition: .1s;
                    width: 100%;
                }
            </style>
            <div class="artist-container"></div>
        `;

    // Fetch options.
    this.options = null;
    this.url = `https://api.spotify.com/v1/me/top/artists?limit=6`;

    // Artist container.
    this.artistContainer = this.shadowRoot.querySelector(".artist-container");
  }

  connectedCallback() {
    this.accessToken = window.localStorage.access_token;
    this.options = {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    };
    this.fetchRecentlyPlayed();
  }

  fetchRecentlyPlayed() {
    fetch(this.url, this.options)
      .then((res) => res.json())
      .then((data) => {
        console.log(data.items);
        this.displayArtists(data.items);
      });
  }

  displayArtists(artists) {
    // For each artist, create button with image, name and icon.
    artists.forEach((artist) => {
      const artistButton = document.createElement("button");
      const artistName = document.createElement("span");
      // Set image as button background.
      artistButton.style.backgroundImage = `url(${artist.images[0].url})`;
      // Add artist name to span.
      artistName.innerHTML = artist.name;
      // Add class for styling to span and button.
      artistName.classList.add("artist-name");
      artistButton.classList.add("artist-button");
      // Add event listener.
      artistButton.addEventListener("click", () =>
        this.addChip(artistButton, artist),
      );
      // Attach artist name to button and button to container.
      artistButton.appendChild(artistName);
      this.artistContainer.appendChild(artistButton);
    });
  }

  addChip(artistButton, artist) {
    // Find the existing chips and filter to see if artist chip already exists. If it does, return.
    const allChips = document.querySelectorAll("[data-artist-id]");
    const chipExists = [...allChips].filter(
      (chip) => chip.getAttribute("data-artist-id") === artist.id,
    );
    if (chipExists.length > 0) {
      // TODO: add visual acknowledgement that the chip already exists.
      return;
    }

    // Create new artist chip.
    const artistChip = document.createElement("artist-chip");
    artistChip.setAttribute("data-artist-id", artist.id);
    artistChip.setAttribute("data-artist-name", artist.name);
    artistChip.setAttribute("data-artist-image", artist.images[0].url);

    // Append new artist chip to container.
    const chipContainer = document.querySelector(".artist-chips");
    chipContainer.appendChild(artistChip);
  }
}

window.customElements.define("recently-played", RecentlyPlayed);
