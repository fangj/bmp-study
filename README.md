# bmp-study
study how to convert canvas to monochrome bitmap


base64-js:

https://github.com/beatgammit/base64-js.git

bmp-js:

https://github.com/shaozilee/bmp-js.git

node-bitmap:

https://github.com/nowelium/node-bitmap

mono-bitmap
https://github.com/vonderheide/mono-bitmap

Draw Bitmap From Int Array
Generate a monochrome bitmap image in JavaScript using a byte-array. The image is generated such that every bit in the array is shown as either a black (1) or white (0) pixel.
Raw
https://gist.github.com/vukicevic/8112515

http://stackoverflow.com/questions/6997723/save-html5-canvas-as-monochrome-bmp
http://rephrase.net/box/bitmap/

格式说明
http://www.pcschool.com.tw/campus/share/lib/160/
http://crazycat1130.pixnet.net/blog/post/1345538

What does 10001110101 mean in binary?
faux-binary

jsbmp
http://rephrase.net/box/bitmap/jsbmp.js

JAVASCRIPT
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView

NODE BUFFER
https://nodejs.org/api/buffer.html

base64
https://developer.mozilla.org/zh-CN/docs/Web/API/WindowBase64/Base64_encoding_and_decoding

btoa,atob针对String
用TypedArray :使用base64-js.

https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode

String.fromCharCode()  16bit
String.fromCodePoint() 32bit

ES5提供String.fromCharCode方法，用于从码点返回对应字符，但是这个方法不能识别32位的UTF-16字符（Unicode编号大于0xFFFF）。


