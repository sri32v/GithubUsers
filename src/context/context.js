//Context API

import React, { useState, useEffect } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";

const rootUrl = "https://api.github.com";
const GithubContext = React.createContext();

//Provider, Consumer - GithubContext.Provider  .Consumer

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);
  //request Loading
  const [requests, setRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  //Error
  const [error, setError] = useState({ show: false, msg: "" });

  const searchGithubUser = async(user)=>{
    //   console.log("Search Git User",user);
    // Toggle Error
    toggleError();
    // Setloading to true
    setIsLoading(true);
    const response = await axios(`${rootUrl}/users/${user}`)
    .catch(err=>console.log(err))
    console.log(response);
    if(response) {
        setGithubUser(response.data);
        //More logic here
        const {login,followers_url}=response.data;
        //repos
        axios(`${rootUrl}/users/${login}/repos?per_page=100`)
        .then(response=>console.log(response))
        //followers
        axios(`${followers_url}?per_page=100`)
        .then(response=>console.log(response))
    // - [Repos](https://api.github.com/users/john-smilga/repos?per_page=100)
    // - [Followers](https://api.github.com/users/john-smilga/followers)
    }
    else{
        toggleError(true,'There is no user with that username')
    }
    checkRequests();
    setIsLoading(false);
  }
  //Check rate
  const checkRequests = () => {
    axios(`${rootUrl}/rate_limit`)
      .then(({ data }) => {
        // console.log(data);
        let {
          rate: { remaining },
        } = data;
        setRequests(remaining);
        if (remaining === 0) {
          toggleError(true, "sorry, you have exceeded hourly rate limit!");
        }
      })
      .catch((err) => console.log(err));
  };

  function toggleError(show = false, msg = "") {
    setError({ show, msg });
  }
  //error
  useEffect(checkRequests, []);

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        error,
        searchGithubUser,
        isLoading
      }}
    >
      {children}
    </GithubContext.Provider>
  );
};

export { GithubProvider, GithubContext };
