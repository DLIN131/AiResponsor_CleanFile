// import axios from 'axios'

let OPENAI_API_KEY = ''
let client = null
const form = document.querySelector("form")
const chatContainer = document.querySelector("#chat_container")
const modelChoosed = document.querySelector("#model")
const apikeyInput = document.querySelector('#apikey')
apikeyInput.addEventListener('change',function(){
  OPENAI_API_KEY = this.value ;
})

// const configuration = new Configuration({
//   apiKey: OPENAI_API_KEY,
// })

// const openai = new OpenAIApi(configuration)



let loadInterval

//讓機器人回應時有...動畫
function loader(elements) {
  elements.textContent = ''
  loadInterval = setInterval(()=>{
    elements.textContent +='.'

    if (elements.textContent === '....') {
      elements.textContent = '';
    }
  },300)
}

function typeText(elements, text){
  let index = 0

  let interval = setInterval(()=>{
    if(index < text.length){
      elements.innerHTML += text.charAt(index)
      index++
    }else{
      clearInterval(interval)
    }
  },20)
}

function generateUniqueId(){
  const timestamp = Date.now()
  const randomNumber = Math.random()
  const hexadecimalString = randomNumber.toString(16)

  return `id-${timestamp}-${hexadecimalString}`
}

function chatStripe(isAi, value, uniqueId){
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img 
            src="${isAi? "./assets/bot.svg" : "./assets/user.svg"}"
            alt="${isAi? 'bot' : 'user'}"  />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>`
  )
}


function createClient(){
  client = axios.create({
    headers:{
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    }
  })
}




async function usingTextDavince003(prompt){
  const params = {
    model: "text-davinci-003",
    prompt: `${prompt}`,
    temperature: 0,
    max_tokens: 3000,
    top_p: 1,
    frequency_penalty: 0.5,
    presence_penalty: 0,
  }

  try {
    const response = await client.post('https://api.openai.com/v1/completions',params)
    return response.data.choices[0].text
      
  } catch (error) {
      console.log(error);
  }
}

async function usingGpt35Turbo(prompt){
  const params = {
    model: "gpt-3.5-turbo",
    messages: [{
      role: 'user',
      content: `${prompt}`
    }],
    max_tokens: 1000,
    n: 1,
    // stop: ['.'],
  }

  try {
    const response = await client.post('https://api.openai.com/v1/chat/completions', params);
    return response.data.choices[0].message.content;
  } catch (error) {
      console.log(error);
  }
}

const handleSubmit = async (e) =>{
  e.preventDefault()
  const data = new FormData(form)
  let prompt = data.get('prompt')
  console.log(prompt);
  createClient()
  //使用者的聊天文字
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))
  form.reset();

  //機器人的聊天文字
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatStripe(true, "",uniqueId)
  chatContainer.scrollTop = chatContainer.scrollHeight

  const messageDiv = document.getElementById(uniqueId)
  loader(messageDiv)
  //使用OPEN_API抓資料
  let response
  if(modelChoosed.value === 'text-davinci-003'){
    response = await usingTextDavince003(data.get('prompt'))
  }else if(modelChoosed.value === 'gpt-3.5-turbo'){
    console.log(modelChoosed.value);
    response = await usingGpt35Turbo(data.get('prompt'))
    prompt += " " + response
    console.log(prompt);
  }
  
  clearInterval(loadInterval)
  messageDiv.innerHTML = ''
  if(response){
    typeText(messageDiv, response.trim())
  }else{
    const err = await response
    messageDiv.innerHTML = "Something went wrong"
    alert(err)
  }
}

form .addEventListener("submit",handleSubmit)
form.addEventListener('keyup',(e)=>{
  if(e.key === 13){
    handleSubmit(e)
  }
})
