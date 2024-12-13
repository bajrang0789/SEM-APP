<template>
  <v-app>
    <v-main>
      <v-container fluid class="chat-container">
        <!-- Chat Messages Section -->
        <v-card ref="scrollContainer" class="chat-box" flat>
          <v-card class="pr-10 pl-10 chat-window">
            <div v-for="(message, index) in messages" :key="index" class="message-row"
              :class="{ 'user-message': message.user }">
              <v-avatar v-if="!message.user" class="bot-avatar">
                <v-icon>mdi-robot</v-icon>
              </v-avatar>
              <div class="message-bot" max-width="400" :class="{ 'messgae-user': message.user }">
                <div v-if="message.text" class="message-text">{{ message.text }}</div>
                <div v-if="message.text && message.hasDataSet" class="message-text">
                  <v-card color="white" class="pa-2" >
                    <span v-for="(value, key) in message.data" :key="key">
                    <span>{{ key }}: {{ value }} <br></span>
                  </span>
                  </v-card>
                </div>
                <v-img v-if="message.image" :src="message.image" :width="100" aspect-ratio="1/1"
                  alt="User uploaded image">
                </v-img>
              </div>
            </div>
            <div v-if="isBotTyping" class="message-row">
              <v-avatar class="bot-avatar">
                <v-icon>mdi-robot</v-icon>
              </v-avatar>
              <div class="message-bot">
                <div class="loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </v-card>
        </v-card>

        <!-- Input Section -->
        <v-row class="input-section bg-chat" align="center" justify="center">
          <v-col cols="8">
            <v-text-field v-model="input" rounded="pill" variant="solo-filled" flat hide-details
              placeholder="ask something about your expense..." @keydown.enter="sendMessage"></v-text-field>
          </v-col>
          <v-col cols="4">
            <v-btn icon color="#007991" @click="sendMessage">
              <v-icon>mdi-send</v-icon>
            </v-btn>
            <v-btn icon class="ml-2" color="#007991" @click="selectFile">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <input type="file" ref="importRecipt" style="display: none" @change="onFileSelected" />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import axios from 'axios';
import { error } from 'console';
interface Message {
  text?: string;
  user: boolean;
  image?: string;
  hasDataSet?: boolean;
  data?: object;
}
interface Expense {
  title?: string,
  amount?: string,
  date?: string,
  tags?: string[],
  category?: string,
  isAddExpense?: boolean
}
const isBotTyping = ref(false);
// Reactive data properties
const input = ref('');
const messages = ref<Message[]>([
  { text: 'Hi there!\n\t How can I assist you today?', user: false },
]);
const importRecipt = ref<HTMLInputElement | null>(null);
const selectFile = () => {
  importRecipt.value?.click();
};
const updateImage = (file: File) => {
  if (!file) return; // Ensure the file is provided

  const reader = new FileReader();

  // Event listener for successfully reading the file
  reader.onload = (event) => {
    const result = event?.target?.result; // Get Base64 string from FileReader
    if (typeof result === 'string') {
      messages.value.push({ image: result, user: true }); // Add new message with the image
    }
  };

  // Read the file as a Base64 string
  reader.readAsDataURL(file);
};
const scrollContainer = ref<HTMLElement | null>(null);
// const scrollToDown = () => {
//   if (scrollContainer.value) {
//     const element = scrollContainer.value.querySelector('.chat-window');
//       if (element) {
//        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
//       } else {
//        console.warn('Element with class not found');
//       }
//     }
// }
const onFileSelected = async (event: Event) => {
  isBotTyping.value = true;
  const input = event.target as HTMLInputElement;
  const file = input?.files?.[0];
  if (!file) return;
  updateImage(file);
  // scrollToDown();
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const base64Image = (reader.result as string).split(',')[1]; // Extract Base64 data

      const response = await axios.post('http://localhost:3030/upload-recipt', {
        image: base64Image,
      });
      console.log("recipt response: ", response.data);
      messages.value.push({ text: "Hello, your expense details below!", user: false, hasDataSet: true, data: response.data });
      console.log(response.data);
      isBotTyping.value = false;
    } catch (error) {
      console.error('Error analyzing receipt:', error);
    }
  };

  reader.readAsDataURL(file);
};
// Methods
const sendMessage = async () => {
  isBotTyping.value = true;
  const userInput = input.value.trim();
  if (userInput.trim()) {
    messages.value.push({ text: userInput, user: true });
    input.value = '';
    const response = await axios.get('http://localhost:3030/send-prompt', {
          params: {
            prompt: userInput,
          },
        });
        if(response.data.isAddExpense){
          messages.value.push({ text: "Hello, your expense details updated!", user: false, hasDataSet: true, data: response.data });
        }else{
          messages.value.push({ text : "Here is the result!",user : false,hasDataSet:true, data:response.data});
        }
        isBotTyping.value = false;
  }
};

</script>

<style scoped>
.chat-container {
  height: calc(100vh - 64px);
  /* Adjust based on your header height */
  overflow-y: auto;
  padding-bottom: 80px;
  /* Space for input field */
}

.bg-chat {
  background: #485563;
  background: -webkit-linear-gradient(to right, #29323c, #485563);
  background: linear-gradient(to right,#a0a0a0, #dadada); 
}

.chat-box {
  max-height: 100%;
  overflow-y: auto;
}

.input-section {
  position: fixed;
  bottom: 0;
  width: 100%;
  background-color: white;
  padding: 10px;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.message-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-message {
  justify-content: flex-end;
}

.message-bot {
  color: white;
  background-color: #8a8a8a;
  border-radius: 10px;
  padding: 10px;
  max-width: 400px;
}

.message-user {
  color: white;
  background-color: #f3e0fa;
  border-radius: 10px;
  padding: 10px;
  max-width: 400px;
}

.bot-message {
  justify-content: flex-start;
}

.bot-avatar {
  margin-right: 10px;
}

.message-user .message-bot {
  max-width: 70%;
}

.message-text {
  word-wrap: break-word;
}

.loading-dots {
  display: flex;
  gap: 5px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background-color: rgb(255, 255, 255);
  border-radius: 50%;
  animation: loading 1.4s infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes loading {

  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}
</style>