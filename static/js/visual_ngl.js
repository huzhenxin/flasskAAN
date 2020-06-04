var res = '';
var state;
stage = new NGL.Stage("viewport");
var schemeId = NGL.ColormakerRegistry.addSelectionScheme([
	["red", res],
	["#0d6aff", "*"]
]);
stage.loadFile("rcsb://1aki").then(function(component) {
	// add a "cartoon" representation to the structure component
	component.addRepresentation("cartoon", {color: schemeId});
	// provide a "good" view of the structure
	component.autoView();
});
stage.setParameters({
	backgroundColor: "white"
})
$("#btn01").click(function(component){
	res1 = "1 or 2";
	res2 = "3 or 4";
	schemeId = NGL.ColormakerRegistry.addSelectionScheme([
		["#ff8000", res1],
		["#00FFFF",res2],
		["#0d6aff", "*"]
	]);
	stage.loadFile('rcsb://1aki').then(function (component) {
	  component.addRepresentation('cartoon',{color: schemeId})
	  component.autoView()
	})
})