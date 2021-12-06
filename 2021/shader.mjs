// Utilities to fetch WebGL shaders


export async function shader_source(path) {
	let base = location.href;
	if(base.endsWith('.html')) base = base.slice(0, base.lastIndexOf('/'));

	if(!base.endsWith('/')) base += '/';
	if(path.startsWith('/')) path = path.slice(1);

	return await (await fetch(base + path)).text();
}

// Uses `path`.vert and `path`.frag as the shader paths
export async function shader_array(path) {
	return [
		await shader_source(path + '.vert'),
		await shader_source(path + '.frag')
	];
}
