var http = require('http');


var server = http.createServer(function(req, res){

});

server.listen('8081', function () {
    console.log('machine server running at 8081');
});


var machineData = [];
process.on('message', function(data){
	if(data.length>0){
		for(let i=0;i<data.length; i++){
			machineData[i] = data[i];
		}
	}
});


var num_inputs = 27;
var num_actions = 3;
var actions = ['BUY','SELL','NOTHING'];
var temporal_window = 1;
var network_size = num_inputs*temporal_window + num_actions*temporal_window + num_inputs;


var layer_defs = [];
layer_defs.push({type:'input', out_sx:1, out_sy:1, out_depth: network_size});
layer_defs.push({type:'fc', num_neurons: 50, activation: 'relu'});
layer_defs.push({type:'fc', num_neurons:50, activation: 'relu'});
layer_defs.push({type:'regression', num_neurons: num_actions});
var tdtrainer_options = {learning_rate:0.001, momentum:0.0, batch_size:64, l2_decay:0.01};

var opt = {};
opt.temporal_window = temporal_window;
opt.experience_size = 30000;
opt.start_learn_threshold = 1000;
opt.gamma = 0.7;
opt.learning_steps_total = 200000;
opt.learning_steps_bumin = 3000;
opt.epsilon_min = 0.05;
opt.epsilon_test_time = 0.05;
opt.layer_defs = layer_defs;
opt.tdtrainer_options = tdtrainer_options;

var brain = new deepqlearn.Brain(num_inputs, num_actions);
var numberOfTrades = null;
var numberOfActualTrades = null;
var totalRewards = 0;
var positiveTrades = 0;
var batchSize = 5;
var i = 0;

var processData = function(){

            if(numberOfTrades<machineData.length && numberOfTrades+ batchSize<machineData.length){
                i++;
                console.log("count:", i);
                var arry = [];
                for(var j = numberOfTrades; j<machineData.length&&j<batchSize+numberOfTrades; j++){
                    arry.push(machineData[j]);
                }
                var reward = 0;
                var action = brain.forward(arry);
                console.log("j=" + j);
                if(j < machineData.length){
                    if(actions[action] == 'BUY'){
                        numberOfActualTrades += 1;
                        reward += parseFloat(machineData[j][5] - machineData[j][2]);
                    }
                    if(actions[action] == 'SELL'){
                        numberOfActualTrades += 1;
                        reward += parseFloat(machineData[j][5] - machineData[j][2]);
                    }
                    if(reward>0){
                        positiveTrades += 1;
                    }
                    numberOfTrades += 1;
                    brain.backward(reward);
                    console.log('numberOfTrades is ' + numberOfTrades);
                    console.log('numberOfActualTrades is ' + numberOfActualTrades);
                    console.log('positiveTrades is ' + positiveTrades);
                }
                else{
                    numberOfTrades = 0;
                }
            }
            setTimeout(processData, 1000);
        }

processData();