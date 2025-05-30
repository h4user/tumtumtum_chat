const http = require('http')
const fs = require('fs')
const path = require('path')
const db = require('./database')
const cookie = require('cookie')
const pathToIndex = path.join(__dirname, 'static', 'index.html')
const pathToStyle = path.join(__dirname, 'static', 'style.css')
const pathToScript = path.join(__dirname, 'static', 'script.js')
const pathToReg = path.join(__dirname, 'static', 'register.html')
const pathToAut = path.join(__dirname, 'static', 'aut.js')
const pathTolog = path.join(__dirname, 'static', 'login.html')
const indexHtmlFile = fs.readFileSync(pathToIndex);
const styleFile = fs.readFileSync(pathToStyle);
const scriptFile = fs.readFileSync(pathToScript);
const regFile = fs.readFileSync(pathToReg);
const autFile = fs.readFileSync(pathToAut);
const logFile = fs.readFileSync(pathTolog);
let validAuthToken = [];

const server = http.createServer((req, res) =>{

if(req.url == '/style.css'){
	return res.end(styleFile)
}

else if(req.url == '/register'){
	return res.end(regFile)
}
else if(req.url == '/aut.js'){
	return res.end(autFile)
}
else if(req.url == '/login'){
	return res.end(logFile)
}
else if (req.url == '/api/login') {
	let data = '';
	req.on('data', function(chunk) {
		data+= chunk;
	});
	req.on('end', async function() {
		try{
			const user = JSON.parse(data)
			const token = await db.getAuthToken(user);
            validAuthToken.push(token);
            res.writeHead(200);
            res.end(token)
		}catch(e){
             res.writeHead(500);
             return res.end('Error: '+e);
		}
	})
	return
}

else if(req.url == '/api/register'){
	let data = '';
	req.on('data', function(chunk) {
		data+= chunk;
	});
	req.on('end', async function() {
		console.log(data);
		let user_p =  JSON.parse(data)
		try{
		if (!user_p.login && !user_p.password){
			res.end("POLYA PUSTYI HAPUSHU SHOCY");
			console.log("POLYA PUSTYI HAPUSHU SHOCY");

		}
		if (await db.userExist(user_p.login)) {
            res.end("E takuy korustuvach");
			console.log("E takuy korustuvach");
		}
		await db.addUser(user_p)
		res.end("User registered")
	    }catch(e){
	    	res.end("Error: "+ e)
	    }
	});
	return;
}
else{
	guarded(req, res);
}

})

 server.listen(3000);
 const { Server } = require("socket.io")
 const io = new Server(server);
io.use((socket, next) => {
	const cookie = socket.handshake.auth.cookie;
	const credentionals = getCredentionals(cookie)
	if(!credentionals){
		next(new Error("no auth"))
	}
	socket.credentionals = credentionals;
	next();
})

 io.on('connection', async (socket) => {
 	console.log('a user connected. id -' + socket.id);
 	let mes = await db.getMessage()
 	socket.emit('all_message', mes)
 	let userNickname = socket.credentionals?.login
 	let userid = socket.credentionals?.user_id
 	socket.on('new_message', async (message) =>{
       console.log(message)

        db.addMessage(message, userid);

 		io.emit('message', `${userNickname}: ${message}`)
 		
 	})
 });

 function guarded(req, res) {
 	const credentionals = getCredentionals(req.headers?.cookie)
 	if (!credentionals) {
 		res.writeHead(302, {'Location': '/register'});
 	}
 	if (req.method === 'GET') {
 		switch(req.url){
 			case '/': return res.end(indexHtmlFile);
 			case '/script.js': return res.end(scriptFile);
 		}
 	}

 }

function getCredentionals(c = '') {
	const cookies = cookie.parse(c)
	const token = cookies?.token;
	if (!token || !validAuthToken.includes(token)) return null;
	const [user_id, login] = token.split('.');
	if (!user_id || !login) return null;
	return{user_id, login} 
}
