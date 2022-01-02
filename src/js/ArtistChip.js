class ArtistChip extends HTMLElement {
	constructor() {
		super();

		// Shadow DOM.
		const shadowRoot = this.attachShadow({mode: 'open'});
		// let style = document.createElement('link');
		// style.setAttribute('href', '/css/custom-element.css');
		// // append stylesheet to Shadow DOM
		// this.shadowRoot.append(style);
		shadowRoot.innerHTML = `
			<style>
				.artist-chip {
					background: var(--background-3);
					border-radius: var(--border-radius);
					display: grid;
					grid-template: auto / 40px 1fr 30px;
					margin: .5rem 0;
					margin-inline-end: 1rem;
					overflow: hidden;
				}
				.artist-chip__close {
					align-items: center;
					background: 0;
					border: 0;
					display: flex;
					justify-content: center;
					order: 1;
					padding:  0 .5rem;
				}
				.artist-chip__image {
					background-size: cover;
					margin: 0 .5rem 0 0;
				}
				.artist-chip__name {
					padding: .5rem;
				}
				.artist-chip__close:hover {
					cursor: pointer;
				}
				.cross {
					fill: var(--text-colour-secondary);
				}
			</style>
			<div class="artist-chip">
				<span class="artist-chip__image"></span>
				<span class="artist-chip__name"></span>
				<button class="artist-chip__close"><svg xmlns="http://www.w3.org/2000/svg" width="14" viewBox="0 0 12.021 12.022"><rect class="cross" id="Rectangle_7" width="15" height="2" data-name="Rectangle 7" rx="1" transform="rotate(-45 12.803782 5.3035)"/><rect class="cross"  id="Rectangle_46" width="15" height="2" data-name="Rectangle 46" rx="1" transform="rotate(45 .707 1.706849)"/></svg></button>
			</div>
		`;

		// Add event listener for close button.
		const closeButton = this.shadowRoot.querySelector('.artist-chip__close');
		closeButton.addEventListener('click', (event) => this.removeChip_(event));
	}

	connectedCallback() {
		this.updateRelatedTracksAttribute_();
		this.populateChip();
	}

	populateChip() {
		this.shadowRoot.querySelector('.artist-chip__name').textContent = this.getAttribute('data-artist-name');
		this.shadowRoot.querySelector('.artist-chip__image').style.backgroundImage = `url(${this.getAttribute('data-artist-image')})`;
		console.log('URL', this.getAttribute("data-artist-image"));
	}

	removeChip_(event) {
		this.remove();
		this.updateRelatedTracksAttribute_();

	}

	updateRelatedTracksAttribute_() {
		// Update the attribute on related-tracks element to trigger refresh of tracks data.
		document.querySelector('related-tracks').setAttribute('tracks-set', true)
	}
}

window.customElements.define('artist-chip', ArtistChip);