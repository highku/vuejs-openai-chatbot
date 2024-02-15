<template>
  <div>
    <!-- <header class="bg-white shadow">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-bold tracking-tight text-gray-900">My Chats</h1>
      </div>
    </header> -->
    <div v-if="threads.length" class="container mx-auto format">
      <div class="flex justify-end items-center pt-4 pb-4">
        <button @click="startNewThread" class="text-sm bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
          Start New Session
        </button>
      </div>
      <div class="table-wrp pt-0">
        <table class="w-full text-sm text-left rtl:text-right mt-0 p-2">
          <thead class="text-xs uppercase sticky top-0 border-b">
            <tr>
              <th scope="col" class="px-6 py-3">Thread</th>
              <th scope="col" class="px-6 py-3">Created At</th>
            </tr>
          </thead>
          <tbody class="h-96 overflow-y-auto">
            <tr v-for="thread in threads" :key="thread.id" class="bg-white border-b transition duration-300 ease-in-out hover:bg-gray-100">
              <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-normal">
                <router-link :to="{ name: 'Thread', params: { id: thread.id } }">
                  {{ thread.previewText && thread.previewText.length > 50 ? 
                    thread.previewText.substring(0, 50) + '...' : thread.previewText 
                  }}
                </router-link>
              </td>
              <td class="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">{{ 
                thread.createdAt.toDate().toLocaleString(undefined, { 
                  month: 'short', 
                  day: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) 
                }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="container mx-auto format">
      <div class="flex flex-col pt-52 justify-center">
        <div class="flex justify-center">
          <p>No historical sessions found.</p>
        </div>
        <div class="flex justify-center">
          <button @click="startNewThread" class="text-white bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-md text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Start New Session</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '../firebaseInit.js'; // adjust the path according to your project structure
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { mapState } from 'vuex';

export default {
  components: {
  },
  computed: {
    ...mapState(['user'])
  },
  data() {
    return {
      threads: []
    };
  },
  methods: {
    startNewThread() {
      // navigate to a new thread page
      this.$router.push({ name: 'Thread', params: { id: 'new' } });
    }
  },
  async created() {
    console.log('created');

    // fetch historical threads from Firestore
    const q = query(collection(db, 'threads'), where('userId', '==', this.user.uid), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    this.threads = querySnapshot.docs.map(doc => 
      {
        return {
          id: doc.id,
          ...doc.data()
        };
      }
    );
  }
};
</script>

<style scoped>
.start-chat-cta {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 0vh; 
}
.table-wrp  {
  max-height: 70vh;
  overflow-y: auto;
  display: block;
}
/* thead{
  position:sticky;
  top:0
} */
</style>