<template>
  <div class="box-content h-[60vh] bg-neutral-100 rounded-lg p-4 mt-2 mb-4">
    <div class="flex flex-col-reverse h-full overflow-y-auto p-4 gap-y-4 chat-window">
      <div ref="lastMessage"></div>
      <div v-if="thinking" class="flex items-start space-x-2 pt-2">
        <div class="w-4 h-4 bg-zinc-500 rounded-full animate-bounce"></div>
        <div class="w-4 h-4 bg-zinc-500 rounded-full animate-bounce"></div>
        <div class="w-4 h-4 bg-zinc-500 rounded-full animate-bounce"></div>
      </div>
      <div v-for="(message) in messages" :key="message.id" :ref="message.id" class="flex items-start space-x-2">
        <ChatMessage :message="message" />
      </div>
    </div>
  </div>
</template>

<script>
import ChatMessage from './ChatMessage.vue';

export default {
  components: {
    ChatMessage
  },
  props: {
    messages: {
      type: Array,
      required: true,
    },
    thinking: {
      type: Boolean,
      required: true
    }
  },
  watch: {
    messages: {
      handler: function () {
        this.$nextTick(() => {
          const chatWindow = this.$el.querySelector('.chat-window');
          chatWindow.scrollTop = chatWindow.scrollHeight;
        });
      },
      deep: true
    },
    thinking() {
      console.log("showThinking changed to " + this.thinking);
    }
  }
};
</script>

<style scoped>
</style>