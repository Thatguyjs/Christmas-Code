export const el = document.querySelector.bind(document);
export const els = document.querySelectorAll.bind(document);

export async function create_program(gl, shader_path) {
	return twgl.createProgramInfo(gl, await shader_sources(shader_path));
}

export async function shader_sources(path) {
	const sources = await Promise.all([
		fetch(path + '.vert'),
		fetch(path + '.frag')
	]);

	return await Promise.all([
		sources[0].text(),
		sources[1].text()
	]);
}

export function array_template(template) {
	let arrays = {};

	for(let t in template) {
		if(template[t] > 0)
			arrays[t] = { numComponents: template[t], data: null };
		else
			arrays[t] = null;
	}

	return arrays;
}

export function lerp(from, to, amt) {
	return (to - from) * amt + from;
}
