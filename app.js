const express = require('express');
const hbs = require('hbs');

// require spotify-web-api-credentials
require('dotenv').config();

// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error => console.log('Something went wrong when retrieving an access token', error));

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
hbs.registerPartials(__dirname + '/views/partials'); 

// setting the spotify-api goes here:

//1 index route
app.get("/", (req, res, next) => {
  res.render("index");
})

//2 display results for artist picture (extra)
app.get("/artist-picture", async (req, res, next) => {
  const { artist } = req.query;
  const { artistId } = req.params;
  spotifyApi
  .searchArtists(`${artist}`)
  .then(data => {
    //console.log('The received data from the API: ', data.body);
    //created data.body.artists to enter the artists: {Object}
    const apiResponse = data.body.artists;
    //some tests playing with the api 👇
    //console.log("Artists Matching", response.items);
    //console.log("First Artist Match", response.items[0]);
    //console.log(`${artist} followers:`, response.items[0].followers.total)
    //console.log(`${artist} first img`, response.items[0].images[0])
    // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API' > in this case the first img of the first artist
    res.render("artist-picture-result", {artist, artistId, ...apiResponse.items[0].images[0], ...apiResponse.items[0]})  
  })
  .catch(err => console.log('The error while searching artists occurred: ', err));
})

//2 display results for artist search
app.get("/artist-search", async (req, res, next) => {
  const { artist } = req.query;
  spotifyApi
  .searchArtists(`${artist}`)
  .then(data => {
    //console.log('The received search data from the API: ', data.body, artist);
    //created data.body.artists to enter the artists: {Object}
    const apiSearchResponse = data.body.artists;
    res.render("artist-search-results", {artist, ...apiSearchResponse})    
  })
  .catch(err => console.log('The error while searching artists occurred: ', err));
})

//3 view albums
app.get("/albums/:artistId", (req, res, next) => {
  const { artist } = req.query;
  const { artistId } = req.params;
  spotifyApi
      .getArtistAlbums(artistId)
      .then(data => {
          const response = data.body;
          res.render("albums", {artist, artistId, ...response});
      })
      .catch(err => console.log("An error while searching the album occured: ", err));
})

//4 view tracks
app.get("/albums/:artistId/tracks/:albumId", (req, res, next) => {
  const { artist } = req.query;
  const { artistId, albumId } = req.params;
  spotifyApi
      .getAlbumTracks(albumId)
      .then(data => {
          const response = data.body;
          res.render("tracks", {artist, artistId, albumId, ...response});
      })
      .catch(err => console.log("An error while searching the tracks occured: ", err));
})

// Our routes go here:

app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
