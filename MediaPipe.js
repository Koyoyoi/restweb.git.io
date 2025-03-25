import { HandLandmarker, FilesetResolver, DrawingUtils } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";
import { compute, fingerPlay } from "./handCompute.js";

// 宣告全域變數
let video, canvas, ctx, handLandmarker, drawingUtils;
let handData = { "Left": [], "Right": [] };

// 設置攝影機並取得影像流
async function setupCamera() {
    video = document.createElement("video");
    video.style.display = "none";
    document.body.appendChild(video);

    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            video.play();
            resolve(video);
        };
    });
}

// 設置 HandLandmarker 手部偵測模型
async function setupHandLandmarker() {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "./models/MediaPipe/hand_landmarker.task",
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
    });
}

// 設置畫布（Canvas）以便繪製手部偵測結果
function setupCanvas() {
    canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    drawingUtils = new DrawingUtils(ctx);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
}

// 偵測手部並繪製標記
async function detectHands() {
    if (!handLandmarker) return;

    let results = handLandmarker.detectForVideo(video, performance.now());
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const landmarks = results.landmarks;
    const handednesses = results.handednesses;

    for (let i = 0; i < handednesses.length; i++) {
        let points = [];
        let left_or_right = String(handednesses[i][0].categoryName);
        for (let p of landmarks[i]) {
            p = [p.x * video.videoWidth, p.y * video.videoHeight, p.z];
            points.push(p);
        }
        handData[left_or_right] = points;
    }

    if (handData['Left'].length !== 0) {
        let parameters = compute(handData['Left']);
        console.log(parameters);
        // 在此處進行手勢預測（可選）
    }

    handData['Left'].length = 0;
    handData['Right'].length = 0;

    requestAnimationFrame(detectHands);
}

// 主函式，負責初始化所有功能
async function main() {
    await setupCamera(); // 啟動攝影機
    await setupHandLandmarker(); // 載入手部偵測模型
    setupCanvas(); // 設置畫布
    detectHands(); // 啟動手部偵測
}

// 執行程式
main();
