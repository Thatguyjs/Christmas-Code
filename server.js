const pfs = require('fs/promises');
const http = require('http');
const readline = require('readline');

process.argv = process.argv.slice(2);


const mimes = {
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



function input(prompt) {
	return new Promise((res) => {
		io.question(prompt, res);
	});
}


async function avail_years() {
	const dirs = await pfs.readdir('./', { withFileTypes: true });
	const ignore = ['include', '.git'];

	return dirs.filter(dir => dir.isDirectory() && !ignore.includes(dir.name)).map(dir => dir.name);
}


function request(req, res) {
	if(req.url === '/') {
		res.writeHead(200, { 'Content-Type': 'text/html' });

		pfs.readFile('./years.html', 'utf8').then(async (data) => {
			res.end(data.replace(
				'%years%',
				(await avail_years()).map(year => `<a href="/${year}">${year}</a>`).join('<br>')
			));
		}).catch((err) => {
			console.log("Error:", err);
			res.end("Server Error");
		});

		return;
	}

	if(!req.url.includes('.')) {
		if(!req.url.endsWith('/')) req.url += '/';
		req.url += 'index.html';
	}

	const ext = req.url.slice(req.url.lastIndexOf('.') + 1);

	pfs.readFile(`.${req.url}`).then((data) => {
		if(mimes[ext]) res.writeHead(200, { 'Content-Type': mimes[ext] });
		else res.writeHead(200);

		res.end(data);
	}).catch(() => {
		res.writeHead(404);
		res.end("File Not Found");
	});
}


async function main() {
	if(['years', 'list'].includes(process.argv[0]?.toLowerCase())) {
		console.log("Available years:");
		console.log('  ' + (await avail_years()).join('\n  '));
		io.close();
	}
	else {
		let port = NaN;
		while(isNaN(port)) port = +(await input('port: ')) || 80;
		io.close();

		const server = http.createServer(request);
		server.listen(port, '127.0.0.1');
	}
}


main();
