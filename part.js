var http = require('http');


var server = http.createServer(function(req, res){
	var url = req.url;
	if(url.indexOf('?')>-1){
        // let dateFormat = ['Date','Open','High','Low','Close','Volume', 'Ask', 'Bid'];
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end();
        let dataUrl = decodeURI(url);
        let allData = dataUrl.split('?')[1];
        let thenData = allData.split(',');
        // let timestamp = Date.parse(new Date(thenData[0]));//获取时间
        // thenData[0] = dateFormate(timestamp);
        thenData.splice(-1, 1);
        // let singleData = {};
        // singleData[dateFormat[0]] = thenData[0];
        // singleData[dateFormat[1]] = thenData[1];
        // singleData[dateFormat[2]] = thenData[2];
        // singleData[dateFormat[3]] = thenData[3];
        // singleData[dateFormat[4]] = thenData[4];
        // singleData[dateFormat[5]] = thenData[5];
        // singleData[dateFormat[6]] = thenData[6];
        // singleData[dateFormat[7]] = thenData[7];
        // console.log(singleData);
        // console.log(thenData);
        // machineData.push(thenData);
        // for(let i=0; i<machineData.length; i++){
        //     oldData.push(machineData[i]);
        // }
        process.send(thenData);
    }
});

server.listen('80', function () {
    console.log('part server running at 80');
});