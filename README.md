# Spotify Playlist Generator (WIP)
Create Spotify playlists by searching for an artist and selecting suggested tracks generated using Spotify web APIs. Spotify's play button is embedded to allow users to listen to the songs before adding them to the playlist.

## Designs
![design 1](app/public/images/readme-design-main-v8.jpg)

## Tech
JavaScript, web components (custom elements, shadow DOM, templates).

## Run
From `/app` run `node app.js`

### Generate access keys
Create an account/login to Spotify developers dashboard: https://developer.spotify.com/dashboard/login

Spotify web API docs: https://developer.spotify.com/documentation/web-api/

## To do:
* Search bar - close when clicking outside of it
* Avatar
* Logout
* Refresh token
* Handle errors - no artists returned, no play option, can't add to playlist
