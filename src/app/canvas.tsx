"use client";

import { useEffect, useRef } from "react";
import { createProgramWithShaders } from "@/webgl/utils/program";
import { Rectangle } from "@/webgl/models/rectangle";
import { Color } from "@/webgl/models/primitives/color";

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setupWebGL();
  }, []);

  function setupWebGL() {
    console.log("Setting up WebGL");
    if (!canvasRef.current) {
      console.error("Canvas not found");
      return;
    }

    let gl = canvasRef.current.getContext("webgl2");

    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    let program = createProgramWithShaders(gl);

    if (!program) {
      console.error("Failed to create program");
      return null;
    }

    const canvas = canvasRef.current;
    canvas.addEventListener("click", (event) => {
      console.log("Canvas clicked", event);

      if (!gl || !program) {
        console.error("WebGL not setup");
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      drawGeometry(gl, program, x, y, 50, 50);
    });

    console.log("WebGL setup complete");
  }

  function drawGeometry(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");

    // lookup uniforms
    var colorLocation = gl.getUniformLocation(program, "u_color");
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");

    // Create a buffer to put positions in
    var positionBuffer = gl.createBuffer();

    if (!colorLocation || !matrixLocation || !positionBuffer) {
      console.error("Failed to get location");
      return;
    }

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const rectangle = new Rectangle(x, y, width, height);
    // Put geometry data into buffer
    rectangle.setGeometry(gl);

    var translation = [0, 0];
    var angleInRadians = 0;
    var scale = [1, 1];
    var color = new Color(Math.random(), Math.random(), Math.random(), 1);

    rectangle.draw(
      gl,
      program,
      positionBuffer,
      {
        positionLocation,
        colorLocation,
        matrixLocation,
      },
      {
        color,
        translation,
        angleInRadians,
        scale,
      }
    );
  }

  return (
    <canvas
      ref={canvasRef}
      id="webgl-canvas"
      className="w-full h-full bg-white"
    />
  );
}
