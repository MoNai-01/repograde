const axios = require("axios");

// Create Axios client for GitHub API
const client = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
    Authorization: process.env.GITHUB_TOKEN
      ? `Bearer ${process.env.GITHUB_TOKEN}`
      : undefined
  }
});

// Wrapper for GET requests with error handling
async function get(url, options = {}) {
  try {
    const res = await client.get(url, options);
    return res;
  } catch (err) {
    if (err.response) {
      // GitHub returned an error response
      const status = err.response.status;

      if (status === 404) {
        throw new Error("Repository or user not found. Please check the owner/repo name.");
      }

      if (status === 403 && err.response.headers["x-ratelimit-remaining"] === "0") {
        throw new Error(
          "GitHub API rate limit exceeded. Try again later or set a personal access token in GITHUB_TOKEN."
        );
      }

      // Other GitHub API errors
      throw new Error(`GitHub API error: ${status} ${err.response.statusText}`);
    } else if (err.request) {
      // No response received
      throw new Error("No response from GitHub API. Check your network connection.");
    } else {
      // Other errors
      throw new Error(`Request error: ${err.message}`);
    }
  }
}

// Export the client and wrapped GET
module.exports = {
  client,
  get
};

