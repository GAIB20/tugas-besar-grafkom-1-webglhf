import { createFragmentShader, createVertexShader } from "./shader";

export function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) {
  let program = gl.createProgram();

  if (!program) {
    throw new Error("Could not create WebGL program");
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  let success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

export function createProgramWithShaders(gl: WebGLRenderingContext) {
  let vertexShader = createVertexShader(gl);
  let fragmentShader = createFragmentShader(gl);

  if (!vertexShader || !fragmentShader) {
    return null;
  }

  return createProgram(gl, vertexShader, fragmentShader);
}
