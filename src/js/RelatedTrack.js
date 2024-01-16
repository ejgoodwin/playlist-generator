class Track extends HTMLElement {
  constructor() {
    super();

    // Shadow DOM.
    const shadowRoot = this.attachShadow({ mode: "open" });
    // Add template to shadow DOM.
    const template = document.getElementById("track-template");
    const templateContent = template.content;

    shadowRoot.innerHTML = `
            <style>
			* {
				box-sizing: border-box;
			}
            .close-embed iframe{
                display: none;
            }
			.track {
				align-items: center;
				border-bottom: 1px solid var(--background-4);
				display: grid;
				grid-gap: var(--track-grid-gap);
    			grid-template: var(--track-grid-template-layout);
				padding: 0 0 12px;
			}
			.track__title {
				font-size: .875rem;
				font-weight: 500;
			}
			.track__title,
			.track__album,
			.track__artist {
				-webkit-line-clamp: 2;
				-webkit-box-orient: vertical;
				display: -webkit-box;
				overflow: hidden;
			}
			.track__album,
			.track__artist,
			.track__time {
				color: var(--text-colour-secondary);
				font-size: .875rem;
			}
			.track__album {
				display: none;
			}
			.track__main {
				align-items: center;
				display: grid;
				grid-gap: 0 12px;
				grid-template: auto / 50px auto;
			}
			.track__add,
			.track__preview {
				align-items: center;
				border-radius: 50%;
				border: 0;
				cursor: pointer;
				display: flex;
				height: 35px;
				justify-content: center;
				justify-self: center;
				position: relative;
				width: 35px;
			}
			.track__add {
				background: rgb(27,101,163);
				background: linear-gradient(329deg, rgba(27,101,163,1) 0%, rgba(33,147,143,1) 100%);
			}
			.track__add::after,
			.track__preview::after {
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
			}
			.track__add::after {
				background: #35b0b9;
			}
			.track__preview::after {
				background: #216d9e;
			}
			.track__preview:hover::after {
				opacity: .4;
			}
			.track__add:hover::after {
				opacity: .4;
			}
			.track__add-inner,
			.track__preview-inner {
				align-items: center;
				display: flex;
				height: 100%;
				justify-content: center;
				width: 100%;
				z-index: 1;
			}
			.track__add[selected] {
				background: rgb(163,27,163);
				background: linear-gradient(329deg, rgba(163,27,163,1) 0%, rgba(147,33,81,1) 100%);				
			}
			.track__add[selected]::after {
				background: #a31ba3;
				opcaity: 1;
			}
			.track__add[selected] .track__add-line-2 {
				transform: scaleY(0);
			}
			.track__add-line-1,
			.track__add-line-2 {
				background: white;
				border-radius: 5px;
				height: 3px;
				opacity: 1;
				position: absolute;
				transition: .1s;
				width: 15px;
			}
			.track__add-line-2 {
				height: 15px;
				width: 3px;
			}
			.track__preview {
				background: rgb(43,70,162);
				background: linear-gradient(329deg, rgba(43,70,162,1) 0%, rgba(22,80,117,1) 100%);
			}
			.track__preview:hover {
				background: rgb(43,70,162);
			}
			.track__preview.playing .track__icon {
				transform: rotate(-90deg);
			}
			.track__icon {
				transform: scale(1);
				transition: .1s;
				width: 15px;
			}
			#related-tracks-list {
				display: grid;
				grid-gap: .5rem;
				list-style: none;
				margin: 0;
				padding: 0 0 2rem;
			}
			.related-tracks-item-button {
				background: var(--background-1);
				border: 0;
				border-radius: 0 .25rem .25rem 0;
				color: var(--text-colour-primary);
				font-size: 16px;
				padding: 1rem 2rem 1rem 1rem;
				position: relative;
				text-align: left;
				width: 100%;
			}
			.related-tracks-item-button:hover {
				background: var(--background-3);
				cursor: pointer;
			}
			.related-tracks-item-button::after {
				background: var(--background-1);
				border-radius: 50%;
				content: '';
				height: 20px;
				position: absolute;
				transform: translateY(-50%);
				top: 50%;
				right: 1rem;
				width: 20px;
			}
			.related-tracks-item-button[selected='true']::after {
				background: var(--success-colour);
			}
			.related-tracks-item-button-title {
				display: block;
				font-weight: 700;
				margin: 0 0 .25rem;
			}
			.related-tracks-item-image {
				align-items: center;
				background-position: center;
				background-size: cover;
				border-radius: 50%;
				display: flex;
				height: 60px;
				justify-content: center;
				position: relative;
				width: 60px;
			}
			@media screen and (min-width: 800px) {
				.track__album {
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					display: -webkit-box;
					overflow: hidden;
				}
				.track__title {
					font-size: 1rem;
				}
				.track__album,
				.track__artist,
				.track__time {
					font-size: .875rem;
				}
			}
            </style>
        `;
    shadowRoot.appendChild(templateContent.cloneNode(true));

    this.buttonAdd = null;
    this.buttonPreview = null;
  }

  connectedCallback() {
    // Store buttons.
    this.buttonAdd = this.shadowRoot.querySelector(".track__add");
    this.buttonPreview = this.shadowRoot.querySelector(".track__preview");
    // Add event listeners to add and preview buttons.
    this.buttonAdd.addEventListener("click", () => this.addTrack());
    this.buttonPreview.addEventListener("click", () => this.previewTrack());
  }

  addTrack() {
    const selected = this.getAttribute("selected");
    if (selected) {
      this.removeAttribute("selected");
      this.buttonAdd.removeAttribute("selected");
    } else {
      this.setAttribute("selected", true);
      this.buttonAdd.setAttribute("selected", "");
    }

    // Set create-playlist element attribute to trigger an update.
    document
      .querySelector("create-playlist")
      .setAttribute("tracks-updated", true);
  }

  previewTrack() {
    // If the button container already exits, the class for hiding and showing the iframe must be toggled.
    // If the button container does not exist, it must be created and the iframe appended.
    const buttonContainer = this.shadowRoot.querySelector(
      ".embed-button-container",
    );
    if (buttonContainer && buttonContainer.classList.contains("close-embed")) {
      buttonContainer.classList.remove("close-embed");
      this.buttonPreview.classList.add("playing");
      return;
    }
    if (buttonContainer) {
      buttonContainer.classList.add("close-embed");
      this.buttonPreview.classList.remove("playing");
      return;
    }
    const previewUrl = this.getAttribute("track-id");
    this.setAttribute("open", "");

    const embedButtonContainer = document.createElement("div");
    embedButtonContainer.classList.add("embed-button-container");
    const embedButton = `<iframe src="https://open.spotify.com/embed/track/${previewUrl}" width="100%" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;
    embedButtonContainer.innerHTML = embedButton;
    this.shadowRoot.appendChild(embedButtonContainer);
    this.buttonPreview.classList.add("playing");
  }
}

window.customElements.define("related-track", Track);
