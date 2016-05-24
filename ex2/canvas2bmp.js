function getImageData(canvas){
    var context = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;
    var imageData = context.getImageData(0, 0, width, height);
    return imageData;
}
function createBMP(imageData) {
    var data = imageData.data;
    var width=imageData.width;
    var height=imageData.height;
    //create pixel array from canvas based on alpha :(data.length - 1)
    //green:(data.length - 3)
    var pixels = [];
    for (var i = data.length - 3; i > 0; i -= 4) { 
        if (i > 0) {
            if (data[i] > 125) {
                pixels.push("000000");
            } else {
                pixels.push("ffffff");
            }
        }
    }

    //unmirror
    var pixarray = [];
    for (var i = height - 1; i > -1; i--) {
        var row = [];
        for (var j = 0; j < width; j++) {
            row.push(pixels[(i * width) + j]);
        }
        for (var j in row) {
            pixarray.push(row[j]);
        }
    }
    pixarray.reverse();

    return bmp_mono(width, height, pixarray);
}

/*
Create an uncompressed Windows bitmap (monochrome) given width, height and an
array of pixels.

Pixels should be in BMP order, i.e. starting at the bottom left, going up
one row at a time.
*/
function bmp_mono(width, height, pixarray, palette) {
var rowsize = Math.ceil(width / 8);
var rowpadding = 4 - (rowsize % 4);
if (typeof palette == 'undefined')
    palette = ['000000', 'ffffff'];

var j, pix, mod;
pixarray.reverse();
var pixels = [];
var b = 0;
for (var i=0; i<height; ++i) {
    row = [];
    for (j=0; j<width; ++j) {
        mod = j % 8;
        pix = pixarray.pop();
        if (parseInt(pix, 16) != 0) {
            b = b | Math.pow(2, 7-mod);
        }
        if (mod == 7 || j == width-1) {
            pixels.push(String.fromCharCode(b));
            b = 0;
        }
    }
    for (j=0; j<rowpadding; ++j) {
        pixels.push("\x00");
    }
}
return _bmp(width, height, palette, pixels.join(""), 1, 0);
}

function datauri( data) {
    return "data:" + "image/bmp"
                   + ";base64,"
                   + btoa(data);
}