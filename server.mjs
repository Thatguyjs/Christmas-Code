import pfs from "node:fs/promises";
import http from "node:http";


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

async function avail_years() {
	const dirs = await pfs.readdir('./', { withFileTypes: true });
	const ignore = ['include', '.git', 'libs'];

	return dirs.filter(e => e.isDirectory() && !ignore.includes(e.name)).map(dir => dir.name);
}

function html_link(path, name) {
	return `<a href=${path}>${name}</a>`;
}


function request(req, res) {
	if(req.url === '/') {
		res.writeHead(200, { 'Content-Type': 'text/html' });

		pfs.readFile('./years.html', 'utf8').then(async (data) => {
			const year_html = (await avail_years()).map(year => html_link(`/${year}/`, year)).join('<br>');
			res.end(data.replace('%years%', year_html));
		}).catch(err => {
			console.error(err);
			res.end("Server Error");
		});
	}
	else {
		if(!req.url.includes('.')) {
			if(!req.url.endsWith('/')) req.url += '/';
			req.url += 'index.html';
		}

		const ext = req.url.slice(req.url.lastIndexOf('.') + 1);

		pfs.readFile(`.${req.url}`).then(data => {
			if(ext in mimes)
				res.setHeader("Content-Type", mimes[ext]);

			res.writeHead(200);
			res.end(data);
		}).catch(err => {
			if(err.code === 'ENOENT') {
				res.writeHead(404);
				res.end("File Not Found");
			}
			else {
				console.error("Read Error:", err);
				res.writeHead(500);
				res.end("Internal Server Error");
			}
		});
	}
}


const [host='localhost', port='8080'] = process.argv[2]?.split(':').map(s => s === "" ? undefined : s) ?? [];

const server = http.createServer(request);
server.listen(port, host, () => {
	console.log(`Listening at ${host}:${port}`);
});
