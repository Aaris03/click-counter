async function loadCount() {
  const res = await fetch('/count');
  const data = await res.json();

  document.getElementById('contador').innerText = data.count;
}

loadCount();

function getUserId() {
  let id = localStorage.getItem('user_id');

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('user_id', id);
  }

  return id;
}

async function clicker(){
  const userId = getUserId();
  const res = await fetch(`/click?userId=${userId}`)
  const data = await res.json();

  console.log(data)

  document.querySelector('#contador').innerText = data.count
}
