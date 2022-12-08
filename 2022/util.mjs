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
