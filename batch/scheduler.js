require('./base.js');

var debug = process.argv[2];

if (debug === 'debug')
{
	// For debug
	setTimeout(load('batch.job.DataExtractor'), 0);
}
else
{
	// 24 hours
	setInterval(load('batch.job.DataExtractor'), 24*3600*1000);	
}
