

function addSideBarBtnEvent(){
    const sideBarBtn = document.querySelector('.side-bar-btn')
    const app = document.querySelector('#app')
    sideBarBtn.addEventListener("click",(e)=>{
        app.classList.toggle('side-bar-open')
    })
}

addSideBarBtnEvent()