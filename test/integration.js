/*jshint expr: true*/

var request = require('request');
var FormData = require('form-data');
var expect = require('chai').expect;
var spawn = require('child_process').spawn;

var PORT = 3000;
var bowerServerUrl = 'http://localhost:' + PORT;

describe('registry server', function(){
    var server = null;

    before(function(done){
        process.env.PORT = PORT;
        server = spawn('node', ['index.js']);
        server.stdout.on('data', function(data){
            if (data.toString() === 'ready.\n') {                
                done();
            }
        });
    });

    after(function(){
        server.kill();
    });

    describe('headers', function() {
        it('should support CORS', function (done) {
            request.get(bowerServerUrl + '/status', function (err, res, body){
                expect(res.headers['access-control-allow-origin']).not.to.be.null;
                done();
            });
        });
    });

    describe('routes', function() {

        it('should support /status', function (done) {
            request.get(bowerServerUrl + '/status', function (err, res, body){
                expect(res.statusCode).to.equal(200);
                done();
            });
        });

        describe('packages', function(){

            it('should return database error before psql is setup', function (done) {
                request.get(bowerServerUrl + '/packages', function (err, res, body){
                    expect(res.statusCode).to.equal(500);
                    done();
                });
            });

            // curl -F uses multipart, we want to make sure we keep curl functionality
            it('should support curl', function (done) {
                //code checks github to make sure the url is valid, we should give it some time.
                this.timeout(3000);
                var form = new FormData();
                form.append('url', 'git://github.com/jquery/jquery.git');
                form.append('name','jquery');
                form.submit(bowerServerUrl + '/packages', function(err, res) {
                    // We expect a 403 because it is a valid url and the db is not setup
                    // We get a 500 if multipart is not instantiated in index
                    expect(res.statusCode).to.equal(403);
                    done();
                });
            });

        });
    });
});
