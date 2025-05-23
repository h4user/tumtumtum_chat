const socket = io({
	auth: {	
		cookie:document.cookie
	}
})
let form = document.getElementById('form')
let list = document.getElementById('message')


form.addEventListener('submit', (e) => {
	e.preventDefault();
	if (input.value) {
		socket.emit('new_message', input.value)
		input.value = ''
	}
})
socket.on('message', (text) => {
 let li = document.createElement('li');
 li.innerHTML = text;
 list.append(li)
})
socket.on('all_message', async (mes) => {
mes.forEach((arr) => {
 let li = document.createElement('li');
 li.innerHTML = arr.login+": "+arr.content;
 list.append(li)
})
})
function exit(){
	document.cookie = 'token= ;Max-Age=0;';
	window.location.reload();
}
