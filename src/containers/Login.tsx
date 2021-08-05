import React, { FC, useState } from "react";
import { useAuthentication } from "./Authentication";
import { Button, Form, FormControl } from "react-bootstrap";
import config from '../config';

const Login: FC = () => {
  const { loading, login } = useAuthentication();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [shareCredRequestToken] = useState('eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpbnRlcmFjdGlvblRva2VuIjp7ImNyZWRlbnRpYWxSZXF1aXJlbWVudHMiOlt7InR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJJRERvY3VtZW50Q3JlZGVudGlhbFBlcnNvblYxIl0sImNvbnN0cmFpbnRzIjpbXX1dLCJjYWxsYmFja1VSTCI6IiJ9LCJleHAiOjE2MjgwODM1NzA1NjIsInR5cCI6ImNyZWRlbnRpYWxSZXF1ZXN0IiwianRpIjoiY2NhMjFjYjFlNzYwMzFlNiIsImlzcyI6ImRpZDplbGVtOkVpREZqaVhtN3lFeWNuTWZSbXVJN19icW9zMjItLW1MWDcteVZoWWNRaEFZVlE7ZWxlbTppbml0aWFsLXN0YXRlPWV5SndjbTkwWldOMFpXUWlPaUpsZVVwMlkwZFdlVmxZVW5CaU1qUnBUMmxLYW1OdFZtaGtSMVZwVEVOS2NtRlhVV2xQYVVscVkwaEtjR0pYUm5sbFUwbHpTVzFHYzFwNVNUWkphMVpVVFdwVk1sTjVTamtpTENKd1lYbHNiMkZrSWpvaVpYbEtRVmt5T1hWa1IxWTBaRU5KTmtsdGFEQmtTRUo2VDJrNGRtUjZUbkJhUXpWMlkyMWpkbU15Vm1wa1dFcHdaRWhyZG1ScVNXbE1RMHAzWkZkS2MyRlhUa3hhV0d0cFQyeDBOMGx0Ykd0SmFtOXBTVE5DZVdGWE1XaGpibXRwVEVOS01XTXlSbTVhVTBrMlNXNU9jRm95TlhCaWJXTnBURU5LTUdWWVFteEphbTlwVlRKV2FtTkVTVEZPYlhONFZtMVdlV0ZYV25CWk1rWXdZVmM1ZFZNeVZqVk5ha0Y0VDBOSmMwbHVRakZaYlhod1dUQjBiR1ZWYUd4bFEwazJTV3BCZWs5RVZYaGFWRUpxV1dwYWFrNXFaM2hPYW10NFdsUk9hVTlYUlROYVIxVjRUbnByTlU1NlVYbE9lbU42VGtSS2JVMXFhelJQUkZreFRrZE5NazF0V1RKT2VtUm9UbGRaTlUxdFRtbFBWR2hzVDFSb2FscERTamxNU0hOcFlWZFJhVTlwU1dwamJWWnFZak5hYkdOdWEybE1RMG94WXpKR2JscFRTVFpKYmtwc1dUSTVNbHBZU2pWSmFYZHBaRWhzZDFwVFNUWkpiRTVzV1ROQmVVNVVXbkpOVmxwc1kyMXNiV0ZYVG1oa1IyeDJZbXQwYkdWVVNYZE5WR2RwVEVOS2QyUlhTbk5oVjA1TVdsaHNTVnBZWjJsUGFVbDNUVEpKTUZsWFNUQk5lbFpzV1ZSSk0wMUVWVFJPUjFreFRUSktiVTVYVFhoTlJFVXhXa1JLYlU1RVJYcE5Na1V5V2tSc2FFNTZRbWhPTWtsNldYcGtiVTFIVlhoT2VsazBXVmRGZVU5VVp6Sk9SRVpyVG1wUmFXWldNSE5KYlVZeFpFZG9iR0p1VW5CWk1rWXdZVmM1ZFVscWNHSkphVTUzWTIxc2RGbFlTalZKYkRCelNXMUdlbU15Vm5sa1IyeDJZbXN4YkdSSGFIWmFRMGsyVjNsSmFtTklTbkJpVjBaNVpWTktaR1pSSWl3aWMybG5ibUYwZFhKbElqb2lkbTFFVkVwWFRUTlZiRnB0WTNKTWJTMUNRWEYwVTJ4WVpEUktYMEpMU0hCVmNFcE5WRkJIYkdKSWNEQTRlRVYwUTBWa2NqRmFZbUpwVjIwM1NEQjZTRWRNVUVjMGJXaDZaRFY1TWxSM1ltSkdZamh5VkhjaWZRI3ByaW1hcnkifQ.ddbdcb715f98de9da887cc2a64ec5da650abdc3e4556d0b6beb7b40fd23c8eff054affed7d38c18aa68215cd172ffdbf99df1daa3720d1fd0bbfdac43278f896');

  async function onLogin() {
    try {
      await login.fromLoginAndPassword(username, password);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className='Login'>
      <div className='Form'>
        <h1 className='Title'>Verifier Login</h1>
        <p className='Info'>
          Login in order to continue
        </p>

        <Form style={{ width: 280 }}>
          <Form.Group controlId="username">
            <Form.Label>Username</Form.Label>
            <FormControl
              autoFocus
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <FormControl
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </Form.Group>

          <Button block disabled={loading} onClick={onLogin}>
            Login
          </Button>

          <p> Looking to rent for a vehicle for your trip? Share your driving license credentials <a href={config.wallet_url + '/share-credentials?token=' + shareCredRequestToken} target='_blank' rel="noopener noreferrer">here!</a></p>
        </Form>
      </div>
    </div>

  );
};

export default Login;
