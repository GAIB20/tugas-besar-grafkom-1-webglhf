import vertexShaderSource from "raw-loader!../shaders/vertex-shaders.glsl";
import fragmentShaderSource from "raw-loader!../shaders/fragment-shaders.glsl";

export function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
) {
  let shader = gl.createShader(type);

  if (!shader) {
    throw new Error("Could not create WebGL shader");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

export function createVertexShader(gl: WebGLRenderingContext) {
  return createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
}

export function createFragmentShader(gl: WebGLRenderingContext) {
  return createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
}
