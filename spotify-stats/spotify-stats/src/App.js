import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { Container, ListGroup, Button } from "react-bootstrap";
import { Buffer } from "buffer";
import axios from "axios";
import qs from "qs";

const CLIENT_ID = "";
const CLIENT_SECRET = "";

function App() {
  const [accessToken, setAccessToken] = useState("");
  const [topSongs, setTopSongs] = useState([]);

  useEffect(() => {
    const auth_token = Buffer.from(
      `${CLIENT_ID}:${CLIENT_SECRET}`,
      "utf-8"
    ).toString("base64");

    const data = qs.stringify({
      grant_type: "client_credentials",
    });

    axios
      .post("https://accounts.spotify.com/api/token", data, {
        headers: {
          Authorization: `Basic ${auth_token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then(
        // response => console.log(response)
        (response) => setAccessToken(response.data.access_token)
      );
    
    
  }, []);

  const getTopSongs = async () => {
    await axios({
      url: 'https://api.spotify.com/v1/artists/0TnOYISbd1XYRBk9myaseg',
      method: "GET",
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    }).then(
      response => {return console.log(response)}
    );
  }


  return (
    <div className="App">
      <Container>
        <Button onClick={getTopSongs}>
          test
        </Button>
        <ListGroup></ListGroup>
      </Container>
    </div>
  );
}

export default App;



