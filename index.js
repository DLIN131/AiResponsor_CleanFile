// import axios from 'axios'

const OPENAI_API_KEY = "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"

const form = document.querySelector("form")
const chatContainer = document.querySelector("#chat_container")


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

function chatSripe(isAi, value, uniqueId){
  return (
    `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img 
            src="${isAi? "bot.svg" : "user.svg"}"
            alt="${isAi? 'bot' : 'user'}"  />
        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>`
  )
}


const client = axios.create({
  headers:{
    Authorization:"Bearer " + OPENAI_API_KEY,
  }
})


async function usingOpenaiApi(prompt){
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

const handleSubmit = async (e) =>{
  e.preventDefault()

  const data = new FormData(form)

  //使用者的聊天文字
  chatContainer.innerHTML += chatSripe(false, data.get('prompt'))
  form.reset();

  //機器人的聊天文字
  const uniqueId = generateUniqueId()
  chatContainer.innerHTML += chatSripe(true, "",uniqueId)
  chatContainer.scrollTop = chatContainer.scrollHeight

  const messageDiv = document.getElementById(uniqueId)
  loader(messageDiv)
  //使用OPEN_API抓資料
  const response = await usingOpenaiApi(data.get('prompt'))
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
