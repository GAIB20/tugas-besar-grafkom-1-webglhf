import { resizeCanvasToDisplaySize } from "../utils";
import { TransformationMatrix3 } from "../utils/transformation";
import { Color } from "./primitives/color";
import { Matrix3 } from "./primitives/matrix";

export abstract class Model {
  abstract toMatrix3(): Matrix3;

  abstract getCount(): number;

  abstract setGeometry(gl: WebGL2RenderingContext): void;

  abstract getType(): string;

  // Draw the scene.
  draw(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    attributes: {
      positionBuffer: WebGLBuffer;
      positionLocation: number;
      colorLocation: WebGLUniformLocation;
      matrixLocation: WebGLUniformLocation;
    },
    options: {
      color: Color;
      translation: number[];
      angleInRadians: number;
      scale: number[];
    } = {
      color: new Color(0, 0, 0, 1),
      translation: [0, 0],
      angleInRadians: 0,
      scale: [1, 1],
    }
  ) {
    resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas.
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(attributes.positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, attributes.positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2; // 2 components per iteration
    var type = gl.FLOAT; // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      attributes.positionLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // set the color
    gl.uniform4fv(attributes.colorLocation, options.color.toArray());

    // Compute the matrices
    var projectionMatrix = TransformationMatrix3.projection(
      gl.canvas.width,
      gl.canvas.height
    );
    var translationMatrix = TransformationMatrix3.translation(
      options.translation[0],
      options.translation[1]
    );
    var rotationMatrix = TransformationMatrix3.rotation(options.angleInRadians);
    var scaleMatrix = TransformationMatrix3.scaling(
      options.scale[0],
      options.scale[1]
    );

    // p' = Tp
    var matrix = scaleMatrix
      .multiply(rotationMatrix)
      .multiply(translationMatrix)
      .multiply(projectionMatrix)
      .flatten();

    // Set the matrix.
    gl.uniformMatrix3fv(attributes.matrixLocation, false, matrix);

    // Draw the geometry.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = this.getCount();
    gl.drawArrays(primitiveType, offset, count);
  }
}
