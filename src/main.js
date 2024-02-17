import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createStore } from 'vuex'
import { auth } from './firebaseInit.js'; // Import the firebase module
import App from './App.vue'
import ChatBot from './components/ChatBot.vue';
import ChatThread from './components/ChatThread.vue';
import LogIn from './components/Login.vue';
import '@fortawesome/fontawesome-free/css/all.css'
import './main.css';

// Define your routes
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LogIn,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'ChatBot',
    component: ChatBot,
    meta: { requiresAuth: true }
  },
  {
    path: '/thread/:id',
    name: 'Thread',
    component: ChatThread,
    props: true,
    meta: { requiresAuth: true }
  }
];

// Create the router instance 
const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const currentUser = store.state.user;
  const isLoginPage = to.path === '/login';

  if (requiresAuth && !currentUser) {
    next('/login');
  } else if (isLoginPage && currentUser) {
    console.log('User is already logged in');
    next('/');
  } else {
    next();
  }
});

// Define your store
const store = createStore({
  state() {
    return {
      // your state here
      user: null, 
    }
  },
  mutations: {
    setUser(state, user) {
      state.user = user; // add this mutation to update the user's state
    },
    // your mutations here
  },
  actions: {
    // your actions here
  },
  getters: {
    // your getters here
  }
})

// Create the app instance and mount it
let app;

// Add a Firebase authentication state observer
auth.onAuthStateChanged(user => {
  store.commit('setUser', user); // update the user's state when the authentication state changes
  if (!app) {
    app = createApp(App)
    .use(router)
    .use(store);
    app.mount('#app')
  }
});

