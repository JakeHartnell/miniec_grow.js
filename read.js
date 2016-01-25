var five = require('johnny-five');
//var GrowJSInstance = require('grow.js');

//var grow = new GrowJSInstance();

//grow.connect(function(error, data) {
//
//});

/**
 * TODO: get the conversion function working
 * Helpful resources:
 * C++ library
 *  https://github.com/SparkysWidgets/SW_MiniLab-Library/blob/master/SW_MiniLib.cpp
 * Arduino code
 *  https://github.com/SparkysWidgets/MinieCBFW/blob/master/MinieC.ino
 * C++ code for reading from ADC on the Mini eC
 *  https://github.com/SparkysWidgets/MCP3221-Library/blob/master/MCP3221.cpp
 */

var I2Caddress = 0x4c;
var I2CReadRate = 2000; // ms between reads

// constants for the mini eC board
// voltage of oscillator output after voltage divider in millivolts
var _oscV = 185;
//set our Kcell constant basically our microsiemens conversion 10-6 for 1 10-7 for 10 and 10-5 for .1
var _kCell = 1.0;
//this is the measured value of the R9 resistor in ohms
var _Rgain = 3000.0; 
var _I2CadcVRef = 4948;

var _calcEC = function(rawval) {
    var tempmv = (rawval / 4095) * _I2CadcVRef;
    var tempgain = (tempmv / _oscV) - 1.0;
    var rprobe = (_Rgain / tempgain);
    var temp = ((1000000) * _kCell) / rprobe;
    return temp;
}

// TODO: change the port depending on your computer. If on mac, this can probably be elided
var board = new five.Board({port: "/dev/ttyACM2"});

board.on("ready", function start() {
    console.log("readY!");
    this.samplingInterval(I2CReadRate);
    this.i2cConfig();
    this.i2cRead(I2Caddress, 0x00, 2, function(bytes) {
        // TODO: check if it is msb/lsb or lsb/msb 
        var msb = bytes[1];
        var lsb = bytes[0];
        var rawi2c = (msb << 8) + lsb;
        console.log("uSiemens", _calcEC(rawi2c));
    });
});
