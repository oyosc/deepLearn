/**
 * Created by Administrator on 2017/3/29.
 */
var http = require('http');
var fs = require('fs');
var convnetjs = require('./js/convnet')
var deepqlearn = require('./js/deepqlearn')
var path = require('path');


const staticPath = path.join(__dirname)

function getStaticFileStream(url, cb){
    let filePath = staticPath + url;
    fs.stat(filePath, (err, stats)=>{
        if(err) return cb(err);
    cb(null, fs.createReadStream(filePath));
});
}

var oldData = [];
var machineData = [];

function dateFormate(t){
    let time = new Date(t);
    let year = time.getFullYear().toString();
    year = year.substr(2, 2);
    let m=new Array("Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Spt","Oct","Nov","Dec");
    let month =m[time.getMonth()];
    let day = time.getDate();
    let h = time.getHours() +1;
    let minute = time.getMinutes();
    let date = day + '-' + month + '-' + year + '-' +h + '-' + minute;
    return date;
}

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

var server = http.createServer(function(req, res){
                var url = req.url;
                if(url.indexOf('*')>-1){
                    if(oldData.length == 0){
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        let test = [{"Date":"31-Mar-17","Open":"1.000270","High":"1.000270","Low":"1.000270","Close":"1.000270","Volume":"1.000000","Ask":"1.000340","Bid":"1.000270"}
                            ];

                        for(let i=0; i<machineData.length; i++){
                            oldData.push(machineData[i]);
                        }

                        let testData = {
                            data: JSON.stringify(test),
                            numberOfTrades: numberOfTrades,
                            numberOfActualTrades: numberOfActualTrades,
                            positiveTrades: positiveTrades
                            
                        };
                        let allData = {
                            data: JSON.stringify(oldData),
                            numberOfTrades: numberOfTrades,
                            numberOfActualTrades: numberOfActualTrades,
                            positiveTrades: positiveTrades
                        }

                        res.write(JSON.stringify(allData));
                        res.end();
                        oldData.splice(0, oldData.length);
                    }else{
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end();
                    }
                }
                else{
                    switch(url){
                        case '/':
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            getStaticFileStream('/index.html', (err, stream) => {
                                if (err) {
                                    res.writeHead(404);
                                    return res.end('Not Found!');
                                }
                                stream.pipe(res);
                            });
                            break;
                        default:
                            getStaticFileStream(url, (err, stream) => {
                                if (err) {
                                    res.writeHead(404);
                                    return res.end('Not Found!');
                                }
                                stream.pipe(res);
                            });
                            break;
                    }
                }

});


server.listen('8080', function () {
    console.log('http server running at 8080');
});


const child_process = require('child_process');
const partPath = path.join(__dirname, '/part.js');
// const machinePath = path.join(__dirname, '/machine.js');
let childProcess = child_process.fork(partPath);
// let machineCProcess = child_process.fork(machinePath);

childProcess.on('exit', ()=>{
        childProcess.kill();
    });

// machineCProcess.on('exit', function(){
//     machineCProcess.kill();
// });

childProcess.on('message', function(data){
    machineData.push(data);
})







