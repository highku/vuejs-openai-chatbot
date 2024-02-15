<template>
  <div id="app">
    <NavBar @signOut="signOut"></NavBar>
    <router-view/>
  </div>
</template>

<script>
import { auth } from './firebaseInit.js'; 
import { mapState } from 'vuex';
import NavBar from './components/subcomponents/NavBar.vue';

export default {
  name: 'App',
  computed: {
    ...mapState(['user'])
  },
  components: {
    NavBar
  },
  methods: {
    async signOut() {
      await auth.signOut();
      this.$router.push({ name: 'Login' });
    }
  }
};
</script>

<style>
.sign-in-cta {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>