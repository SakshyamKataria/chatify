import {create} from 'zustand';

export const useAuthStore = create((set,get) => ({  //setter and getter arguments, mostly we use setter
    authUser: {name:"John Doe", _id: 123, age:25}, //initial value, we will replace it with actual user data after login
    isLoggedIn: false,

    login: () => {
        console.log("Login function called");
        set({isLoggedIn: true});
    }
}));