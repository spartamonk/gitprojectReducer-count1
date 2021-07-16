import React, { useReducer, useEffect } from 'react'
import mockUser from './mockData.js/mockUser'
import mockRepos from './mockData.js/mockRepos'
import mockFollowers from './mockData.js/mockFollowers'
import { reducer } from '../reducer/reducer'
import {
  TOGGLE_ERROR,
  CHECK_REQUESTS,
  HANDLE_CHANGE,
  SET_USER,
  SET_FOLLOWERS,
  TOGGLE_LOADING,
  SET_REPOS,
} from '../reducer/action'
import axios from 'axios'

const rootUrl = 'https://api.github.com'

const GithubContext = React.createContext()

const initialState = {
  githubUser: mockUser,
  followers: mockFollowers,
  repos: mockRepos,
  remainingRequests: 0,
  isLoading: false,
  error: {
    isError: false,
    errorMsg: '',
  },
  user: '',
}
const GithubProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const toggleError = (isError = 'false', errorMsg = '') => {
    dispatch({ type: TOGGLE_ERROR, payload: { isError, errorMsg } })
  }
  const toggleLoading = (isLoading = 'false') => {
    dispatch({ type: TOGGLE_LOADING, payload: isLoading })
  }

  const checkRequests = () => {
    axios(`${rootUrl}/rate_limit`).then((response) => {
      let { remaining } = response.data.rate
      dispatch({ type: CHECK_REQUESTS, payload: remaining })
      if (remaining === 0) {
        toggleError(true, 'you have used all your hourly requests')
      }
    })
  }
  useEffect(checkRequests, [])
  const handleChange = (type) => {
    dispatch({ type: HANDLE_CHANGE, payload: type })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (state.user) {
      fetchUser()
    }
  }
  const fetchUser = async () => {
    toggleLoading()
    toggleError()
    const response = await axios(`${rootUrl}/users/${state.user}`).catch(
      (error) => console.log(error)
    )
    if (response) {
      dispatch({ type: SET_USER, payload: response.data })
      const { login, followers_url } = response.data
      // axios(`${followers_url}?per_page=100`).then(response=> {
      //   dispatch({type:SET_FOLLOWERS, payload: response.data})
      // }).catch(error=> console.log(error))
      // axios(`${rootUrl}/users/${login}/repos?per_page=100`).then(response=> {
      //   dispatch({type: SET_REPOS, payload: response.data})
      // })
      await Promise.allSettled([
        axios(`${followers_url}?per_page=100`),
        axios(`${rootUrl}/users/${login}/repos?per_page=100`),
      ]).then(([followers, repos]) => {
        const status = 'fulfilled'
        if (followers.status === status) {
          dispatch({ type: SET_FOLLOWERS, payload: followers.value.data })
        }
        if (repos.status === status) {
          dispatch({ type: SET_REPOS, payload: repos.value.data })
        }
      })
    } else {
      toggleError(true, 'There Is No User With That Username')
    }
    toggleLoading(false)
    checkRequests()
  }
  return (
    <GithubContext.Provider value={{ ...state, handleChange, handleSubmit }}>
      {children}
    </GithubContext.Provider>
  )
}

const useGlobalContext = () => {
  return React.useContext(GithubContext)
}

export { useGlobalContext, GithubProvider }
