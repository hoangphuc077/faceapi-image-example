const video = document.getElementById('video')
Promise.all(
    [
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')

        

    ]
).then(startVideo)
function startVideo(){
    navigator.getUserMedia(
        { video :{} },
        stream => video.srcObject = stream,
        error => console.error(error)
    )
}

video.addEventListener('play', () =>{
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const size = {width: video.width, height: video.height}
    faceapi.matchDimensions(canvas, size)

    setInterval(async () =>{
    const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceExpressions();
    const resizeDetections = faceapi.resizeResults(detections,size)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizeDetections)
    // faceapi.draw.drawFaceLandmarks(canvas, resizeDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizeDetections)
    }, 50)
})