const fs = require('fs');
const http = require('http');
const readline = require('readline');


const types = {
	'': 'text/plain',
	'txt': 'text/plain',
	'json': 'text/json',

	'html': 'text/html',
	'css': 'text/css',
	'js': 'text/javascript',
	'mjs': 'application/javascript',

	'png': 'image/png',
	'jpg': 'image/jpeg',
	'jpeg': 'image/jpeg',
	'ico': 'image/x-icon'
};


const io = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});


let port = NaN;
let year = null;


function input(prompt) {
	return new Promise((res) => {
		io.question(prompt, res);
	});
}


function request(req, res) {
	if(!req.url.endsWith('/')) req.url += '/';
	if(!req.url.includes('.')) req.url += 'index.html';

	let path = `./${year}${req.url}`;

	fs.readFile(path, (err, data) => {
		if(err) {
			res.writeHead(404);
			res.end("Not found");
			return;
		}

		let ext = path.slice(path.lastIndexOf('.') + 1);
		if(ext.slice(-1) === '/') ext = ext.slice(0, -1);

		res.writeHead(200, { "Content-Type": types[ext] || types[''] });
		res.end(data);
	});
}


async function main() {
	while(isNaN(+port)) port = (await input('port: ')) || 80;
	port = +port;
	year = (await input('year: ')) || new Date().getFullYear().toString();

	io.close();

	if(year === 'list') {
		console.log('\nListing possible years:');
		const blacklist = ['include', '.git'];

		fs.readdir('./', { withFileTypes: true }, (_, files) => {
			for(let f in files) {
				if(files[f].isDirectory() && !blacklist.includes(files[f].name)) {
					console.log(files[f].name);
				}
			}
		});
	}
	else {
		const server = http.createServer(request);
		server.listen(port, '127.0.0.1');
	}
}


main();
