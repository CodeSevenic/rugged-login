require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const config = {
  loginEndpoint: process.env.LOGIN_ENDPOINT,
  logoutEndpoint: process.env.LOGOUT_ENDPOINT,
  loginCredentials: {
    name: process.env.USER_NAME,
    password: process.env.PASSWORD,
    company: process.env.COMPANY,
  },
};

async function login() {
  try {
    console.log('Attempting to login.');
    const response = await axios.post(config.loginEndpoint, config.loginCredentials, {
      headers: { 'Content-Type': 'application/json' },
    });

    const sessionId = response.headers['set-cookie'][0].split(';')[0].split('=')[1];
    const aspxAuthCookie = response.headers['set-cookie'].find((cookie) =>
      cookie.includes('.ASPXAUTH')
    );
    const aspxAuth = aspxAuthCookie.split(';')[0].split('=')[1];

    console.log(`Logged in successfully with sessionID: ${sessionId}`);
    console.log(`Logged in successfully with ASPXAuth: ${aspxAuth}`);
    return { sessionId, aspxAuth };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

async function logout(sessionId) {
  try {
    console.log('Attempting to logout.');
    await axios.post(config.logoutEndpoint, null, {
      headers: { Cookie: `ASP.NET_SessionId=${sessionId}` },
    });
    console.log('Logged out successfully.');
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

app.get('/login', async (req, res) => {
  try {
    const { sessionId, aspxAuth } = await login();
    res.json({ sessionId, aspxAuth });
    await logout(sessionId);
  } catch (error) {
    res.status(500).json({ error: 'Failed to login', details: error.toString() });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
