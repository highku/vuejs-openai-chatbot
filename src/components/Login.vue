<template>
  <div class="login flex place-content-center py-64">
    <button class="text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" @click="signInWithGoogle">Sign in with Google</button>
  </div>
</template>

<script>
import { auth } from '../firebaseInit.js'; 
import { signInWithPopup, GoogleAuthProvider, getAdditionalUserInfo } from 'firebase/auth';
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
        const { isNewUser } = getAdditionalUserInfo(result);

        this.$store.commit('setUser', result.user);
        if (isNewUser) {
          this.$router.push('/thread/new');
        }
        else {
          this.$router.push('/');
        }        
      } catch (error) {
        console.error(error);
        alert('Failed to sign in with Google');
      }
    }
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>