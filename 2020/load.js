window.addEventListener('load', async () => {
	await Renderer.init();
	await Textures.init();

	Ground.init();

	await Main.init();

	// Sample scripts
	// await SampleRenderColor.init();
	// await SampleRenderImage.init();
});
