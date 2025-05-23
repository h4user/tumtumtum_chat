let form = document.getElementById('reg')
let form_log = document.getElementById('log')

form?.addEventListener('submit', (e) =>{
	e.preventDefault();
	if (form.password.value != form.rpassword.value) {
		return alert('TRY AGAIN ')
	}
	let user = JSON.stringify({
		login: form.login.value,
		password: form.password.value
	})
	fetch('/api/register', {
		method: 'POST',
		body: user
	})
})
form_log?.addEventListener('submit', async (e) =>{
	e.preventDefault();
	if (!form_log.login.value && !form_log.password.value) {
    return alert("PoLYa PusTy Fe-fleofe0ff")
	}
	let user = JSON.stringify({
		login: form_log.login.value,
		password: form_log.password.value
	})
	const serverRes = await fetch('/api/login', {
		method: 'POST',
		body: user
	})
     const token = await serverRes.text();
     if (serverRes.ok) {
     	document.cookie = `token=${token}`
     	window.location.assign('/');
     }else{
     	return alert(token)
     }
})