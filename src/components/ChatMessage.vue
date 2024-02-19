<template>
  <div class="flex flex-col space-y-2 p-2 border rounded-md bg-white">
    <span class="text-xs font-semibold decoration-slate-50">{{ message.role === "user" ? "You" : "Assistant" }}</span>
    <div v-html="convertMarkdownToHtml(message.text)" class="text-sm message-text"></div>
    <div v-if="fileUrls && fileUrls.length">
      <div v-for="(url, index) in fileUrls" :key="index">
        <img v-if="mimeTypes[index] ? mimeTypes[index].startsWith('image') : false" :src="url" class="max-h-64 rounded-md" />
        <video v-else-if="mimeTypes[index] ? mimeTypes[index].startsWith('video') : false" :src="url" class="max-h-64 rounded-md" controls />
        <a v-else :href="url" download>Download file</a>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, getMetadata, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebaseInit';
import MarkdownIt from 'markdown-it';

export default {
  props: {
    message: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      mimeTypes: [],
      fileUrls: []
    }
  },
  methods: {
    convertMarkdownToHtml(markdown) {
      const md = new MarkdownIt();
      return md.render(markdown);
    }
  },
  mounted() {
    for (let i = 0; i < this.message.files.length; i++) {
      getDownloadURL(ref(storage, this.message.files[i])).then((url) => {
        this.fileUrls.push(url);
      });

      getMetadata(ref(storage, this.message.files[i])).then((metadata) => {
        this.mimeTypes.push(metadata.contentType);
      });
    }
  }
};
</script>

<style scoped>
.thumbnail {
  width: 100px; 
  height: 100px; 
  object-fit: cover;
} 

.message-text { 
  margin-top: -1em !important; 
  margin-bottom: -1em !important;
}
</style>