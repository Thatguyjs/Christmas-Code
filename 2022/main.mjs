import { el } from "./util.mjs";


const cnv = el('canvas');
const gl = cnv.getContext('webgl2');

console.log("Got context:", gl);
