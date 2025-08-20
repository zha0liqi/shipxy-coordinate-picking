// ==UserScript==
// @name         船讯网
// @namespace    http://tampermonkey.net/
// @version      2025-08-15
// @description  try to take over the world!
// @author       You
// @match        https://www.shipxy.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=shipxy.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            alert('已复制到剪贴板');
        } catch (err) {
            alert(`复制失败:${err}`);
        }
    }

    const logDom = document.createElement('div')
    document.body.appendChild(logDom)
    function customLog(message) {
        logDom.innerText = message
    }

    let positions = []
    let result = []
    setTimeout(() => {
        const canvasBox = document.getElementById('mapbox')
        const canvasDom = document.querySelector('canvas.leaflet-layer')
        const indicationLayer = document.createElement('canvas')
        const context = indicationLayer.getContext('2d')
        indicationLayer.width = canvasDom.width
        indicationLayer.height = canvasDom.height
        indicationLayer.setAttribute('style', 'position:absolute;top:0;left:0;z-index:500')
        canvasBox.appendChild(indicationLayer)

        // 切换单位
        document.getElementsByClassName('leaflet-control-dms-change')[0].click()

        function clearDraw() {
            indicationLayer.width = canvasDom.width
            indicationLayer.height = canvasDom.height
        }

        function draw(posList) {
            clearDraw()
            for (let i = 0; i < posList.length; i++) {
                const [x, y] = posList[i]
                context.fillStyle = 'red'
                context.beginPath()
                context.arc(x, y, 3, 0, 2 * Math.PI)
                context.fill()
                if (i) {
                    const [beginX, beginY] = posList[i - 1]
                    context.beginPath()
                    context.moveTo(beginX, beginY)
                    context.lineTo(x, y)
                    context.stroke()
                }
            }
        }

        let isMouseDown = false;
        let isDragging = false;
        let startX, startY;

        indicationLayer.addEventListener("mousedown", (e) => {
            isMouseDown = true;
            isDragging = false;
            startX = e.clientX;
            startY = e.clientY - 50;
        });

        indicationLayer.addEventListener("mousemove", (e) => {
            if (!isMouseDown) return; // 只有鼠标按下时才检测拖动
            // customLog(e.clientX)
            // 判断鼠标是否有明显移动
            if (Math.abs(e.clientX - startX) > 3 || Math.abs(e.clientY - 50 - startY) > 3) {
                isDragging = true;
                // 这里可以执行拖动逻辑
                console.log("dragging...");
                const offsetX = e.clientX - startX
                const offsetY = e.clientY - 50 - startY
                draw(positions.map(([x, y]) => ([x + offsetX, y + offsetY])))
            }
        });

        indicationLayer.addEventListener("mouseup", (e) => {
            if (!isDragging) {
                // 没有拖动，算点击
                // alert("click");
                positions.push([e.clientX, e.clientY - 50])
                result.push(`${document.querySelector('.leaflet-control-mouseposition .lng').innerHTML}${document.querySelector('.leaflet-control-mouseposition .lat').innerHTML}`.match(/\d+\.?\d*/g).map(x => Number(x)))
                draw(positions)
            } else {
                // 有拖动，不执行 click
                // alert("drag end");
                const offsetX = e.clientX - startX
                const offsetY = e.clientY - 50 - startY
                positions = positions.map(([x, y]) => ([x + offsetX, y + offsetY]))
            }
            isMouseDown = false; // 松开后重置
        });

        document.addEventListener('keydown', function(e) {
            if (e.keyCode === 13) { // 回车键打印结果
                copyToClipboard(JSON.stringify(result))
            } else if (e.keyCode === 46) { // delete键清空结果
                result = []
                positions = []
                draw()
            }
        })
    }, 1000)
})();