import {
  TOGGLE_ERROR,
  CHECK_REQUESTS,
  HANDLE_CHANGE,
  SET_REPOS,
  SET_USER,
  TOGGLE_LOADING,
  SET_FOLLOWERS,
} from './action'
export const reducer =(state, action)=> {
 

 switch (action.type) {
   case TOGGLE_ERROR:
     return {
       ...state,
       error: action.payload,
     }
   case CHECK_REQUESTS:
     return {
       ...state,
       remaining: action.payload,
     }
    case TOGGLE_LOADING: 
    return {
     ...state,
     isLoading: action.payload
    }
   case HANDLE_CHANGE:
     return {
       ...state,
       user: action.payload,
     }
   case SET_USER:
     return {
       ...state,
       githubUser: action.payload,
     }
     case SET_FOLLOWERS: 
     return {
      ...state,
      followers: action.payload
     }
     case SET_REPOS: 
     return {
      ...state,
      repos: action.payload
     }
   default:
     throw new Error(`no matching "${action.type}" type found`)
 }

}