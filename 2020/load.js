window.addEventListener('load', async () => {
	await Renderer.init();
	await Textures.init();

	await Main.init();

	// Sample scripts
	// await SampleRenderColor.init();
	// await SampleRenderImage.init();
});
