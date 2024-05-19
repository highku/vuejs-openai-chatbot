<template>
    <div class="p-2 border rounded-md bg-neutral-50">
      <textarea v-model="input" class="w-full h-24 p-3 rounded-md border-hidden focus:border-transparent focus:ring-0 bg-neutral-50" placeholder="Type your message...">
      </textarea>
      <div v-for="(image, index) in images" :key="index" class="image-thumb">
        <img :src="imageObjectURLs[index]"/>
        <a @click="removeImage(index)" class="image-fav">
          <i class="fas fa-times"></i>
        </a>
      </div>
      <div v-for="(file, index) in files" :key="index" class="inline-block bg-blue-500 text-white rounded-full px-2 py-1 text-xs mr-2 mb-2">
        {{ file.name }}
        <button @click="removeFile(index)" class="ml-2 focus:outline-none">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <input ref="fileInput" type="file" accept="application/*, text/*" multiple style="display:none;"/>
      <input ref="imageInput" type="file" accept="image/*" multiple style="display:none;"/>
      <div class="flex justify-end">
        <button @click="attachImage" class="top-2 right-2 mr-2 text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500">
          <i class="fas fa-image"></i>
        </button>
        <button @click="attach" class="top-2 right-2 mr-2 text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm p-2.5 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500">
          <i class="fas fa-paperclip"></i>
        </button>
        <button :disabled="thikning || !input" @click="send" class="bg-blue-500 disabled:bg-blue-200 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">Send</button>
      </div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      input: '',
      files: [],
      images: [],
      imageObjectURLs: []
    };
  },
  props: {
    thinking: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    send() {
      this.$emit('send', { text: this.input, files: this.files, images: this.images });
      this.input = '';
      this.files = [];
      this.images = [];
      this.imageObjectURLs = [];
    },
    attach() {
      console.log("attach");
      this.$refs.fileInput.click();
    },
    attachImage() {
      console.log("attachImage");
      this.$refs.imageInput.click();
    },
    removeFile(index) {
      this.files.splice(index, 1);
    },
    removeImage(index) {
      this.images.splice(index, 1);
      this.imageObjectURLs.splice(index, 1);
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
    this.$refs.imageInput.addEventListener('change', (event) => {
      const images = Array.from(event.target.files);
      const totalSize = images.reduce((total, file) => total + file.size, 0) / (1024 * 1024); // size in MB
      if (images.length > 5 || totalSize > 100) {
        alert('You can only attach up to 5 images or 100MB total.');
      } else {
        this.images = images;
        this.imageObjectURLs = images.map(image => URL.createObjectURL(image));
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

.image-thumb, .image-thumb img {
  position:relative;
  width:100px;
}
.image-fav {
  display:block;
  position:absolute;
  top:0;
  right:0;
  width:20px;
  height:20px;
  cursor: pointer;
}
</style>