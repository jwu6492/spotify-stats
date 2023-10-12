import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import {
  Container,
  ListGroup,
  Button,
  ListGroupItem,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import qs from "qs";

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;

function App() {
  // const [accessToken, setAccessToken] = useState("");
  const [topSongs, setTopSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const generateRandomString = (length) => {
    let text = "";
    let possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  const generateCodeChallenge = async (codeVerifier) => {
    function base64encode(string) {
      return btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);

    return base64encode(digest);
  };

  const auth_uri = "https://accounts.spotify.com/authorize";

  let codeVerifier = generateRandomString(128);

  const getAuthCode = () => {
    generateCodeChallenge(codeVerifier).then((codeChallenge) => {
      let state = generateRandomString(16);
      let scope = "user-top-read";

      localStorage.setItem("code_verifier", codeVerifier);

      let args = new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
        state: state,
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
      });

      window.location = `${auth_uri}?` + args;
    });
  };

  const getTopSongs = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get("code");

    let verifier = localStorage.getItem("code_verifier");

    let data = qs.stringify({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      code_verifier: verifier,
    });

    axios
      .post("https://accounts.spotify.com/api/token", data, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((response) => {
        // console.log(response);
        if (!response.status === 200) {
          throw new Error("HTTP status " + response.status);
        }
        // setAccessToken(response.data.access_token);
        return response.data.access_token;
      })
      .then((token) => {
        axios({
          url: "https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10",
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }).then((response) => {
          // console.log(response.data.items);
          return setTopSongs(response.data.items);
        });
        axios({
          url: "https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10",
          method: "GET",
          headers: {
            Authorization: "Bearer " + token,
          },
        }).then((response) => {
          // console.log(response.data.items);
          return setTopArtists(response.data.items);
        });
      });
  };

  return (
    <div className="App">
      <Container fluid style={{ padding: "10px" }}>
        <Button onClick={getAuthCode}>Login</Button>
        <Button onClick={getTopSongs}>Display Stats</Button>
        <Row>
          <Col>
            <Container>
              {topArtists.length > 0 ? <h3>Top Artists</h3> : ""}
              <ListGroup as="ol" numbered>
                {topArtists.map((artist) => (
                  <ListGroupItem as="li">{artist.name}</ListGroupItem>
                ))}
              </ListGroup>
            </Container>
          </Col>
          <Col>
            <Container>
              {topSongs.length > 0 ? <h3>Top Tracks</h3> : ""}
              <ListGroup as="ol" numbered>
                {topSongs.map((songInfo) => (
                  <ListGroupItem as="li">
                    {songInfo.name} By{" "}
                    {songInfo.artists.map((artist, i, arr) => (
                      <span>
                        {artist.name}
                        {i !== arr.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </ListGroupItem>
                ))}
              </ListGroup>
            </Container>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
