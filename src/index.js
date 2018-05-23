import axios from 'axios';

const postAPI = axios.create({
   baseURL: process.env.API_URL    //환경변수를 고쳤을 떄에는 껐다가 켜주어야함
});
const rootEl = document.querySelector('.root');

//로그인 코드중복제거
function login(token){
  localStorage.setItem('token', token);
  postAPI.defaults.headers['Authorization'] = `Bearer ${token}`;
  rootEl.classList.add('.root--authed');
}

//로그아웃 코드중복제거
function logout(){
  localStorage.removeItem('token');
  delete postAPI.defaults.headers['Authorization'];
  rootEl.classList.remove('root--authed');
}

const templates = {
  postList: document.querySelector('#post-list').content,
  postItem: document.querySelector('#post-item').content,
  postContent: document.querySelector('#post-content').content,
  login: document.querySelector('#login').content,
  postForm: document.querySelector('#post-form').content,    
}


function render(fragment){
  rootEl.textContent='';
  rootEl.appendChild(fragment);
}

async function indexPage() {
    const res = await postAPI.get('/posts');
    const listFragment = document.importNode(templates.postList, true);  
    
    listFragment.querySelector('.post-list__login-btn').addEventListener('click', e=>{
      loginPage();           //로그인 코드중복제거
    })

    listFragment.querySelector('.post-list__logout-btn').addEventListener('click', e=>{
      logout();              //로그아웃 코드중복제거
      indexPage();
    })

    res.data.forEach(post => {
      const fragment = document.importNode(templates.postItem,true);
      const pEl= fragment.querySelector('.post-item__title'); 
      pEl.textContent = post.title;
      pEl.addEventListener('click', e=>{
          postContentPage(post.id);
      })
      listFragment.querySelector('.post-list').appendChild(fragment);
    });
    render(listFragment);
}

async function postContentPage(postId){
   const res = await postAPI.get(`/posts/${postId}`); 
   const fragment = document.importNode(templates.postContent, true);
   fragment.querySelector('.post-content__title').textContent = res.data.title;
   fragment.querySelector('.post-content__body').textContent = res.data.body;
   fragment.querySelector('.post-content__back-btn').addEventListener('click', e=>{
        indexPage();
   })
  
    render(fragment);
  }

async function loginPage(){
  const fragment= document.importNode(templates.login, true);
  const forEl= fragment.querySelector('.login__form');
  forEl.addEventListener('submit', async e => {
      
    //e.target.elements.username===fragment.querySelector('.login__username');
    const payload = {
         username: e.target.elements.username.value,
         password: e.target.elements.password.value
      };
      e.preventDefault();
      const res = await postAPI.post('/users/login', payload);
      login(res.data.token);
      indexPage();
  })
  render(fragment);
}

async function postFormPage() {
    const fragment= document.importNode(templates.postForm, true);
    fragment.querySelector('.post-form__back-btn').addEventListener('click', e =>{
        e.preventDefault();
        indexPage();
    })

    fragment.querySelector('.post-form').addEventListener('submit', async e => {
      e.preventDefault();    
      const payload = {
              title: e.target.elements.title.value,
              body: e.target.elements.body.value
          };
          const res = await postAPI.post('/posts', payload);
          console.log(res);
          postContentPage(res.data.id);
    })


    render(fragment);
}


if(localStorage.getItem('token')) {
  login(localStorage.getItem('token'));
}


indexPage();



