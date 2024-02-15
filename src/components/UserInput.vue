<template>
    <div class="p-2 border rounded-md">
      <textarea v-model="input" class="w-full h-24 p-3 rounded-md border-hidden focus:border-transparent focus:ring-0" placeholder="Type your message...">
      </textarea>
      <div v-for="(file, index) in files" :key="index" class="inline-block bg-blue-500 text-white rounded-full px-2 py-1 text-xs mr-2 mb-2">
        {{ file.name }}
        <button @click="removeFile(index)" class="ml-2 focus:outline-none">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <input ref="fileInput" type="file" multiple style="display:none;"/>
      <div class="flex justify-end">
        <button @click="attach" class="top-2 right-2 mr-2 text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500">
          <i class="fas fa-paperclip"></i>
        </button>
        <button :disabled="disableSendButton" @click="send" class="bg-blue-500 text-white px-4 py-2 rounded-md text-sm disabled:cursor-not-allowed">Send</button>
      </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      input: '',
      files: []
    };
  },
  props: {
    disableSendButton: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    send() {
      this.$emit('send', { text: this.input, files: this.files });
      this.input = '';
      this.files = [];
    },
    attach() {
      this.$refs.fileInput.click();
    },
    removeFile(index) {
      this.files.splice(index, 1);
    }
  },
  mounted() {
    this.$refs.fileInput.addEventListener('change', (event) => {
      const files = Array.from(event.target.files);
      const totalSize = files.reduce((total, file) => total + file.size, 0) / (1024 * 1024); // size in MB
      if (files.length > 5 || totalSize > 100) {
        alert('You can only attach up to 5 files or 100MB total.');
      } else {
        this.files = files;
      }
    });
  }
};
</script>

<style scoped>
.user-input {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-top: 1px solid #ccc;
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: #fff;
  z-index: 100;
}
</style>