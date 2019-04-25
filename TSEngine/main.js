var engine;
window.onload = function () {
    engine = new TSE.Engine();
    engine.start();
    engine.resize();
};
window.onresize = function () {
    engine.resize();
};
var TSE;
(function (TSE) {
    /**
     * The main game engine class.
     * */
    var Engine = /** @class */ (function () {
        /**
         * Creates a new engine.
         * */
        function Engine() {
            console.log('Engine initialising...');
        }
        /**
         * Starts up the engine.
         * */
        Engine.prototype.start = function () {
            this._canvas = TSE.GLUtilities.initialize();
            TSE.gl.clearColor(0, 0, 0, 1);
            this.loadShaders();
            this._shader.use();
            this.createBuffer();
            this.loop();
        };
        /**
         * Resizes the canvas to fit the window.
         * */
        Engine.prototype.resize = function () {
            if (this._canvas !== undefined) {
                this._canvas.width = window.innerWidth;
                this._canvas.height = window.innerHeight;
                TSE.gl.viewport(0, 0, this._canvas.width, this._canvas.height);
            }
        };
        Engine.prototype.loop = function () {
            TSE.gl.clear(TSE.gl.COLOR_BUFFER_BIT);
            TSE.gl.bindBuffer(TSE.gl.ARRAY_BUFFER, this._buffer);
            var positionLocation = this._shader.getAttributeLocation("a_position");
            TSE.gl.vertexAttribPointer(positionLocation, 3, TSE.gl.FLOAT, false, 0, 0);
            TSE.gl.enableVertexAttribArray(positionLocation);
            TSE.gl.drawArrays(TSE.gl.TRIANGLES, 0, 3);
            requestAnimationFrame(this.loop.bind(this));
        };
        Engine.prototype.createBuffer = function () {
            this._buffer = TSE.gl.createBuffer();
            var verticies = [
                0, 0, 0,
                0, 0.5, 0,
                0.5, 0.5, 0
            ];
            TSE.gl.bindBuffer(TSE.gl.ARRAY_BUFFER, this._buffer);
            TSE.gl.bufferData(TSE.gl.ARRAY_BUFFER, new Float32Array(verticies), TSE.gl.STATIC_DRAW);
            TSE.gl.bindBuffer(TSE.gl.ARRAY_BUFFER, undefined);
            var positionLocation = this._shader.getAttributeLocation("a_position");
            TSE.gl.disableVertexAttribArray(positionLocation);
        };
        Engine.prototype.loadShaders = function () {
            var vertexShaderSource = "\nattribute vec3 a_position;\n\nvoid main() {\n    gl_Position = vec4(a_position, 1.0);\n}";
            var fragmentShaderSource = "\nprecision mediump float;\n\nvoid main() {\n    gl_FragColor = vec4(1.0);\n}\n";
            this._shader = new TSE.Shader("basic", vertexShaderSource, fragmentShaderSource);
        };
        return Engine;
    }());
    TSE.Engine = Engine;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    /**
     * Responsible for setting up a WebGL rendering context.
     * */
    var GLUtilities = /** @class */ (function () {
        function GLUtilities() {
        }
        /**
         * Initializes WebGL, potentilly using the canvas with an assigned id matching the provided if it is defined.
         * @param elementId The id of the element to search for
         */
        GLUtilities.initialize = function (elementId) {
            var canvas;
            if (elementId !== undefined) {
                canvas = document.getElementById(elementId);
                if (canvas === undefined) {
                    throw new Error("Cannot find a canvas element named: " + elementId);
                }
            }
            else {
                canvas = document.createElement("canvas");
                document.body.appendChild(canvas);
            }
            TSE.gl = canvas.getContext("webgl");
            if (TSE.gl === undefined) {
                throw new Error("Unable to initialize WebGL");
            }
            return canvas;
        };
        return GLUtilities;
    }());
    TSE.GLUtilities = GLUtilities;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    /**
     * Represents a WebGL shader.
     * */
    var Shader = /** @class */ (function () {
        /**
         * Creates a new shader.
         * @param name The name of the shader.
         * @param vertextSource The source of the vertex shader.
         * @param fragmentSource The source of the fragment shader.
         */
        function Shader(name, vertextSource, fragmentSource) {
            this._attributes = {};
            this._name = name;
            var vertexShader = this.loadShader(vertextSource, TSE.gl.VERTEX_SHADER);
            var fragmentShader = this.loadShader(fragmentSource, TSE.gl.FRAGMENT_SHADER);
            this.createProgram(vertexShader, fragmentShader);
            this.detectAttributes();
        }
        Object.defineProperty(Shader.prototype, "name", {
            /**
             * The name of the shader.
             */
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Use this shader.
         * */
        Shader.prototype.use = function () {
            TSE.gl.useProgram(this._program);
        };
        /**
         * Gets the location of an attribute with the provided name.
         * @param name The name of the attribute whose location to retrieve.
         */
        Shader.prototype.getAttributeLocation = function (name) {
            if (this._attributes[name] === undefined) {
                throw new Error("Unable to find attribute named '" + name + "' in shader named '" + this._name + "'");
            }
            return this._attributes[name];
        };
        Shader.prototype.loadShader = function (source, shaderType) {
            var shader = TSE.gl.createShader(shaderType);
            TSE.gl.shaderSource(shader, source);
            TSE.gl.compileShader(shader);
            var error = TSE.gl.getShaderInfoLog(shader);
            if (error !== "") {
                throw new Error("Error compiling shader  '" + this._name + "': " + error);
            }
            return shader;
        };
        Shader.prototype.createProgram = function (vertexShader, fragmentShader) {
            this._program = TSE.gl.createProgram();
            TSE.gl.attachShader(this._program, vertexShader);
            TSE.gl.attachShader(this._program, fragmentShader);
            TSE.gl.linkProgram(this._program);
            var error = TSE.gl.getProgramInfoLog(this._program);
            if (error !== "") {
                throw new Error("Error linking shader  '" + this._name + "': " + error);
            }
        };
        Shader.prototype.detectAttributes = function () {
            var attributeCount = TSE.gl.getProgramParameter(this._program, TSE.gl.ACTIVE_ATTRIBUTES);
            for (var i = 0; i < attributeCount; ++i) {
                var attributeInfo = TSE.gl.getActiveAttrib(this._program, i);
                if (!attributeInfo) {
                    break;
                }
                this._attributes[attributeInfo.name] = TSE.gl.getAttribLocation(this._program, attributeInfo.name);
            }
        };
        return Shader;
    }());
    TSE.Shader = Shader;
})(TSE || (TSE = {}));
var TSE;
(function (TSE) {
    var GLBuffer = /** @class */ (function () {
        function GLBuffer(elementSize, dataType, targetBufferType, mode) {
            if (dataType === void 0) { dataType = TSE.gl.FLOAT; }
            if (targetBufferType === void 0) { targetBufferType = TSE.gl.ARRAY_BUFFER; }
            if (mode === void 0) { mode = TSE.gl.TRIANGLES; }
            this._data = [];
            this._elementSize = elementSize;
            this._dataType = dataType;
            this._targetBufferType = targetBufferType;
            this._mode = mode;
        }
        return GLBuffer;
    }());
    TSE.GLBuffer = GLBuffer;
})(TSE || (TSE = {}));
//# sourceMappingURL=main.js.map