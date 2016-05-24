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

// Atkinson thanks to https://github.com/ticky/canvas-dither/blob/master/canvas-image-worker.js
// Flickr's Atkinson was easy to understand but melted with some fps https://github.com/flickr/FlickrDithr/blob/master/dither.js
// Bayer parsed from http://en.wikipedia.org/wiki/Ordered_dithering

// var bayerMap = [
//   [  1,  9,  3, 11 ],
//   [ 13,  5, 15,  7 ],
//   [  4, 12,  2, 10 ],
//   [ 16,  8, 14,  6 ]
// ];

var bayerThresholdMap = [
  [  15, 135,  45, 165 ],
  [ 195,  75, 225, 105 ],
  [  60, 180,  30, 150 ],
  [ 240, 120, 210,  90 ]
];

var lumR = [];
var lumG = [];
var lumB = [];
for (var i=0; i<256; i++) {
  lumR[i] = i*0.299;
  lumG[i] = i*0.587;
  lumB[i] = i*0.114;
}

function monochrome(imageData, threshold, type){

  var imageDataLength = imageData.data.length;

  // Greyscale luminance (sets r pixels to luminance of rgb)
  for (var i = 0; i <= imageDataLength; i += 4) {
    imageData.data[i] = Math.floor(lumR[imageData.data[i]] + lumG[imageData.data[i+1]] + lumB[imageData.data[i+2]]);
  }

  var w = imageData.width;
  var newPixel, err;

  for (var currentPixel = 0; currentPixel <= imageDataLength; currentPixel+=4) {

    if (type === "none") {
      // No dithering
      imageData.data[currentPixel] = imageData.data[currentPixel] < threshold ? 0 : 255;
    } else if (type === "bayer") {
      // 4x4 Bayer ordered dithering algorithm
      var x = currentPixel/4 % w;
      var y = Math.floor(currentPixel/4 / w);
      var map = Math.floor( (imageData.data[currentPixel] + bayerThresholdMap[x%4][y%4]) / 2 );
      imageData.data[currentPixel] = (map < threshold) ? 0 : 255;
    } else if (type === "floydsteinberg") {
      // Floyd–Steinberg dithering algorithm
      newPixel = imageData.data[currentPixel] < 129 ? 0 : 255;
      err = Math.floor((imageData.data[currentPixel] - newPixel) / 16);
      imageData.data[currentPixel] = newPixel;

      imageData.data[currentPixel       + 4 ] += err*7;
      imageData.data[currentPixel + 4*w - 4 ] += err*3;
      imageData.data[currentPixel + 4*w     ] += err*5;
      imageData.data[currentPixel + 4*w + 4 ] += err*1;
    } else {
      // Bill Atkinson's dithering algorithm
      newPixel = imageData.data[currentPixel] < 129 ? 0 : 255;
      err = Math.floor((imageData.data[currentPixel] - newPixel) / 8);
      imageData.data[currentPixel] = newPixel;

      imageData.data[currentPixel       + 4 ] += err;
      imageData.data[currentPixel       + 8 ] += err;
      imageData.data[currentPixel + 4*w - 4 ] += err;
      imageData.data[currentPixel + 4*w     ] += err;
      imageData.data[currentPixel + 4*w + 4 ] += err;
      imageData.data[currentPixel + 8*w     ] += err;
    }

    // Set g and b pixels equal to r
    imageData.data[currentPixel + 1] = imageData.data[currentPixel + 2] = imageData.data[currentPixel];
  }

  return imageData;
}

