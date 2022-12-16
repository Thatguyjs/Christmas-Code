import { create_program, array_template, lerp } from "../util.mjs";
import Mesh from "../mesh.mjs";


const RoadMesh = {
	program: null,
	mesh: null,
	arrays: array_template({ position: 3, color: 4, indices: null })
};
