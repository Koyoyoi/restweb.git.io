import { ctx } from "./main.js";

export function drawGesture(gesture) {
    
    // 設定字型與顏色
    ctx.font = "100px Arial";
    ctx.fillStyle = "#00AA90";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    // 畫出手勢文字
    ctx.fillText(`${gesture}`, 50, 50);  // 位置設為左上角，距離 canvas 
}
