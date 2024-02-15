<template>
  <div class="login flex place-content-center py-64">
    <button class="text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" @click="signInWithGoogle">Sign in with Google</button>
  </div>
</template>

<script>
import { auth } from '../firebaseInit.js'; 
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { mapState } from 'vuex';

export default {
  name: 'LogIn',
  computed: {
    ...mapState(['user'])
  },
  methods: {
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      try {
        const result = 
          await signInWithPopup(auth, provider);
        this.$store.commit('setUser', result.user);
        this.$router.push('/thread/new');
        
        //if user if new, push to thread page
        // if (result.additionalUserInfo.isNewUser) {
        //   console.log("New user");
        //   this.$router.push('/thread');
        // }
        // //if user is not new, push to home page
        // else {
        //   console.log("Old user");
        //   this.$router.push('/');
        // }
        // This gives you a Google Access Token. You can use it to access the Google API.
        // var token = result.credential.accessToken;
        // The signed-in user info.
        // var user = result.user;
        // ...
      } catch (error) {
        // Handle Errors here.
        // var errorCode = error.code;
        // var errorMessage = error.message;
        // // The email of the user's account used.
        // var email = error.email;
        // // The firebase.auth.AuthCredential type that was used.
        // var credential = error.credential;
        // ...
      }
    }
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>