// Simple client-side auth using localStorage. NOT for production.

async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadUsers(){
  try{
    const raw = localStorage.getItem('users');
    return raw ? JSON.parse(raw) : {};
  }catch(e){return {};}
}

function saveUsers(users){
  localStorage.setItem('users', JSON.stringify(users));
}

function setSession(email){
  const token = Math.random().toString(36).slice(2);
  localStorage.setItem('session', JSON.stringify({ email, token, ts: Date.now() }));
}

// Signup
document.getElementById('signup-form').addEventListener('submit', async function(e){
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-password-confirm').value;
  const msg = document.getElementById('signup-message');
  msg.textContent = '';

  if(!name || !email || !password){ msg.textContent = 'Please fill all fields'; return; }
  if(password.length < 6){ msg.textContent = 'Password must be at least 6 characters'; return; }
  if(password !== confirm){ msg.textContent = 'Passwords do not match'; return; }

  const users = loadUsers();
  if(users[email]){ msg.textContent = 'An account with that email already exists.'; return; }

  const hash = await hashPassword(password);
  users[email] = { name, passwordHash: hash, createdAt: Date.now() };
  saveUsers(users);
  setSession(email);
  msg.style.color = 'lightgreen';
  msg.textContent = 'Account created — signed in.';
  setTimeout(()=> location.href = 'index.html', 900);
});

// Signin
document.getElementById('signin-form').addEventListener('submit', async function(e){
  e.preventDefault();
  const email = document.getElementById('signin-email').value.trim().toLowerCase();
  const password = document.getElementById('signin-password').value;
  const msg = document.getElementById('signin-message');
  msg.textContent = '';

  if(!email || !password){ msg.textContent = 'Please enter email and password'; return; }
  const users = loadUsers();
  const user = users[email];
  if(!user){ msg.textContent = 'No account found for that email'; return; }
  const hash = await hashPassword(password);
  if(hash !== user.passwordHash){ msg.textContent = 'Incorrect password'; return; }
  setSession(email);
  msg.style.color = 'lightgreen';
  msg.textContent = 'Signed in — redirecting...';
  setTimeout(()=> location.href = 'index.html', 700);
});

// Helper: prefill if session exists
(function(){
  const s = localStorage.getItem('session');
  if(s){ try{ const sess = JSON.parse(s); if(sess && sess.email){ document.getElementById('signin-email').value = sess.email; } }catch(e){}
})();
