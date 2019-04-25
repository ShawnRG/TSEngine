﻿namespace TSE {

    /**
     * The main game engine class.
     * */
    export class Engine {

        private _canvas: HTMLCanvasElement;
        private _shader: Shader;

        private _buffer: WebGLBuffer;

        /**
         * Creates a new engine.
         * */
        public constructor() {
            console.log('Engine initialising...');
        }

        /**
         * Starts up the engine.
         * */
        public start(): void {

            this._canvas = GLUtilities.initialize();

            gl.clearColor(0, 0, 0, 1);

            this.loadShaders();
            this._shader.use();

            this.createBuffer();

            this.loop();
        }

        /**
         * Resizes the canvas to fit the window.
         * */
        public resize(): void {
            if (this._canvas !== undefined) {
                this._canvas.width = window.innerWidth;
                this._canvas.height = window.innerHeight;

                gl.viewport(0, 0, this._canvas.width, this._canvas.height);
            }
        }

        private loop(): void {
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);

            let positionLocation = this._shader.getAttributeLocation("a_position");

            gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(positionLocation);


            gl.drawArrays(gl.TRIANGLES, 0, 3);

            requestAnimationFrame(this.loop.bind(this));
        }

        private createBuffer(): void {
            this._buffer = gl.createBuffer();
            let verticies = [
                0, 0, 0,
                0, 0.5, 0,
                0.5, 0.5, 0

            ];

            gl.bindBuffer(gl.ARRAY_BUFFER, this._buffer);

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticies), gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, undefined);

            let positionLocation = this._shader.getAttributeLocation("a_position");
            gl.disableVertexAttribArray(positionLocation);
        }

        private loadShaders(): void {
            let vertexShaderSource = `
attribute vec3 a_position;

void main() {
    gl_Position = vec4(a_position, 1.0);
}`;

            let fragmentShaderSource = `
precision mediump float;

void main() {
    gl_FragColor = vec4(1.0);
}
`;

            this._shader = new Shader("basic", vertexShaderSource, fragmentShaderSource);
        }
    }
}