/* jsbmp

Create bitmap files using JavaScript. The use-case this was written
for is to create simple images which can be provided in `data` URIs.

Copyright (c) 2009 Sam Angove <sam [a inna circle] rephrase [period] net>

License: MIT

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
Create the binary contents of a bitmap file.

This is not a public interface and is subject to change.

Arguments:

    width -- width of the bitmap
    height -- height of the bitmap
    palette -- array of 'rrggbb' strings (if appropriate)
    imgdata -- pixel data in faux-binary escaped text
    bpp -- bits per pixel; use in conjunction with compression
    compression -- compression mode (e.g. uncompressed, 8-bit RLE, 4-bit RLE)
*/
function _bmp(width, height, palette, imgdata, bpp, compression) {

    var imgdatasize = imgdata.length;
    var palettelength = palette.length;
    var palettesize = palettelength * 4; // 4 bytes per colour
    var filesize = 64 + palettesize + imgdatasize; // size of file
    var pixeloffset = 54 + palettesize; // pixel data offset
    var data = [
        "BM",                                 // magic number
        _pack(width),      // size of file
        "\x00\x00\x00\x00",               // unused
        _pack(pixeloffset),   // number of bytes until pixel data
        "\x28\x00\x00\x00",               // number of bytes left in the header
        _pack(width),         // width of pixmap
        _pack(height),        // height of pixmap
        "\x01\x00",                         // number of colour planes, must be 1
        _pack(bpp, 2),           // bits per pixel
        _pack(compression),   // compression mode
        _pack(imgdatasize),   // size of raw BMP data (after the header)
        "\x13\x0B\x00\x00",               // # pixels per metre horizontal res.
        "\x13\x0B\x00\x00",               // # pixels per metre vertical res
        _pack(palettelength), // num colours in palette
        "\x00\x00\x00\x00"                // all colours are important

        // END OF HEADER
     ];

    for (var i=0; i<palette.length; ++i) {
        data.push(_pack(parseInt(palette[i], 16)));
    }
    data.push(imgdata);
    return data.join("");
}
/*
Pack JS integer (signed big-endian?) `num` into a little-endian binary string
of length `len`.
*/
function _pack(num, len) {
    var o = [], len = ((typeof len == 'undefined') ? 4 : len);
    for (var i=0; i<len; ++i) {
        o.push(String.fromCharCode((num >> (i * 8)) & 0xff));
    }
    return o.join("");
}


/*
Create an uncompressed Windows bitmap (BI_RGB) given width, height and an
array of pixels.

Pixels should be in BMP order, i.e. starting at the bottom left, going up
one row at a time.

Example:

    var onebluepixel = bmp(1, 1, ['0000ff']);
*/
function bmp_rgb(width, height, pixarray) {
    var rowsize = (width * 3);
    var rowpadding = (rowsize % 4);
    if (rowpadding) rowpadding = Math.abs(4 - rowpadding);
    var imgdatasize = (rowsize + rowpadding) * height;

    var i, j, pix;
    var pixcache = {};
    // Based on profiling, it's more than 10x faster to reverse the array
    // and pop items off the end than to shift them of the front. WTF.
    pixarray.reverse();
    var pixels = [];
    for (i=0; i<height; ++i) {
        for (j=0; j<width; ++j) {
            pix = pixarray.pop();
            if (typeof pixcache[pix] == 'undefined')
                pixcache[pix] = _pack(parseInt(pix, 16), 3);
            pixels.push(pixcache[pix]);
        }
        for (j=0; j<rowpadding; ++j) {
            pixels.push("\x00");
        }
    }
    return _bmp(width, height, [], pixels.join(""), 24, 0);
}


/*
Create a Windows bitmap encoded with 8-bit run-length encoding (BI_RLE8)
given width, height and an array of [colour, runlength] pairs.

Pixels should be in BMP order, i.e. starting at the bottom left, going up
one row at a time.

Example:

    var twothousandbluepixels = bmp(2000, 1, ['0000ff', 2000]);
*/
function bmp_rle8(width, height, pixarray) {
    // Based on profiling, it's more than 10x faster to reverse the array
    // and pop items off the end than to shift them of the front. WTF.
    pixarray.reverse();
    var pixcache = {};
    var palette = [];
    var pixels = [], linelen, run, colour, runlength;
    for (var i=0; i<height; ++i) {
        linelen = 0;
        while (linelen < width) {
            run = pixarray.pop();
            colour = run[0];
            runlength = run[1];
            // Length has to fit in one byte, so split into multiple blocks
            // if the run is too long.
            if (runlength > 255) {
                pixarray.push([colour, runlength-255]);
                runlength = 255;
            }
            if (typeof pixcache[colour] == 'undefined') {
                pixcache[colour] = _pack(palette.length, 1);
                palette.push(colour);
            }
            pixels.push(_pack(runlength, 1));
            pixels.push(pixcache[colour]);
            linelen += runlength;
        }
        // end of line marker
        pixels.push('\x00\x00');
    }
    pixels.push('\x00\x01');
    return _bmp(width, height, palette, pixels.join(""), 8, 1);
}

function canvas2based64monobitmap(canvas,threshold,type){
      if(threshold ===undefined){
        threshold='0.5';
      }
      var imgdata=getImageData(canvas);
      var imgdata2=monochrome(imgdata,threshold,type);
      var bmp2=createBMP(imgdata2);
      return btoa(bmp2);
}