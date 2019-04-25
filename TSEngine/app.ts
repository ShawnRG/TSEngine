
var engine: TSE.Engine;

window.onload = function () {
    engine = new TSE.Engine();
    engine.start();
    engine.resize();
}

window.onresize = function () {
    engine.resize();
}