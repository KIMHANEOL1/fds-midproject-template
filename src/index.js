import axios from 'axios';

const postAPI = axios.create({});
const rootEl = document.querySelector('.root');

if(localStorage.getItem('token')) {
  postAPI.dafaults.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
  rootEl.classList.add('root--authed');
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
    const res = await postAPI.get('http://localhost:3000/posts');
    const listFragment = document.importNode(templates.postList, true);  
    
    listFragment.querySelector('.post-list__login-btn').addEventListener('click', e=>{
      loginPage();
    })

    listFragment.querySelector('.post-list__logout-btn').addEventListener('click', e=>{
      localStorage.removeItem('token');
      delete postAPI.defaults.headers['Authorization'];
      rootEl.classList.remove('root--authed');
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
   const res = await postAPI.get(`http://localhost:3000/posts/${postId}`); 
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
      const res = await postAPI.post('http://localhost:3000/users/login', payload);
      localStorage.setItem('token', res.data.token);
      postAPI.defaults.headers['Authorization'] = `Bearer ${res.data.token}`;
      rootEl.classList.add('.root--authed');
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
          const res = await postAPI.post('http://localhost:3000/posts', payload);
          console.log(res);
          postContentPage(res.data.id);
    })


    render(fragment);
}

indexPage();



