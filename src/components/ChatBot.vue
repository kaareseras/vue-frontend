<script setup>
import { ref, nextTick, onMounted } from 'vue'
const isOpen = ref(false)
const message = ref('')
const history = ref([])
const chatBody = ref(null)
import axios from 'axios';

const defaultMessage = {
    role: 'assistant',
    content: 'Hej! Hvordan kan jeg hjælpe dig med priserne på elektricitet i Danmark i dag?'
}

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}`,
  headers: {
  },
});

// Initialiser chatten
function initChat() {
    history.value = [defaultMessage]
}

const toggleChat = () => {
    isOpen.value = !isOpen.value
}

const sendMessage = async () => {
    if (!message.value.trim()) return

    // Add user message to history
    history.value.push({ role: 'user', content: message.value })

    const payload = {
        message: message.value,
        history: history.value,
    }

    message.value = ''

    try {
        const response = await axiosInstance.post('copilot/agent', payload);
        const data = await response.data


        // Add assistant response
        history.value.push({ role: 'assistant', content: data.content })
    } catch (error) {
        console.error('Error:', error)
        history.value.push({
            role: 'assistant',
            content: 'Sorry, something went wrong.',
        })
    }

    await nextTick()
    if (chatBody.value) {
        chatBody.value.scrollTop = chatBody.value.scrollHeight
    }


}

    onMounted(() => {
        initChat()
    })

// Funktion til at cleare chatten
// Ryd chatten og tilføj standard besked
function clearChat() {
    initChat()
}
</script>
<template>
    <div class="chatbot-container">
        <div class="chatbot-toggle" @click="toggleChat">
            💬
        </div>

        <div v-if="isOpen" class="chat-window">
            <div class="chat-header">
                <span>Copilot Assistant Helper Agent AI</span>
                <button @click="toggleChat">✖</button>
            </div>

            <div class="chat-body" ref="chatBody">
                <div v-for="(msg, index) in history" :key="index" :class="['chat-message', msg.role]">
                    <div class="message-bubble">{{ msg.content }}</div>
                </div>
            </div>

            <form class="chat-input" @submit.prevent="sendMessage">
                <input type="text" v-model="message" placeholder="Type a message..." required />
                <button type="submit">Send</button> 
                <button class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    @click="clearChat">Clear</button>
            </form>
        </div>
    </div>
</template>
<style scoped>
.chatbot-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    font-family: Arial, sans-serif;
    z-index: 1000;
}

.chatbot-toggle {
    background-color: #007bff;
    color: white;
    border-radius: 50%;
    padding: 12px;
    cursor: pointer;
    text-align: center;
    font-size: 20px;
    width: 60px;
    height: 60px;   
}

.chat-window {
    width: 600px;
    height: 800px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chat-header {
    background: #007bff;
    color: white;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    background: #f9f9f9;
}

.chat-message {
    display: flex;
    margin-bottom: 10px;
}

.chat-message.user {
    justify-content: flex-start;
}

.chat-message.assistant {
    justify-content: flex-end;
}

.message-bubble {
    max-width: 70%;
    padding: 8px 12px;
    border-radius: 16px;
    background: #e0e0e0;
}

.chat-message.assistant .message-bubble {
    background: #d1ecf1;
}

.chat-input {
    display: flex;
    padding: 10px;
    border-top: 1px solid #ddd;
}

.chat-input input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 16px;
    margin-right: 8px;
}

.chat-input button {
    padding: 8px 12px;
    border: none;
    background: #007bff;
    color: white;
    border-radius: 16px;
    cursor: pointer;
}
</style>
