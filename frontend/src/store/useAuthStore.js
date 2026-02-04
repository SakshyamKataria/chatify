import {create} from 'zustand';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';

export const useAuthStore = create((set,get) => ({  //setter and getter arguments, mostly we use setter
    authUser: null,
    isCheckingAuth: true,
    isSigningUp : false,

    checkAuth: async () => {
        try{
            const res = await axiosInstance.get('/auth/check');
            set({authUser: res.data});
        }catch(error){
            console.error("Error checking auth:", error);
            set({authUser: null});
        }finally{
            set({isCheckingAuth: false});
        }
    },

    signup : async (data) => {
        set({isSigningUp: true});
        try{
            //we will call the signup api 
            const res = await axiosInstance.post("auth/signup",data);
            //set the authUser with returned data
            set({authUser:res.data});

            //toast notification can be added here for success
            toast.success("Sign up successful!");
        }catch(error){
            toast.error(error.response?.data?.message || "Sign up failed!");
        }finally{
            set({isSigningUp: false});
        }
    }
}));